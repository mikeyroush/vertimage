/**
 * Zustand store for drone data management
 */

import { create } from 'zustand';
import { DroneData, Vertex } from '@/domain/types';
import { calculateDroneStatistics } from '@/domain/algorithms';
import { BrightnessMask } from '@/domain/algorithms/brightnessMask';

interface DroneState {
  // State
  vertices: Vertex[];
  drones: DroneData[];
  brightnessMask: BrightnessMask | null;
  isCalculating: boolean;
  
  // Actions
  setVertices: (vertices: Vertex[]) => void;
  setDrones: (drones: DroneData[]) => void;
  setBrightnessMask: (mask: BrightnessMask | null) => void;
  setCalculating: (calculating: boolean) => void;
  clearDrones: () => void;
  
  // Computed
  getActiveDrones: () => DroneData[];
  getStatistics: () => ReturnType<typeof calculateDroneStatistics> | null;
}

export const useDroneStore = create<DroneState>((set, get) => ({
  // Initial state
  vertices: [],
  drones: [],
  brightnessMask: null,
  isCalculating: false,
  
  // Actions
  setVertices: (vertices) => set({ vertices }),
  
  setDrones: (drones) => set({ drones }),
  
  setBrightnessMask: (mask) => set({ brightnessMask: mask }),
  
  setCalculating: (calculating) => set({ isCalculating: calculating }),
  
  clearDrones: () => set({ 
    vertices: [], 
    drones: [], 
    brightnessMask: null,
    isCalculating: false 
  }),
  
  // Computed
  getActiveDrones: () => {
    return get().drones.filter(drone => drone.included);
  },
  
  getStatistics: () => {
    const drones = get().drones;
    if (drones.length === 0) return null;
    return calculateDroneStatistics(drones);
  },
}));