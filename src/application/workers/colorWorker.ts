/**
 * Web Worker for color sampling calculations
 * Processes multiple vertices in parallel
 */

import { sampleColorAtVertex, calculateBrightness } from '../../domain/algorithms/colorSampling';
import { Vertex, DroneData } from '../../domain/types';

// Worker message types
interface ColorSamplingRequest {
  id: string;
  vertices: Vertex[];
  imageData: ImageData;
  samplingRadius: number;
  brightnessThreshold: number;
}

interface ColorSamplingResponse {
  id: string;
  drones: DroneData[];
  error?: string;
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<ColorSamplingRequest>) => {
  const { id, vertices, imageData, samplingRadius, brightnessThreshold } = event.data;
  
  try {
    const drones: DroneData[] = vertices.map((vertex) => {
      const color = sampleColorAtVertex(
        imageData,
        vertex.absoluteX,
        vertex.absoluteY,
        samplingRadius
      );
      
      const brightness = calculateBrightness(color);
      
      return {
        id: `d-${vertex.id}`,
        vertexId: vertex.id,
        position: {
          x: vertex.absoluteX,
          y: vertex.absoluteY,
        },
        color,
        brightness,
        included: brightness >= brightnessThreshold,
      };
    });
    
    const response: ColorSamplingResponse = {
      id,
      drones,
    };
    
    self.postMessage(response);
  } catch (error) {
    const response: ColorSamplingResponse = {
      id,
      drones: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    
    self.postMessage(response);
  }
};