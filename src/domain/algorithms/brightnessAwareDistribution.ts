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
  
  // Use a grid-based approach for better spatial distribution
  const selectedVertices = distributeWithBrightnessGrid({
    width,
    height,
    count,
    margin,
    imageData,
    brightnessThreshold,
    avoidanceRadius,
    maxAttempts
  });
  
  const calculationTime = performance.now() - startTime;
  
  return {
    vertices: selectedVertices,
    calculationTime,
    actualCount: selectedVertices.length,
  };
}

/**
 * Grid-based brightness-aware distribution for better spatial coverage
 */
function distributeWithBrightnessGrid(params: {
  width: number;
  height: number;
  count: number;
  margin: number;
  imageData: ImageData;
  brightnessThreshold: number;
  avoidanceRadius: number;
  maxAttempts: number;
}): Vertex[] {
  const { width, height, count, margin, imageData, brightnessThreshold, avoidanceRadius } = params;
  
  // Create a grid to ensure even spatial distribution
  const gridSize = Math.ceil(Math.sqrt(count * 1.5)); // Slightly oversize for better selection
  const effectiveWidth = width - 2 * margin;
  const effectiveHeight = height - 2 * margin;
  const cellWidth = effectiveWidth / gridSize;
  const cellHeight = effectiveHeight / gridSize;
  
  const candidates: Array<Vertex & { brightness: number; gridX: number; gridY: number }> = [];
  let id = 0;
  
  // Generate candidates in each grid cell
  for (let gridY = 0; gridY < gridSize; gridY++) {
    for (let gridX = 0; gridX < gridSize; gridX++) {
      // Try multiple positions within each cell (increased for better brightness targeting)
      const attempts = 15;
      let bestCandidate: (Vertex & { brightness: number; gridX: number; gridY: number }) | null = null;
      let bestBrightness = -1;
      
      for (let attempt = 0; attempt < attempts; attempt++) {
        // Use both random and systematic sampling for better coverage
        let localX, localY;
        
        if (attempt < 9) {
          // First 9 attempts: systematic grid within cell
          const subGridX = attempt % 3;
          const subGridY = Math.floor(attempt / 3);
          localX = (subGridX + 0.5) * (cellWidth / 3);
          localY = (subGridY + 0.5) * (cellHeight / 3);
        } else {
          // Remaining attempts: random positions
          localX = Math.random() * cellWidth;
          localY = Math.random() * cellHeight;
        }
        
        const x = margin + gridX * cellWidth + localX;
        const y = margin + gridY * cellHeight + localY;
        
        // Ensure within bounds
        if (x < margin || x > width - margin || y < margin || y > height - margin) {
          continue;
        }
        
        // Sample brightness
        const color = sampleColorAtVertex(imageData, x, y, avoidanceRadius);
        const brightness = calculateBrightness(color);
        
        // Keep the brightest candidate from this cell, but prioritize those above threshold
        const isBetterCandidate = brightness > bestBrightness || 
          (brightness >= brightnessThreshold && bestBrightness < brightnessThreshold);
        
        if (isBetterCandidate) {
          bestBrightness = brightness;
          bestCandidate = {
            id: `v${id++}`,
            x: x / width,
            y: y / height,
            absoluteX: x,
            absoluteY: y,
            brightness,
            gridX,
            gridY
          };
        }
        
        // If we found a very bright spot, we can stop early
        if (brightness >= Math.min(0.8, brightnessThreshold + 0.3)) {
          break;
        }
      }
      
      if (bestCandidate) {
        candidates.push(bestCandidate);
      }
    }
  }
  
  // Sort candidates by a combined score of brightness and quality
  candidates.sort((a, b) => {
    // Prioritize candidates that meet brightness threshold
    const aAboveThreshold = a.brightness >= brightnessThreshold;
    const bAboveThreshold = b.brightness >= brightnessThreshold;
    
    if (aAboveThreshold && !bAboveThreshold) return -1;
    if (!aAboveThreshold && bAboveThreshold) return 1;
    
    // If both meet or don't meet threshold, sort by brightness
    return b.brightness - a.brightness;
  });
  
  // Select vertices ensuring good spatial distribution
  const selectedVertices: Vertex[] = [];
  const usedCells = new Set<string>();
  
  // First pass: select vertices that meet brightness threshold with good distribution
  for (const candidate of candidates) {
    if (selectedVertices.length >= count) break;
    
    const cellKey = `${candidate.gridX}-${candidate.gridY}`;
    
    // Prioritize candidates above brightness threshold
    if (candidate.brightness >= brightnessThreshold && !usedCells.has(cellKey)) {
      selectedVertices.push({
        id: candidate.id,
        x: candidate.x,
        y: candidate.y,
        absoluteX: candidate.absoluteX,
        absoluteY: candidate.absoluteY
      });
      usedCells.add(cellKey);
    }
  }
  
  // Second pass: if we need more vertices, relax brightness requirement
  if (selectedVertices.length < count) {
    const remainingCandidates = candidates.filter(c => !usedCells.has(`${c.gridX}-${c.gridY}`));
    
    for (const candidate of remainingCandidates) {
      if (selectedVertices.length >= count) break;
      
      const cellKey = `${candidate.gridX}-${candidate.gridY}`;
      if (!usedCells.has(cellKey)) {
        selectedVertices.push({
          id: candidate.id,
          x: candidate.x,
          y: candidate.y,
          absoluteX: candidate.absoluteX,
          absoluteY: candidate.absoluteY
        });
        usedCells.add(cellKey);
      }
    }
  }
  
  // Third pass: if still need more, allow multiple per cell with distance constraints
  if (selectedVertices.length < count) {
    const additionalCandidates = candidates.filter(c => {
      return !selectedVertices.some(v => v.id === c.id);
    });
    
    for (const candidate of additionalCandidates) {
      if (selectedVertices.length >= count) break;
      
      // Check minimum distance to existing vertices
      const minDistance = Math.min(cellWidth, cellHeight) * 0.7;
      const tooClose = selectedVertices.some(existing => {
        const dx = existing.absoluteX - candidate.absoluteX;
        const dy = existing.absoluteY - candidate.absoluteY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < minDistance;
      });
      
      if (!tooClose) {
        selectedVertices.push({
          id: candidate.id,
          x: candidate.x,
          y: candidate.y,
          absoluteX: candidate.absoluteX,
          absoluteY: candidate.absoluteY
        });
      }
    }
  }
  
  return selectedVertices;
}