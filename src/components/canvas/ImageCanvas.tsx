/**
 * Main canvas component for image display
 */

import { useRef, useEffect } from 'react';
import { useImageStore } from '@/application/store/imageStore';
import { drawImageToCanvas } from '@/infrastructure/canvas/canvasUtils';
import { loadImageFromUrl } from '@/infrastructure/canvas/imageLoader';

interface ImageCanvasProps {
  width: number;
  height: number;
  scale: number;
  className?: string;
}

export function ImageCanvas({ width, height, scale, className }: ImageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentImage = useImageStore((state) => state.currentImage);
  
  // Draw image when it changes or dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;
    
    const drawImage = async () => {
      try {
        const img = await loadImageFromUrl(currentImage.url);
        drawImageToCanvas(canvas, img, scale);
      } catch (error) {
        console.error('Failed to draw image:', error);
      }
    };
    
    drawImage();
  }, [currentImage, scale, width, height]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`border border-border rounded-lg bg-white shadow-sm transition-all duration-300 ${className || ''}`}
      style={{
        width,
        height,
      }}
    />
  );
}