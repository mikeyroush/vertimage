/**
 * Custom hook for image processing operations
 */

import { useCallback } from 'react';
import { useImageStore } from '../store/imageStore';
import { ProcessedImage } from '@/domain/types';
import { SUPPORTED_IMAGE_FORMATS, CONSTRAINTS } from '@/domain/constants/defaults';

export function useImageProcessor() {
  const { setImage, setLoading, setError, clearImage } = useImageStore();
  
  const processImageFile = useCallback(async (file: File): Promise<void> => {
    // Validate file type
    if (!SUPPORTED_IMAGE_FORMATS.some(format => format === file.type)) {
      setError(`Unsupported file format. Please use: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create object URL
      const url = URL.createObjectURL(file);
      
      // Load image to get dimensions
      const img = new Image();
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });
      
      // Validate image dimensions
      if (img.width < CONSTRAINTS.MIN_IMAGE_SIZE || img.height < CONSTRAINTS.MIN_IMAGE_SIZE) {
        throw new Error(`Image too small. Minimum size: ${CONSTRAINTS.MIN_IMAGE_SIZE}px`);
      }
      
      if (img.width > CONSTRAINTS.MAX_IMAGE_SIZE || img.height > CONSTRAINTS.MAX_IMAGE_SIZE) {
        throw new Error(`Image too large. Maximum size: ${CONSTRAINTS.MAX_IMAGE_SIZE}px`);
      }
      
      // Create canvas and extract image data
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to create canvas context');
      }
      
      // Draw image to canvas
      context.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = context.getImageData(0, 0, img.width, img.height);
      
      // Create ProcessedImage object
      const processedImage: ProcessedImage = {
        id: `img-${Date.now()}`,
        file,
        url,
        width: img.width,
        height: img.height,
        canvas,
        context,
        imageData,
      };
      
      setImage(processedImage);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process image');
      console.error('Image processing error:', error);
    } finally {
      setLoading(false);
    }
  }, [setImage, setLoading, setError]);
  
  const cleanup = useCallback(() => {
    const currentImage = useImageStore.getState().currentImage;
    if (currentImage?.url) {
      URL.revokeObjectURL(currentImage.url);
    }
    clearImage();
  }, [clearImage]);
  
  return {
    processImageFile,
    cleanup,
  };
}