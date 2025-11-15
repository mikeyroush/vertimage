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
 * Clean brightness-aware distribution with proper grid-based spatial coverage
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
  
  // Calculate effective area and grid dimensions
  const effectiveWidth = width - 2 * margin;
  const effectiveHeight = height - 2 * margin;
  const aspectRatio = effectiveWidth / effectiveHeight;
  
  // Create a grid that provides good coverage for the target count
  const cols = Math.ceil(Math.sqrt(count * aspectRatio));
  const rows = Math.ceil(count / cols);
  const cellWidth = effectiveWidth / cols;
  const cellHeight = effectiveHeight / rows;
  
  // Generate candidates by thoroughly sampling each grid cell
  const candidates: Array<Vertex & { brightness: number; cellX: number; cellY: number }> = [];
  let id = 0;
  
  for (let cellY = 0; cellY < rows; cellY++) {
    for (let cellX = 0; cellX < cols; cellX++) {
      // Sample multiple positions within this cell to find the brightest spot
      const cellCandidates: Array<Vertex & { brightness: number; cellX: number; cellY: number }> = [];
      
      // Use systematic sampling with some randomness for better coverage
      const samplesPerCell = 20; // Increased for better brightness targeting
      
      for (let i = 0; i < samplesPerCell; i++) {
        // Mix systematic and random sampling
        let localX, localY;
        
        if (i < 9) {
          // First 9: systematic 3x3 grid within cell
          const subX = i % 3;
          const subY = Math.floor(i / 3);
          localX = (subX + 0.5) * (cellWidth / 3);
          localY = (subY + 0.5) * (cellHeight / 3);
        } else {
          // Remaining: random positions with slight bias toward center
          const bias = 0.3; // 30% bias toward center
          localX = (Math.random() * (1 - bias) + bias * 0.5) * cellWidth;
          localY = (Math.random() * (1 - bias) + bias * 0.5) * cellHeight;
        }
        
        const absoluteX = margin + cellX * cellWidth + localX;
        const absoluteY = margin + cellY * cellHeight + localY;
        
        // Bounds check
        if (absoluteX < margin || absoluteX > width - margin || 
            absoluteY < margin || absoluteY > height - margin) {
          continue;
        }
        
        // Sample color and calculate brightness
        const color = sampleColorAtVertex(imageData, absoluteX, absoluteY, avoidanceRadius);
        const brightness = calculateBrightness(color);
        
        cellCandidates.push({
          id: `v${id++}`,
          x: absoluteX / width,
          y: absoluteY / height,
          absoluteX,
          absoluteY,
          brightness,
          cellX,
          cellY
        });
      }
      
      // Sort cell candidates by brightness (descending)
      cellCandidates.sort((a, b) => b.brightness - a.brightness);
      
      // Take the best candidates from this cell
      // If we have bright spots, prefer them; otherwise take the best available
      const brightCandidates = cellCandidates.filter(c => c.brightness >= brightnessThreshold);
      const candidatesToAdd = brightCandidates.length > 0 ? brightCandidates.slice(0, 3) : cellCandidates.slice(0, 1);
      
      candidates.push(...candidatesToAdd);
    }
  }
  
  // Sort all candidates by brightness quality
  candidates.sort((a, b) => {
    // Prioritize candidates above threshold
    const aAboveThreshold = a.brightness >= brightnessThreshold;
    const bAboveThreshold = b.brightness >= brightnessThreshold;
    
    if (aAboveThreshold && !bAboveThreshold) return -1;
    if (!bAboveThreshold && aAboveThreshold) return 1;
    
    // Within same threshold category, sort by brightness
    return b.brightness - a.brightness;
  });
  
  // Select vertices with spatial distribution constraints
  const selectedVertices: Vertex[] = [];
  const usedCells = new Map<string, number>(); // Track how many vertices per cell
  const minDistance = Math.min(cellWidth, cellHeight) * 0.4;
  
  // First pass: select best candidates with spatial constraints
  for (const candidate of candidates) {
    if (selectedVertices.length >= count) break;
    
    const cellKey = `${candidate.cellX}-${candidate.cellY}`;
    const cellUsage = usedCells.get(cellKey) || 0;
    
    // Only take candidates that meet brightness threshold
    if (candidate.brightness < brightnessThreshold) continue;
    
    // Limit vertices per cell to maintain distribution, but allow some flexibility
    const maxPerCell = Math.max(1, Math.ceil(count / (cols * rows)) + 1);
    if (cellUsage >= maxPerCell) continue;
    
    // Check minimum distance to existing vertices
    const tooClose = selectedVertices.some(existing => {
      const dx = existing.absoluteX - candidate.absoluteX;
      const dy = existing.absoluteY - candidate.absoluteY;
      return Math.sqrt(dx * dx + dy * dy) < minDistance;
    });
    
    if (!tooClose) {
      selectedVertices.push({
        id: candidate.id,
        x: candidate.x,
        y: candidate.y,
        absoluteX: candidate.absoluteX,
        absoluteY: candidate.absoluteY
      });
      usedCells.set(cellKey, cellUsage + 1);
    }
  }
  
  // Second pass: if we don't have enough bright vertices, the image may be too dark
  // In this case, we should return fewer vertices rather than placing dark ones
  if (selectedVertices.length < count * 0.8) {
    // If we can't find enough bright spots, try with slightly relaxed threshold
    const relaxedThreshold = Math.max(0.1, brightnessThreshold * 0.8);
    
    for (const candidate of candidates) {
      if (selectedVertices.length >= count) break;
      
      // Skip if already processed in first pass
      if (candidate.brightness >= brightnessThreshold) continue;
      
      // Only accept candidates that meet relaxed threshold
      if (candidate.brightness < relaxedThreshold) continue;
      
      const cellKey = `${candidate.cellX}-${candidate.cellY}`;
      const cellUsage = usedCells.get(cellKey) || 0;
      const maxPerCell = Math.max(1, Math.ceil(count / (cols * rows)) + 2);
      
      if (cellUsage >= maxPerCell) continue;
      
      const tooClose = selectedVertices.some(existing => {
        const dx = existing.absoluteX - candidate.absoluteX;
        const dy = existing.absoluteY - candidate.absoluteY;
        return Math.sqrt(dx * dx + dy * dy) < minDistance * 0.7; // Slightly relaxed distance
      });
      
      if (!tooClose) {
        selectedVertices.push({
          id: candidate.id,
          x: candidate.x,
          y: candidate.y,
          absoluteX: candidate.absoluteX,
          absoluteY: candidate.absoluteY
        });
        usedCells.set(cellKey, cellUsage + 1);
      }
    }
  }
  
  // Validation: ensure we only return bright vertices when avoiding dark areas
  const validatedVertices = selectedVertices.filter(vertex => {
    // Re-sample to double-check brightness at final positions
    const color = sampleColorAtVertex(imageData, vertex.absoluteX, vertex.absoluteY, avoidanceRadius);
    const brightness = calculateBrightness(color);
    return brightness >= brightnessThreshold;
  });
  
  // Log statistics for debugging
  if (process.env.NODE_ENV === 'development') {
    const totalCandidates = candidates.length;
    const brightCandidates = candidates.filter(c => c.brightness >= brightnessThreshold).length;
    console.log(`Brightness-aware distribution: ${validatedVertices.length}/${count} vertices placed (${brightCandidates}/${totalCandidates} bright candidates found)`);
  }
  
  return validatedVertices;
}