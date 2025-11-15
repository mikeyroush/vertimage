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
  
  // Actions
  setVertexCount: (count: number) => void;
  setVertexDistribution: (distribution: VertexDistribution) => void;
  setVertexMargin: (margin: number) => void;
  setBrightnessThreshold: (threshold: number) => void;
  setSamplingRadius: (radius: number) => void;
  resetConfig: () => void;
}

const initialState = {
  vertexCount: DEFAULT_VERTEX_CONFIG.count,
  vertexDistribution: DEFAULT_VERTEX_CONFIG.distribution,
  vertexMargin: DEFAULT_VERTEX_CONFIG.margin,
  brightnessThreshold: DEFAULT_DRONE_CONFIG.brightnessThreshold,
  samplingRadius: DEFAULT_DRONE_CONFIG.samplingRadius,
};

export const useConfigStore = create<ConfigState>((set) => ({
  ...initialState,
  
  // Actions
  setVertexCount: (count) => set({ vertexCount: count }),
  setVertexDistribution: (distribution) => set({ vertexDistribution: distribution }),
  setVertexMargin: (margin) => set({ vertexMargin: margin }),
  setBrightnessThreshold: (threshold) => set({ brightnessThreshold: threshold }),
  setSamplingRadius: (radius) => set({ samplingRadius: radius }),
  
  resetConfig: () => set(initialState),
}));