/**
 * Zustand store for image data management
 */

import { create } from 'zustand';
import { ProcessedImage, ImageDimensions } from '@/domain/types';

interface ImageState {
  // State
  currentImage: ProcessedImage | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setImage: (image: ProcessedImage) => void;
  clearImage: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getImageDimensions: () => ImageDimensions | null;
}

export const useImageStore = create<ImageState>((set, get) => ({
  // Initial state
  currentImage: null,
  isLoading: false,
  error: null,
  
  // Actions
  setImage: (image) => set({ 
    currentImage: image, 
    error: null 
  }),
  
  clearImage: () => set({ 
    currentImage: null, 
    error: null 
  }),
  
  setLoading: (loading) => set({ 
    isLoading: loading 
  }),
  
  setError: (error) => set({ 
    error, 
    isLoading: false 
  }),
  
  // Computed
  getImageDimensions: () => {
    const image = get().currentImage;
    if (!image) return null;
    
    return {
      width: image.width,
      height: image.height,
      aspectRatio: image.width / image.height,
    };
  },
}));