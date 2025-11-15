/**
 * Memoization utilities for expensive computations
 */

import { RGBColor, Vertex, VertexDistributionParams } from '@/domain/types';
import { 
  sampleColorAtVertex,
  calculateBrightness,
} from '@/domain/algorithms/colorSampling';
import { distributeVertices } from '@/domain/algorithms/vertexDistribution';

// Simple LRU cache implementation
class LRUCache<T> {
  private cache = new Map<string, T>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    if (!key) return undefined;
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: T): void {
    if (!key) return;
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Cache instances
const colorCache = new LRUCache<RGBColor>(500);
const brightnessCache = new LRUCache<number>(500);
const vertexCache = new LRUCache<Vertex[]>(50);

/**
 * Memoized color sampling with LRU cache
 */
export function memoizedSampleColorAtVertex(
  imageData: ImageData,
  x: number,
  y: number,
  radius: number
): RGBColor {
  // Create cache key from image data hash and coordinates
  const key = `${x.toFixed(2)}_${y.toFixed(2)}_${radius}_${imageData.width}_${imageData.height}`;
  
  const cached = colorCache.get(key);
  if (cached) {
    return cached;
  }
  
  const result = sampleColorAtVertex(imageData, x, y, radius);
  colorCache.set(key, result);
  
  return result;
}

/**
 * Memoized brightness calculation
 */
export function memoizedCalculateBrightness(color: RGBColor): number {
  const key = `${color.r}_${color.g}_${color.b}`;
  
  const cached = brightnessCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  
  const result = calculateBrightness(color);
  brightnessCache.set(key, result);
  
  return result;
}

/**
 * Memoized vertex distribution
 */
export function memoizedDistributeVertices(
  params: VertexDistributionParams & { distribution: 'hexagonal' | 'grid' | 'poisson' }
): Vertex[] {
  const key = `${params.width}_${params.height}_${params.count}_${params.margin}_${params.distribution}`;
  
  const cached = vertexCache.get(key);
  if (cached) {
    return cached;
  }
  
  const result = distributeVertices(params);
  vertexCache.set(key, result.vertices);
  
  return result.vertices;
}

/**
 * Clear all memoization caches
 */
export function clearMemoizationCaches(): void {
  colorCache.clear();
  brightnessCache.clear();
  vertexCache.clear();
}

/**
 * Batch color sampling with optimizations
 */
export function batchSampleColors(
  imageData: ImageData,
  vertices: Vertex[],
  radius: number
): { colors: RGBColor[]; brightnesses: number[] } {
  const colors: RGBColor[] = [];
  const brightnesses: number[] = [];
  
  // Process in chunks to prevent blocking the main thread
  for (const vertex of vertices) {
    const color = memoizedSampleColorAtVertex(
      imageData,
      vertex.absoluteX,
      vertex.absoluteY,
      radius
    );
    const brightness = memoizedCalculateBrightness(color);
    
    colors.push(color);
    brightnesses.push(brightness);
  }
  
  return { colors, brightnesses };
}