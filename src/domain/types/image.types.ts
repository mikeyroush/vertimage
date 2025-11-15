/**
 * Core image-related type definitions for the Vertimage application
 */

/**
 * Represents uploaded image data with metadata and canvas references
 */
export interface ProcessedImage {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
  canvas?: HTMLCanvasElement;
  context?: CanvasRenderingContext2D;
  imageData?: ImageData;
}

/**
 * Image dimension information
 */
export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * RGBA pixel data
 */
export interface PixelData {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-255
}

/**
 * Canvas rendering context with image data
 */
export interface CanvasContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  imageData: ImageData;
}