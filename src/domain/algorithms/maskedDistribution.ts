/**
 * Vertex distribution algorithms that work within brightness masks
 */

import { Vertex, VertexDistributionParams, VertexCalculationResult } from '../types';
import { BrightnessMask, isPositionBright, getBrightRegions } from './brightnessMask';

export interface MaskedDistributionParams extends VertexDistributionParams {
  mask: BrightnessMask;
}

/**
 * Distributes vertices using a grid pattern constrained to bright areas
 * Ensures even distribution across available bright regions
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
  
  // Calculate grid dimensions based on available bright area and aspect ratio
  const effectiveWidth = width - 2 * margin;
  const effectiveHeight = height - 2 * margin;
  const aspectRatio = effectiveWidth / effectiveHeight;
  
  // Create a grid that covers the entire image but we'll filter to bright areas
  const cols = Math.ceil(Math.sqrt(count * aspectRatio));
  const rows = Math.ceil(count / cols);
  
  const spacingX = effectiveWidth / Math.max(1, cols - 1);
  const spacingY = effectiveHeight / Math.max(1, rows - 1);
  
  const vertices: Vertex[] = [];
  const candidates: Array<{ vertex: Vertex; priority: number }> = [];
  let id = 0;
  
  // Generate candidates across the entire grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = margin + col * spacingX;
      const y = margin + row * spacingY;
      
      // Ensure vertex is within bounds
      if (x >= margin && x <= width - margin && y >= margin && y <= height - margin) {
        // Check if position is in a bright area
        if (isPositionBright(mask, x, y, width, height)) {
          const vertex: Vertex = {
            id: `v${id++}`,
            x: x / width,
            y: y / height,
            absoluteX: x,
            absoluteY: y,
          };
          
          // Calculate priority based on distance from edges (prefer center placement)
          const centerX = width / 2;
          const centerY = height / 2;
          const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
          const priority = 1 - (distanceFromCenter / maxDistance); // Higher value = closer to center
          
          candidates.push({ vertex, priority });
        }
      }
    }
  }
  
  // Sort candidates by priority (center-biased) and take the best ones
  candidates.sort((a, b) => b.priority - a.priority);
  
  // Select up to the requested count
  for (let i = 0; i < Math.min(count, candidates.length); i++) {
    vertices.push(candidates[i].vertex);
  }
  
  const calculationTime = performance.now() - startTime;
  
  return {
    vertices,
    calculationTime,
    actualCount: vertices.length,
  };
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