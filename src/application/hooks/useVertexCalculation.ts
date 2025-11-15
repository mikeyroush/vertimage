/**
 * Custom hook for vertex calculation and drone data generation
 */

import { useCallback, useEffect, useRef } from 'react';
import { useImageStore } from '../store/imageStore';
import { useConfigStore } from '../store/configStore';
import { useDroneStore } from '../store/droneStore';
import { 
  distributeVertices, 
  distributeBrightnessAwareVertices,
  filterDronesByBrightness 
} from '@/domain/algorithms';
import { 
  batchSampleColors 
} from '../utils/memoized';
import { DroneData } from '@/domain/types';

export function useVertexCalculation() {
  const calculationRef = useRef<number>();
  const abortControllerRef = useRef<AbortController>();
  
  const currentImage = useImageStore((state) => state.currentImage);
  const config = useConfigStore();
  const { setVertices, setDrones, setCalculating } = useDroneStore();
  
  const calculateVertices = useCallback(async () => {
    if (!currentImage?.imageData) return;
    
    // Cancel any previous calculation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this calculation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setCalculating(true);
    
    try {
      // Check if calculation was aborted
      if (abortController.signal.aborted) return;
      
      // Calculate vertex positions
      let vertexResult;
      
      if (config.avoidDarkAreas && currentImage.imageData) {
        // Use brightness-aware distribution
        vertexResult = distributeBrightnessAwareVertices({
          width: currentImage.width,
          height: currentImage.height,
          count: config.vertexCount,
          margin: config.vertexMargin,
          imageData: currentImage.imageData,
          brightnessThreshold: config.brightnessThreshold,
          avoidanceRadius: config.samplingRadius,
        });
      } else {
        // Use standard distribution
        vertexResult = distributeVertices({
          width: currentImage.width,
          height: currentImage.height,
          count: config.vertexCount,
          margin: config.vertexMargin,
          distribution: config.vertexDistribution,
        });
      }
      
      // Check if calculation was aborted before proceeding
      if (abortController.signal.aborted) return;
      
      setVertices(vertexResult.vertices);
      
      // Generate drone data using optimized batch color sampling
      const { colors, brightnesses } = batchSampleColors(
        currentImage.imageData!,
        vertexResult.vertices,
        config.samplingRadius
      );
      
      // Check if calculation was aborted before proceeding
      if (abortController.signal.aborted) return;
      
      // Generate drone data with pre-computed colors and brightness
      const droneData: DroneData[] = vertexResult.vertices.map((vertex, index) => ({
        id: `d-${vertex.id}`,
        vertexId: vertex.id,
        position: {
          x: vertex.absoluteX,
          y: vertex.absoluteY,
        },
        color: colors[index],
        brightness: brightnesses[index],
        included: brightnesses[index] >= config.brightnessThreshold,
      }));
      
      // Final check before setting results
      if (abortController.signal.aborted) return;
      
      // Apply brightness filtering
      const filteredDrones = filterDronesByBrightness(droneData, config.brightnessThreshold);
      setDrones(filteredDrones);
      
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error('Vertex calculation error:', error);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setCalculating(false);
      }
    }
  }, [
    currentImage,
    config.vertexCount,
    config.vertexMargin,
    config.vertexDistribution,
    config.samplingRadius,
    config.brightnessThreshold,
    config.avoidDarkAreas,
    setVertices,
    setDrones,
    setCalculating,
  ]);
  
  // Recalculate when configuration changes
  useEffect(() => {
    if (currentImage) {
      // Clear any existing debounce timer
      if (calculationRef.current) {
        clearTimeout(calculationRef.current);
      }
      
      // Debounce the calculation with longer delay for expensive operations
      const delay = config.vertexCount > 500 ? 500 : 300;
      calculationRef.current = setTimeout(() => {
        calculateVertices();
      }, delay) as unknown as number;
      
      return () => {
        if (calculationRef.current) {
          clearTimeout(calculationRef.current);
        }
      };
    }
  }, [calculateVertices, currentImage, config.vertexCount, config.avoidDarkAreas]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (calculationRef.current) {
        clearTimeout(calculationRef.current);
      }
    };
  }, []);
  
  return {
    calculateVertices,
  };
}