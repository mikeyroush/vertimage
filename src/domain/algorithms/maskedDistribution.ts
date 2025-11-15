/**
 * Vertex distribution algorithms that work within brightness masks
 */

import { Vertex, VertexDistributionParams, VertexCalculationResult } from '../types';
import { BrightnessMask, isPositionBright, getBrightRegions } from './brightnessMask';

export interface MaskedDistributionParams extends VertexDistributionParams {
  mask: BrightnessMask;
}

/**
 * Distributes vertices using adaptive grid density to maximize utilization in bright areas
 * Uses progressive density increase to reach target count while maintaining even distribution
 */
export function distributeMaskedVerticesGrid(
  params: MaskedDistributionParams
): VertexCalculationResult {
  const startTime = performance.now();
  const { width, height, count, margin, mask } = params;
  
  // Get all bright regions for focused distribution
  const brightRegions = getBrightRegions(mask);
  
  if (brightRegions.length === 0) {
    return {
      vertices: [],
      calculationTime: performance.now() - startTime,
      actualCount: 0,
    };
  }
  
  const effectiveWidth = width - 2 * margin;
  const effectiveHeight = height - 2 * margin;
  
  // Use progressive density approach to maximize drone utilization
  const vertices = generateVerticesWithProgressiveDensity({
    width,
    height,
    count,
    margin,
    mask,
    effectiveWidth,
    effectiveHeight,
  });
  
  const calculationTime = performance.now() - startTime;
  
  return {
    vertices,
    calculationTime,
    actualCount: vertices.length,
  };
}

/**
 * Generates vertices using space-filling approach optimized for bright areas
 * Uses adaptive grid density and force-directed adjustment for even distribution
 */
function generateVerticesWithProgressiveDensity(params: {
  width: number;
  height: number;
  count: number;
  margin: number;
  mask: BrightnessMask;
  effectiveWidth: number;
  effectiveHeight: number;
}): Vertex[] {
  const { width, height, count, margin, mask, effectiveWidth, effectiveHeight } = params;
  
  // Step 1: Generate high-density candidate grid in bright areas only
  const candidates = generateBrightAreaCandidates({
    width, height, margin, mask, effectiveWidth, effectiveHeight
  });
  
  if (candidates.length === 0) {
    return [];
  }
  
  // Step 2: Select evenly distributed vertices using space-filling approach
  const selectedVertices = selectEvenlyDistributedVertices(candidates, count, effectiveWidth, effectiveHeight, margin);
  
  // Step 3: Apply force-directed adjustment to improve distribution
  const finalVertices = applyForceDirectedAdjustment(selectedVertices, mask, width, height, margin);
  
  return finalVertices;
}

/**
 * Generate dense candidate grid only in bright areas
 */
function generateBrightAreaCandidates(params: {
  width: number;
  height: number;
  margin: number;
  mask: BrightnessMask;
  effectiveWidth: number;
  effectiveHeight: number;
}): Vertex[] {
  const { width, height, margin, mask, effectiveWidth, effectiveHeight } = params;
  const candidates: Vertex[] = [];
  
  // Use fine-grained grid for better coverage
  const gridResolution = Math.max(20, Math.min(50, Math.sqrt(effectiveWidth * effectiveHeight) / 10));
  const stepX = effectiveWidth / gridResolution;
  const stepY = effectiveHeight / gridResolution;
  
  let id = 0;
  
  for (let row = 0; row < gridResolution; row++) {
    for (let col = 0; col < gridResolution; col++) {
      const x = margin + col * stepX + stepX / 2; // Center of cell
      const y = margin + row * stepY + stepY / 2;
      
      // Only consider positions in bright areas
      if (x >= margin && x <= width - margin && y >= margin && y <= height - margin) {
        if (isPositionBright(mask, x, y, width, height)) {
          const vertex: Vertex = {
            id: `v${id++}`,
            x: x / width,
            y: y / height,
            absoluteX: x,
            absoluteY: y,
          };
          
          candidates.push(vertex);
        }
      }
    }
  }
  
  return candidates;
}

/**
 * Systematically distribute vertices evenly throughout all bright areas using grid placement
 */
function selectEvenlyDistributedVertices(
  candidates: Vertex[],
  count: number,
  _effectiveWidth: number,
  _effectiveHeight: number,
  margin: number
): Vertex[] {
  if (candidates.length === 0) return [];
  
  // Calculate optimal spacing for even distribution across bright areas
  const totalBrightArea = candidates.length; // Each candidate represents one grid cell
  const density = count / totalBrightArea;
  const spacing = Math.sqrt(1 / density);
  
  // Create systematic grid for even placement
  const selectedVertices: Vertex[] = [];
  const placementGrid = new Set<string>(); // Track occupied grid positions
  
  
  // Calculate how many vertices to skip between placements for even distribution
  const skipFactor = Math.max(1, Math.floor(totalBrightArea / count));
  
  // Systematically place vertices using regular intervals
  for (let i = 0; i < candidates.length && selectedVertices.length < count; i += skipFactor) {
    const candidate = candidates[i];
    
    // Calculate grid position for this candidate
    const gridX = Math.floor((candidate.absoluteX - margin) / spacing);
    const gridY = Math.floor((candidate.absoluteY - margin) / spacing);
    const gridKey = `${gridX},${gridY}`;
    
    // Only place if this grid position isn't occupied
    if (!placementGrid.has(gridKey)) {
      selectedVertices.push(candidate);
      placementGrid.add(gridKey);
    }
  }
  
  // Fill remaining positions if needed by reducing skip factor
  if (selectedVertices.length < count) {
    const remaining = count - selectedVertices.length;
    const unusedCandidates = candidates.filter(c => !selectedVertices.includes(c));
    
    // Take remaining vertices at regular intervals
    const remainingSkip = Math.max(1, Math.floor(unusedCandidates.length / remaining));
    for (let i = 0; i < unusedCandidates.length && selectedVertices.length < count; i += remainingSkip) {
      selectedVertices.push(unusedCandidates[i]);
    }
  }
  
  return selectedVertices;
}


