/**
 * Zustand store for application configuration
 */

import { create } from 'zustand';
import { VertexDistribution } from '@/domain/types';
import { DEFAULT_VERTEX_CONFIG, DEFAULT_DRONE_CONFIG } from '@/domain/constants/defaults';

interface ConfigState {
  // Vertex configuration
  vertexCount: number;
  vertexDistribution: VertexDistribution;
  vertexMargin: number;
  
  // Drone configuration
  brightnessThreshold: number;
  samplingRadius: number;
  
  // Display configuration
  showImagePreview: boolean;
  showVertices: boolean;
  showDetails: boolean;
  avoidDarkAreas: boolean;
  showBrightnessMask: boolean;
  maskGridDensity: number;
  zoomLevel: number;
  
  // Actions
  setVertexCount: (count: number) => void;
  setVertexDistribution: (distribution: VertexDistribution) => void;
  setVertexMargin: (margin: number) => void;
  setBrightnessThreshold: (threshold: number) => void;
  setSamplingRadius: (radius: number) => void;
  setShowImagePreview: (show: boolean) => void;
  setShowVertices: (show: boolean) => void;
  setShowDetails: (show: boolean) => void;
  setAvoidDarkAreas: (avoid: boolean) => void;
  setShowBrightnessMask: (show: boolean) => void;
  setMaskGridDensity: (density: number) => void;
  setZoomLevel: (zoom: number) => void;
  resetConfig: () => void;
}

const initialState = {
  vertexCount: DEFAULT_VERTEX_CONFIG.count,
  vertexDistribution: DEFAULT_VERTEX_CONFIG.distribution,
  vertexMargin: DEFAULT_VERTEX_CONFIG.margin,
  brightnessThreshold: DEFAULT_DRONE_CONFIG.brightnessThreshold,
  samplingRadius: DEFAULT_DRONE_CONFIG.samplingRadius,
  showImagePreview: true,
  showVertices: true,
  showDetails: false,
  avoidDarkAreas: false,
  showBrightnessMask: false,
  maskGridDensity: 50, // Default grid density for mask generation
  zoomLevel: 1.0, // Default zoom level (1x)
};

export const useConfigStore = create<ConfigState>((set) => ({
  ...initialState,
  
  // Actions
  setVertexCount: (count) => set({ vertexCount: count }),
  setVertexDistribution: (distribution) => set({ vertexDistribution: distribution }),
  setVertexMargin: (margin) => set({ vertexMargin: margin }),
  setBrightnessThreshold: (threshold) => set({ brightnessThreshold: threshold }),
  setSamplingRadius: (radius) => set({ samplingRadius: radius }),
  setShowImagePreview: (show) => set({ showImagePreview: show }),
  setShowVertices: (show) => set({ showVertices: show }),
  setShowDetails: (show) => set({ showDetails: show }),
  setAvoidDarkAreas: (avoid) => set({ avoidDarkAreas: avoid }),
  setShowBrightnessMask: (show) => set({ showBrightnessMask: show }),
  setMaskGridDensity: (density) => set({ maskGridDensity: density }),
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.5, Math.min(3.0, zoom)) }),
  
  resetConfig: () => set(initialState),
}));