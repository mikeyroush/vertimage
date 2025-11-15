/**
 * Vertex distribution algorithms for optimal drone positioning
 */

import { Vertex, VertexDistributionParams, VertexCalculationResult } from '../types';

// Re-export types for worker usage
export type { VertexDistributionParams, VertexCalculationResult } from '../types';

/**
 * Distributes vertices using hexagonal packing pattern
 * This provides the most efficient coverage with uniform spacing
 */
export function distributeVerticesHexagonal(
  params: VertexDistributionParams
): VertexCalculationResult {
  const startTime = performance.now();
  const { width, height, count, margin } = params;
  
  // Calculate effective area
  const effectiveWidth = width - 2 * margin;
  const effectiveHeight = height - 2 * margin;
  const area = effectiveWidth * effectiveHeight;
  
  // Calculate optimal hexagon spacing
  const hexArea = area / count;
  const spacing = Math.sqrt(hexArea * 2 / Math.sqrt(3));
  
  const vertices: Vertex[] = [];
  const rowHeight = spacing * Math.sqrt(3) / 2;
  const rows = Math.ceil(effectiveHeight / rowHeight);
  const cols = Math.ceil(effectiveWidth / spacing);
  
  let id = 0;
  
  for (let row = 0; row < rows; row++) {
    const isEvenRow = row % 2 === 0;
    const offsetX = isEvenRow ? 0 : spacing / 2;
    const colsInRow = isEvenRow ? cols : cols - 1;
    
    for (let col = 0; col < colsInRow; col++) {
      const x = margin + offsetX + col * spacing;
      const y = margin + row * rowHeight;
      
      // Check if vertex is within bounds (with proper margin checking)
      if (x >= margin && x <= width - margin && y >= margin && y <= height - margin) {
        vertices.push({
          id: `v${id++}`,
          x: x / width,          // Normalized
          y: y / height,         // Normalized
          absoluteX: x,
          absoluteY: y,
        });
      }
      
      // Stop if we've reached the desired count
      if (vertices.length >= count) {
        break;
      }
    }
    
    if (vertices.length >= count) {
      break;
    }
  }
  
  const calculationTime = performance.now() - startTime;
  
  return {
    vertices: vertices.slice(0, count),
    calculationTime,
    actualCount: Math.min(vertices.length, count),
  };
}

/**
 * Distributes vertices in a uniform grid pattern
 * Simple and predictable, but less efficient coverage
 */
export function distributeVerticesGrid(
  params: VertexDistributionParams
): VertexCalculationResult {
  const startTime = performance.now();
  const { width, height, count, margin } = params;
  
  // Calculate grid dimensions
  const aspectRatio = width / height;
  const rows = Math.ceil(Math.sqrt(count / aspectRatio));
  const cols = Math.ceil(count / rows);
  
  // Calculate spacing
  const effectiveWidth = width - 2 * margin;
  const effectiveHeight = height - 2 * margin;
  const spacingX = effectiveWidth / (cols - 1);
  const spacingY = effectiveHeight / (rows - 1);
  
  const vertices: Vertex[] = [];
  let id = 0;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (vertices.length >= count) break;
      
      const x = margin + col * spacingX;
      const y = margin + row * spacingY;
      
      // Ensure vertex is within bounds
      if (x >= margin && x <= width - margin && y >= margin && y <= height - margin) {
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
  
  const calculationTime = performance.now() - startTime;
  
  return {
    vertices: vertices.slice(0, count),
    calculationTime,
    actualCount: Math.min(vertices.length, count),
  };
}

/**
 * Main distribution function that delegates to specific algorithms
 */
export function distributeVertices(
  params: VertexDistributionParams & { distribution: 'hexagonal' | 'grid' | 'poisson' }
): VertexCalculationResult {
  switch (params.distribution) {
    case 'hexagonal':
      return distributeVerticesHexagonal(params);
    case 'grid':
      return distributeVerticesGrid(params);
    default:
      // Default to hexagonal
      return distributeVerticesHexagonal(params);
  }
}