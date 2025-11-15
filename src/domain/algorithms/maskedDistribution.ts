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
 * Generates vertices using progressive density to maximize bright area utilization
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
  
  let vertices: Vertex[] = [];
  let densityLevel = 1;
  const maxDensityLevels = 5;
  let id = 0;
  
  // Progressive density approach: try increasing grid density until we get enough vertices
  while (vertices.length < count && densityLevel <= maxDensityLevels) {
    const candidates: Array<{ vertex: Vertex; priority: number }> = [];
    
    // Calculate grid dimensions for current density level
    const aspectRatio = effectiveWidth / effectiveHeight;
    const targetGridPoints = count * densityLevel;
    const cols = Math.ceil(Math.sqrt(targetGridPoints * aspectRatio));
    const rows = Math.ceil(targetGridPoints / cols);
    
    const spacingX = effectiveWidth / Math.max(1, cols - 1);
    const spacingY = effectiveHeight / Math.max(1, rows - 1);
    
    // Minimum distance to prevent clustering
    const minDistance = Math.min(spacingX, spacingY) * 0.3 / densityLevel;
    
    // Generate candidates
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = margin + col * spacingX;
        const y = margin + row * spacingY;
        
        // Bounds and brightness check
        if (x >= margin && x <= width - margin && y >= margin && y <= height - margin) {
          if (isPositionBright(mask, x, y, width, height)) {
            // Check minimum distance to existing vertices
            const tooClose = vertices.some(existing => {
              const dx = existing.absoluteX - x;
              const dy = existing.absoluteY - y;
              return Math.sqrt(dx * dx + dy * dy) < minDistance;
            });
            
            if (!tooClose) {
              const vertex: Vertex = {
                id: `v${id++}`,
                x: x / width,
                y: y / height,
                absoluteX: x,
                absoluteY: y,
              };
              
              // Priority based on distance from center and existing vertex density
              const centerX = width / 2;
              const centerY = height / 2;
              const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
              const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
              const centerBias = 1 - (distanceFromCenter / maxDistance);
              
              // Bonus for areas with fewer existing vertices (encourage spread)
              const localDensity = vertices.filter(v => {
                const dx = v.absoluteX - x;
                const dy = v.absoluteY - y;
                return Math.sqrt(dx * dx + dy * dy) < spacingX * 2;
              }).length;
              const spreadBonus = Math.max(0, 1 - localDensity * 0.2);
              
              const priority = centerBias * 0.7 + spreadBonus * 0.3;
              candidates.push({ vertex, priority });
            }
          }
        }
      }
    }
    
    // Sort candidates and add the best ones
    candidates.sort((a, b) => b.priority - a.priority);
    
    // Add candidates until we reach target or run out
    const remainingNeeded = count - vertices.length;
    const toAdd = Math.min(remainingNeeded, candidates.length);
    
    for (let i = 0; i < toAdd; i++) {
      vertices.push(candidates[i].vertex);
    }
    
    // If we made no progress, break to avoid infinite loop
    const previousLength = vertices.length - toAdd;
    if (candidates.length === 0 || vertices.length === previousLength) {
      break;
    }
    
    densityLevel++;
  }
  
  return vertices;
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