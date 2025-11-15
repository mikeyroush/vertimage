/**
 * Export-related type definitions for CSV generation
 */

/**
 * Single row in the CSV export
 */
export interface DroneExportRow {
  droneId: number;
  x: number;          // Pixel coordinate
  y: number;          // Pixel coordinate
  red: number;        // 0-255
  green: number;      // 0-255
  blue: number;       // 0-255
  brightness: number; // 0-100 percentage
}

/**
 * Metadata included with export
 */
export interface ExportMetadata {
  totalDrones: number;
  activeDrones: number;
  filteredDrones: number;
  imageWidth: number;
  imageHeight: number;
  brightnessThreshold: number;
  samplingRadius: number;
  exportDate: string;
  version: string;
}

/**
 * Complete export data structure
 */
export interface ExportData {
  drones: DroneExportRow[];
  metadata: ExportMetadata;
}

/**
 * CSV export options
 */
export interface ExportOptions {
  includeHeader: boolean;
  includeMetadata: boolean;
  filename?: string;
}