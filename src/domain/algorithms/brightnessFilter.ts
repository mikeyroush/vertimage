/**
 * Brightness filtering algorithms for drone inclusion/exclusion
 */

import { DroneData } from '../types';
import { calculateBrightness } from './colorSampling';

/**
 * Filters drones based on brightness threshold
 * Drones below the threshold are marked as excluded
 */
export function filterDronesByBrightness(
  drones: DroneData[],
  threshold: number
): DroneData[] {
  return drones.map(drone => {
    const brightness = calculateBrightness(drone.color);
    return {
      ...drone,
      brightness,
      included: brightness >= threshold,
    };
  });
}

/**
 * Counts active drones (those that pass the brightness threshold)
 */
export function countActiveDrones(drones: DroneData[]): number {
  return drones.filter(drone => drone.included).length;
}

/**
 * Gets only the active drones for export
 */
export function getActiveDrones(drones: DroneData[]): DroneData[] {
  return drones.filter(drone => drone.included);
}

/**
 * Calculates statistics about the drone distribution
 */
export function calculateDroneStatistics(drones: DroneData[]) {
  const total = drones.length;
  const active = countActiveDrones(drones);
  const filtered = total - active;
  
  const brightnesses = drones.map(d => d.brightness);
  const avgBrightness = brightnesses.reduce((a, b) => a + b, 0) / total;
  const minBrightness = Math.min(...brightnesses);
  const maxBrightness = Math.max(...brightnesses);
  
  return {
    total,
    active,
    filtered,
    averageBrightness: avgBrightness,
    minBrightness,
    maxBrightness,
    activePercentage: (active / total) * 100,
  };
}

/**
 * Suggests an optimal brightness threshold based on target active drone count
 */
export function suggestBrightnessThreshold(
  drones: DroneData[],
  targetActiveCount: number
): number {
  // Sort drones by brightness
  const sortedDrones = [...drones].sort((a, b) => b.brightness - a.brightness);
  
  // If target is greater than total, return 0 (include all)
  if (targetActiveCount >= drones.length) {
    return 0;
  }
  
  // If target is 0 or less, return 1 (exclude all)
  if (targetActiveCount <= 0) {
    return 1;
  }
  
  // Find the brightness threshold that gives us closest to target count
  const targetDrone = sortedDrones[targetActiveCount - 1];
  const nextDrone = sortedDrones[targetActiveCount];
  
  // Return a threshold between the target and next drone
  if (nextDrone) {
    return (targetDrone.brightness + nextDrone.brightness) / 2;
  }
  
  return targetDrone.brightness * 0.99; // Slightly below to include the target
}