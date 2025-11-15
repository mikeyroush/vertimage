/**
 * Color sampling algorithms for extracting representative colors from image regions
 */

import { RGBColor } from '../types';

/**
 * Samples the average color within a circular radius around a point
 */
export function sampleColorAtVertex(
  imageData: ImageData,
  x: number,
  y: number,
  radius: number
): RGBColor {
  const { data, width, height } = imageData;
  
  // Convert to integer coordinates
  const centerX = Math.round(x);
  const centerY = Math.round(y);
  
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let pixelCount = 0;
  
  // Calculate bounds to avoid unnecessary iterations
  const minX = Math.max(0, centerX - radius);
  const maxX = Math.min(width - 1, centerX + radius);
  const minY = Math.max(0, centerY - radius);
  const maxY = Math.min(height - 1, centerY + radius);
  
  const radiusSquared = radius * radius;
  
  // Sample pixels within circular area
  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      // Check if pixel is within circular radius
      const dx = px - centerX;
      const dy = py - centerY;
      if (dx * dx + dy * dy > radiusSquared) continue;
      
      // Get pixel data
      const index = (py * width + px) * 4;
      const alpha = data[index + 3];
      
      // Skip fully transparent pixels
      if (alpha === 0) continue;
      
      // Accumulate color values (handling alpha)
      const alphaFactor = alpha / 255;
      totalR += data[index] * alphaFactor;
      totalG += data[index + 1] * alphaFactor;
      totalB += data[index + 2] * alphaFactor;
      pixelCount += alphaFactor;
    }
  }
  
  // Handle edge case where no valid pixels found
  if (pixelCount === 0) {
    return { r: 0, g: 0, b: 0 };
  }
  
  // Calculate average
  return {
    r: Math.round(totalR / pixelCount),
    g: Math.round(totalG / pixelCount),
    b: Math.round(totalB / pixelCount),
  };
}

/**
 * Calculates the perceived brightness of an RGB color
 * Uses the relative luminance formula
 */
export function calculateBrightness(color: RGBColor): number {
  // Convert to normalized values
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  
  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  
  return luminance;
}

/**
 * Simple brightness calculation using average of RGB values
 * Faster but less accurate than relative luminance
 */
export function calculateSimpleBrightness(color: RGBColor): number {
  return (color.r + color.g + color.b) / (3 * 255);
}

/**
 * Converts RGB to HSV color space
 * Useful for future color-based filtering features
 */
export function rgbToHsv(color: RGBColor): { h: number; s: number; v: number } {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  // Calculate hue
  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  
  // Calculate saturation
  const s = max === 0 ? 0 : delta / max;
  
  // Value is just the max
  const v = max;
  
  return { h, s, v };
}