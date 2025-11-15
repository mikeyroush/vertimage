/**
 * Brightness-aware vertex distribution algorithm
 * Places vertices while avoiding dark areas using a clean two-part approach:
 * 1. Generate a brightness mask to identify valid placement areas
 * 2. Distribute vertices evenly within those areas
 */

import { VertexDistributionParams, VertexCalculationResult } from '../types';
import { generateBrightnessMask, BrightnessMask } from './brightnessMask';
import { distributeMaskedVertices } from './maskedDistribution';

export interface BrightnessAwareParams extends VertexDistributionParams {
  imageData: ImageData;
  brightnessThreshold: number;
  avoidanceRadius?: number;
  maskResolution?: number;
  algorithm?: 'grid' | 'hexagonal';
}

export interface BrightnessAwareResult extends VertexCalculationResult {
  brightnessMask: BrightnessMask;
}

/**
 * Distributes vertices while avoiding dark areas using brightness mask approach
 */
export function distributeBrightnessAwareVertices(
  params: BrightnessAwareParams
): BrightnessAwareResult {
  const startTime = performance.now();
  const { 
    width, 
    height, 
    count, 
    margin, 
    imageData, 
    brightnessThreshold,
    avoidanceRadius = 10,
    maskResolution = 50,
    algorithm = 'grid'
  } = params;
  
  // Step 1: Generate brightness mask to identify bright areas
  const mask = generateBrightnessMask({
    imageData,
    brightnessThreshold,
    samplingRadius: avoidanceRadius,
    resolution: maskResolution,
  });
  
  // Step 2: Distribute vertices evenly within bright areas
  const result = distributeMaskedVertices({
    width,
    height,
    count,
    margin,
    mask,
    algorithm,
  });
  
  // Update timing to include mask generation
  const calculationTime = performance.now() - startTime;
  
  // Log statistics for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Brightness-aware distribution: ${result.actualCount}/${count} vertices placed in ${mask.brightCellPercentage.toFixed(1)}% bright areas`);
  }
  
  return {
    vertices: result.vertices,
    calculationTime,
    actualCount: result.actualCount,
    brightnessMask: mask,
  };
}

