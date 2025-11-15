/**
 * Vertex-related type definitions for drone positioning
 */

/**
 * Represents a single vertex/drone position
 */
export interface Vertex {
  id: string;
  x: number;      // Normalized 0-1
  y: number;      // Normalized 0-1
  absoluteX: number; // Pixel coordinates
  absoluteY: number; // Pixel coordinates
}

/**
 * Configuration for vertex distribution
 */
export interface VertexConfig {
  count: number;
  distribution: VertexDistribution;
  margin: number; // Edge margin in pixels
}

/**
 * Available vertex distribution algorithms
 */
export type VertexDistribution = 'hexagonal' | 'poisson' | 'grid';

/**
 * Result of vertex calculation including performance metrics
 */
export interface VertexCalculationResult {
  vertices: Vertex[];
  calculationTime: number; // milliseconds
  actualCount: number;     // May differ from requested due to distribution constraints
}

/**
 * Parameters for vertex distribution algorithms
 */
export interface VertexDistributionParams {
  width: number;
  height: number;
  count: number;
  margin: number;
}