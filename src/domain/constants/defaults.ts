/**
 * Default configuration values for the application
 */

import { VertexConfig, DroneConfig } from '../types';

/**
 * Default vertex distribution configuration
 */
export const DEFAULT_VERTEX_CONFIG: VertexConfig = {
  count: 100,
  distribution: 'hexagonal',
  margin: 20,
};

/**
 * Default drone configuration
 */
export const DEFAULT_DRONE_CONFIG: DroneConfig = {
  brightnessThreshold: 0.1, // 10% brightness threshold
  samplingRadius: 10,       // 10px radius for color sampling
  colorSpace: 'rgb',
};

/**
 * Application constraints
 */
export const CONSTRAINTS = {
  MIN_VERTEX_COUNT: 10,
  MAX_VERTEX_COUNT: 1000,
  MIN_BRIGHTNESS_THRESHOLD: 0,
  MAX_BRIGHTNESS_THRESHOLD: 1,
  MIN_SAMPLING_RADIUS: 1,
  MAX_SAMPLING_RADIUS: 50,
  MIN_IMAGE_SIZE: 100,      // Minimum image dimension in pixels
  MAX_IMAGE_SIZE: 4096,     // Maximum image dimension in pixels
} as const;

/**
 * Supported image formats
 */
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

/**
 * Application metadata
 */
export const APP_VERSION = '0.1.0';
export const APP_NAME = 'Vertimage';