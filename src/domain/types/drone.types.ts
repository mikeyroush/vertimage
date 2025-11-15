/**
 * Drone-specific type definitions including color and brightness data
 */

/**
 * RGB color representation
 */
export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * HSV color representation for future use
 */
export interface HSVColor {
  h: number; // 0-360
  s: number; // 0-1
  v: number; // 0-1
}

/**
 * Complete drone data including position, color, and filtering status
 */
export interface DroneData {
  id: string;
  vertexId: string;
  position: {
    x: number; // Absolute pixel position
    y: number; // Absolute pixel position
  };
  color: RGBColor;
  brightness: number;  // 0-1 normalized brightness
  included: boolean;   // Whether drone passes brightness threshold
}

/**
 * Configuration for drone color and filtering
 */
export interface DroneConfig {
  brightnessThreshold: number; // 0-1, drones below this are excluded
  samplingRadius: number;      // Pixel radius for color averaging
  colorSpace: 'rgb' | 'hsv';   // Color space for calculations
}

/**
 * Parameters for color sampling
 */
export interface ColorSamplingParams {
  imageData: ImageData;
  x: number;
  y: number;
  radius: number;
}