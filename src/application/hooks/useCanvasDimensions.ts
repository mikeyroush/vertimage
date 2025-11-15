/**
 * Custom hook for unified canvas dimension management
 * Provides a single source of truth for canvas dimensions and scaling
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useImageStore } from '../store/imageStore';
import { useConfigStore } from '../store/configStore';
import { calculateCanvasDimensions } from '@/infrastructure/canvas/canvasUtils';

interface CanvasDimensions {
  width: number;
  height: number;
  scale: number;
  isCalculating?: boolean;
}

interface UseCanvasDimensionsOptions {
  padding?: number;
  minWidth?: number;
  minHeight?: number;
}

export function useCanvasDimensions(
  containerRef: React.RefObject<HTMLElement>,
  options: UseCanvasDimensionsOptions = {}
) {
  const { padding = 32, minWidth = 400, minHeight = 300 } = options;
  
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: 800,
    height: 600,
    scale: 1,
    isCalculating: false,
  });
  
  const resizeObserverRef = useRef<ResizeObserver>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const currentImage = useImageStore((state) => state.currentImage);
  const zoomLevel = useConfigStore((state) => state.zoomLevel);
  
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    // Set loading state
    setDimensions(prev => ({ ...prev, isCalculating: true }));
    
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce expensive calculations
    debounceTimeoutRef.current = setTimeout(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const maxWidth = Math.max(minWidth, rect.width - padding);
      const maxHeight = Math.max(minHeight, rect.height - padding);
      
      if (currentImage) {
        const dims = calculateCanvasDimensions(
          currentImage.width,
          currentImage.height,
          maxWidth,
          maxHeight
        );
        
        // Apply zoom multiplier to final dimensions
        setDimensions({
          width: dims.width * zoomLevel,
          height: dims.height * zoomLevel,
          scale: dims.scale * zoomLevel,
          isCalculating: false,
        });
      } else {
        setDimensions({
          width: maxWidth,
          height: maxHeight,
          scale: 1,
          isCalculating: false,
        });
      }
    }, 150); // 150ms debounce
  }, [containerRef, currentImage, zoomLevel, padding, minWidth, minHeight]);
  
  // Set up ResizeObserver for container dimension changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clean up existing observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    
    // Create new ResizeObserver
    resizeObserverRef.current = new ResizeObserver(() => {
      // Debounce resize events to prevent excessive recalculations
      requestAnimationFrame(() => updateDimensions());
    });
    
    // Start observing
    resizeObserverRef.current.observe(containerRef.current);
    
    // Initial calculation
    updateDimensions();
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [updateDimensions]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Recalculate when image changes
  useEffect(() => {
    updateDimensions();
  }, [updateDimensions]);
  
  return dimensions;
}