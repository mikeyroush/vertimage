/**
 * Brightness mask generation utility for identifying valid placement areas
 */

import { sampleColorAtVertex, calculateBrightness } from './colorSampling';

export interface BrightnessMaskParams {
  imageData: ImageData;
  brightnessThreshold: number;
  samplingRadius: number;
  resolution: number; // Grid resolution for mask sampling (e.g., 50 = 50x50 grid)
}

export interface BrightnessMask {
  grid: boolean[][];
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  totalBrightCells: number;
  brightCellPercentage: number;
}

/**
 * Generates a brightness mask by sampling the image in a grid pattern
 * Returns a 2D boolean array where true indicates bright areas suitable for vertex placement
 */
export function generateBrightnessMask(params: BrightnessMaskParams): BrightnessMask {
  const { imageData, brightnessThreshold, samplingRadius, resolution } = params;
  const { width: imgWidth, height: imgHeight } = imageData;
  
  // Calculate cell dimensions
  const cellWidth = imgWidth / resolution;
  const cellHeight = imgHeight / resolution;
  
  // Initialize the grid
  const grid: boolean[][] = [];
  let totalBrightCells = 0;
  
  // Sample each cell in the grid
  for (let row = 0; row < resolution; row++) {
    grid[row] = [];
    
    for (let col = 0; col < resolution; col++) {
      // Sample from the center of each cell
      const x = (col + 0.5) * cellWidth;
      const y = (row + 0.5) * cellHeight;
      
      // Ensure we're within image bounds
      const clampedX = Math.min(Math.max(x, samplingRadius), imgWidth - samplingRadius);
      const clampedY = Math.min(Math.max(y, samplingRadius), imgHeight - samplingRadius);
      
      // Sample color and calculate brightness
      const color = sampleColorAtVertex(imageData, clampedX, clampedY, samplingRadius);
      const brightness = calculateBrightness(color);
      
      // Mark cell as bright if it meets threshold
      const isBright = brightness >= brightnessThreshold;
      grid[row][col] = isBright;
      
      if (isBright) {
        totalBrightCells++;
      }
    }
  }
  
  const totalCells = resolution * resolution;
  const brightCellPercentage = (totalBrightCells / totalCells) * 100;
  
  return {
    grid,
    width: resolution,
    height: resolution,
    cellWidth,
    cellHeight,
    totalBrightCells,
    brightCellPercentage,
  };
}

/**
 * Checks if a specific coordinate is within a bright area according to the mask
 */
export function isPositionBright(
  mask: BrightnessMask,
  x: number,
  y: number,
  imageWidth: number,
  imageHeight: number
): boolean {
  // Convert image coordinates to grid coordinates
  const gridX = Math.floor((x / imageWidth) * mask.width);
  const gridY = Math.floor((y / imageHeight) * mask.height);
  
  // Ensure coordinates are within grid bounds
  if (gridX < 0 || gridX >= mask.width || gridY < 0 || gridY >= mask.height) {
    return false;
  }
  
  return mask.grid[gridY][gridX];
}

/**
 * Gets all bright regions as bounding rectangles
 * Useful for focusing distribution algorithms on specific areas
 */
export function getBrightRegions(mask: BrightnessMask): Array<{ 
  x: number; 
  y: number; 
  width: number; 
  height: number; 
}> {
  const regions: Array<{ x: number; y: number; width: number; height: number }> = [];
  
  // Simple approach: find all bright cells and convert to image coordinates
  for (let row = 0; row < mask.height; row++) {
    for (let col = 0; col < mask.width; col++) {
      if (mask.grid[row][col]) {
        regions.push({
          x: col * mask.cellWidth,
          y: row * mask.cellHeight,
          width: mask.cellWidth,
          height: mask.cellHeight,
        });
      }
    }
  }
  
  return regions;
}

/**
 * Calculates the total bright area available for vertex placement
 */
export function calculateBrightArea(
  mask: BrightnessMask, 
  imageWidth: number, 
  imageHeight: number
): number {
  const totalImageArea = imageWidth * imageHeight;
  return totalImageArea * (mask.brightCellPercentage / 100);
}