/**
 * Apply force-directed adjustment to improve distribution quality
 */
function applyForceDirectedAdjustment(
  vertices: Vertex[],
  mask: BrightnessMask,
  width: number,
  height: number,
  margin: number
): Vertex[] {
  const adjustedVertices = [...vertices];
  const maxIterations = 3;
  const stepSize = Math.min(width, height) * 0.01; // 1% of smallest dimension
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    for (let i = 0; i < adjustedVertices.length; i++) {
      let forceX = 0;
      let forceY = 0;
      
      // Calculate repulsion force from other vertices
      for (let j = 0; j < adjustedVertices.length; j++) {
        if (i === j) continue;
        
        const dx = adjustedVertices[i].absoluteX - adjustedVertices[j].absoluteX;
        const dy = adjustedVertices[i].absoluteY - adjustedVertices[j].absoluteY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0 && distance < stepSize * 10) {
          const force = stepSize / (distance * distance);
          forceX += (dx / distance) * force;
          forceY += (dy / distance) * force;
        }
      }
      
      // Apply force with bounds checking and brightness validation
      const newX = adjustedVertices[i].absoluteX + forceX;
      const newY = adjustedVertices[i].absoluteY + forceY;
      
      // Only move if new position is within bounds and still bright
      if (newX >= margin && newX <= width - margin && 
          newY >= margin && newY <= height - margin &&
          isPositionBright(mask, newX, newY, width, height)) {
        adjustedVertices[i] = {
          ...adjustedVertices[i],
          absoluteX: newX,
          absoluteY: newY,
          x: newX / width,
          y: newY / height,
        };
      }
    }
  }
  
  return adjustedVertices;
}

/**
 * Distributes vertices using hexagonal packing constrained to bright areas
 * More efficient packing but may be less predictable in irregular bright regions
 */
export function distributeMaskedVerticesHexagonal(
  params: MaskedDistributionParams
): VertexCalculationResult {
  const startTime = performance.now();
  const { width, height, count, margin, mask } = params;
  
  // Calculate effective area and hexagon spacing
  const effectiveWidth = width - 2 * margin;
  const effectiveHeight = height - 2 * margin;
  const area = effectiveWidth * effectiveHeight;
  
  // Estimate spacing based on total area and bright area percentage
  const brightAreaRatio = mask.brightCellPercentage / 100;
  const effectiveDensity = count / (area * brightAreaRatio);
  const hexArea = 1 / effectiveDensity;
  const spacing = Math.sqrt(hexArea * 2 / Math.sqrt(3));
  
  const vertices: Vertex[] = [];
  const rowHeight = spacing * Math.sqrt(3) / 2;
  const rows = Math.ceil(effectiveHeight / rowHeight);
  const cols = Math.ceil(effectiveWidth / spacing);
  
  let id = 0;
  
  for (let row = 0; row < rows && vertices.length < count; row++) {
    const isEvenRow = row % 2 === 0;
    const offsetX = isEvenRow ? 0 : spacing / 2;
    const colsInRow = isEvenRow ? cols : cols - 1;
    
    for (let col = 0; col < colsInRow && vertices.length < count; col++) {
      const x = margin + offsetX + col * spacing;
      const y = margin + row * rowHeight;
      
      // Check bounds and brightness
      if (x >= margin && x <= width - margin && y >= margin && y <= height - margin) {
        if (isPositionBright(mask, x, y, width, height)) {
          vertices.push({
            id: `v${id++}`,
            x: x / width,
            y: y / height,
            absoluteX: x,
            absoluteY: y,
          });
        }
      }
    }
  }
  
  const calculationTime = performance.now() - startTime;
  
  return {
    vertices,
    calculationTime,
    actualCount: vertices.length,
  };
}

/**
 * Main masked distribution function with algorithm selection
 */
export function distributeMaskedVertices(
  params: MaskedDistributionParams & { algorithm?: 'grid' | 'hexagonal' }
): VertexCalculationResult {
  const algorithm = params.algorithm || 'grid';
  
  switch (algorithm) {
    case 'hexagonal':
      return distributeMaskedVerticesHexagonal(params);
    case 'grid':
    default:
      return distributeMaskedVerticesGrid(params);
  }
}