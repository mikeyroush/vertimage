/**
 * Brightness-aware vertex distribution algorithm
 * Places vertices while avoiding dark areas of the image
 */

import { Vertex, VertexDistributionParams, VertexCalculationResult } from '../types';
import { sampleColorAtVertex, calculateBrightness } from './colorSampling';

export interface BrightnessAwareParams extends VertexDistributionParams {
  imageData: ImageData;
  brightnessThreshold: number;
  maxAttempts?: number;
  avoidanceRadius?: number;
}

/**
 * Distributes vertices using hexagonal pattern while avoiding dark areas
 */
export function distributeBrightnessAwareVertices(
  params: BrightnessAwareParams
): VertexCalculationResult {
  const startTime = performance.now();
  const { 
    width, 
    height, 
    count, 
    margin, 
    imageData, 
    brightnessThreshold,
    maxAttempts = 50,
    avoidanceRadius = 10
  } = params;
  
  // First, generate candidate positions using hexagonal distribution
  const candidates = generateHexagonalCandidates(width, height, count * 2, margin);
  
  // Filter candidates by brightness
  const brightCandidates = candidates.filter(candidate => {
    const color = sampleColorAtVertex(
      imageData,
      candidate.absoluteX,
      candidate.absoluteY,
      avoidanceRadius
    );
    const brightness = calculateBrightness(color);
    return brightness >= brightnessThreshold;
  });
  
  // If we have enough bright candidates, select the best distributed ones
  let selectedVertices: Vertex[];
  
  if (brightCandidates.length >= count) {
    selectedVertices = selectWellDistributedVertices(brightCandidates, count);
  } else {
    // Not enough bright areas, use iterative adjustment
    selectedVertices = adjustVerticesAwayFromDarkAreas({
      initialVertices: candidates.slice(0, count),
      imageData,
      brightnessThreshold,
      maxAttempts,
      avoidanceRadius,
      width,
      height,
      margin
    });
  }
  
  const calculationTime = performance.now() - startTime;
  
  return {
    vertices: selectedVertices,
    calculationTime,
    actualCount: selectedVertices.length,
  };
}

/**
 * Generate hexagonal candidate positions (more than needed)
 */
function generateHexagonalCandidates(
  width: number,
  height: number,
  candidateCount: number,
  margin: number
): Vertex[] {
  const effectiveWidth = width - 2 * margin;
  const effectiveHeight = height - 2 * margin;
  const area = effectiveWidth * effectiveHeight;
  
  // Calculate optimal hexagon spacing for candidate count
  const hexArea = area / candidateCount;
  const spacing = Math.sqrt(hexArea * 2 / Math.sqrt(3));
  
  const candidates: Vertex[] = [];
  const rowHeight = spacing * Math.sqrt(3) / 2;
  const rows = Math.ceil(effectiveHeight / rowHeight);
  const cols = Math.ceil(effectiveWidth / spacing);
  
  let id = 0;
  
  for (let row = 0; row < rows && candidates.length < candidateCount; row++) {
    const isEvenRow = row % 2 === 0;
    const offsetX = isEvenRow ? 0 : spacing / 2;
    const colsInRow = isEvenRow ? cols : cols - 1;
    
    for (let col = 0; col < colsInRow && candidates.length < candidateCount; col++) {
      const x = margin + offsetX + col * spacing;
      const y = margin + row * rowHeight;
      
      // Check if vertex is within bounds
      if (x >= margin && x <= width - margin && y >= margin && y <= height - margin) {
        candidates.push({
          id: `v${id++}`,
          x: x / width,
          y: y / height,
          absoluteX: x,
          absoluteY: y,
        });
      }
    }
  }
  
  return candidates;
}

/**
 * Select well-distributed vertices from bright candidates
 */
function selectWellDistributedVertices(candidates: Vertex[], targetCount: number): Vertex[] {
  if (candidates.length <= targetCount) {
    return candidates;
  }
  
  // Use a greedy algorithm to select well-distributed vertices
  const selected: Vertex[] = [];
  const remaining = [...candidates];
  
  // Start with a random vertex
  const firstIndex = Math.floor(Math.random() * remaining.length);
  selected.push(remaining.splice(firstIndex, 1)[0]);
  
  // Select subsequent vertices that maximize minimum distance to existing ones
  while (selected.length < targetCount && remaining.length > 0) {
    let bestIndex = 0;
    let maxMinDistance = 0;
    
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      
      // Find minimum distance to any selected vertex
      let minDistance = Infinity;
      for (const selectedVertex of selected) {
        const distance = Math.sqrt(
          Math.pow(candidate.absoluteX - selectedVertex.absoluteX, 2) +
          Math.pow(candidate.absoluteY - selectedVertex.absoluteY, 2)
        );
        minDistance = Math.min(minDistance, distance);
      }
      
      // Keep track of the candidate with the largest minimum distance
      if (minDistance > maxMinDistance) {
        maxMinDistance = minDistance;
        bestIndex = i;
      }
    }
    
    selected.push(remaining.splice(bestIndex, 1)[0]);
  }
  
  return selected;
}

/**
 * Iteratively adjust vertices away from dark areas
 */
function adjustVerticesAwayFromDarkAreas(params: {
  initialVertices: Vertex[];
  imageData: ImageData;
  brightnessThreshold: number;
  maxAttempts: number;
  avoidanceRadius: number;
  width: number;
  height: number;
  margin: number;
}): Vertex[] {
  const {
    initialVertices,
    imageData,
    brightnessThreshold,
    maxAttempts,
    avoidanceRadius,
    width,
    height,
    margin
  } = params;
  
  const adjustedVertices = initialVertices.map(vertex => ({ ...vertex }));
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let anyAdjustment = false;
    
    for (const vertex of adjustedVertices) {
      const color = sampleColorAtVertex(
        imageData,
        vertex.absoluteX,
        vertex.absoluteY,
        avoidanceRadius
      );
      const brightness = calculateBrightness(color);
      
      if (brightness < brightnessThreshold) {
        // Try to move vertex to a brighter area
        const newPosition = findBrighterPosition(
          vertex,
          imageData,
          brightnessThreshold,
          avoidanceRadius,
          width,
          height,
          margin
        );
        
        if (newPosition) {
          vertex.absoluteX = newPosition.x;
          vertex.absoluteY = newPosition.y;
          vertex.x = newPosition.x / width;
          vertex.y = newPosition.y / height;
          anyAdjustment = true;
        }
      }
    }
    
    // If no adjustments were made, we're done
    if (!anyAdjustment) {
      break;
    }
  }
  
  return adjustedVertices;
}

/**
 * Find a brighter position near the given vertex
 */
function findBrighterPosition(
  vertex: Vertex,
  imageData: ImageData,
  brightnessThreshold: number,
  avoidanceRadius: number,
  width: number,
  height: number,
  margin: number,
  searchRadius: number = 40
): { x: number; y: number } | null {
  const centerX = vertex.absoluteX;
  const centerY = vertex.absoluteY;
  
  // Try positions in concentric circles around the vertex
  for (let radius = 10; radius <= searchRadius; radius += 10) {
    const numSamples = Math.max(8, Math.floor(radius * 0.5));
    
    for (let i = 0; i < numSamples; i++) {
      const angle = (i / numSamples) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Check bounds
      if (x < margin || x > width - margin || y < margin || y > height - margin) {
        continue;
      }
      
      // Check brightness
      const color = sampleColorAtVertex(imageData, x, y, avoidanceRadius);
      const brightness = calculateBrightness(color);
      
      if (brightness >= brightnessThreshold) {
        return { x, y };
      }
    }
  }
  
  return null; // No brighter position found
}