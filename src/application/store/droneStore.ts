/**
 * Zustand store for drone data management
 */

import { create } from 'zustand';
import { DroneData, Vertex } from '@/domain/types';
import { calculateDroneStatistics } from '@/domain/algorithms';

interface DroneState {
  // State
  vertices: Vertex[];
  drones: DroneData[];
  isCalculating: boolean;
  
  // Actions
  setVertices: (vertices: Vertex[]) => void;
  setDrones: (drones: DroneData[]) => void;
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
  isCalculating: false,
  
  // Actions
  setVertices: (vertices) => set({ vertices }),
  
  setDrones: (drones) => set({ drones }),
  
  setCalculating: (calculating) => set({ isCalculating: calculating }),
  
  clearDrones: () => set({ 
    vertices: [], 
    drones: [], 
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