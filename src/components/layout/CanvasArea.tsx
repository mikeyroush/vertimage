/**
 * Main canvas area for image and visualization display
 */

import { useRef } from 'react';
import { useImageStore } from '@/application/store/imageStore';
import { useCanvasDimensions } from '@/application/hooks/useCanvasDimensions';
import { ImageCanvas } from '../canvas/ImageCanvas';
import { VertexOverlay } from '../canvas/VertexOverlay';

export function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentImage = useImageStore((state) => state.currentImage);
  
  // Use unified canvas dimensions hook
  const canvasDimensions = useCanvasDimensions(containerRef, {
    padding: 64, // Account for container padding
    minWidth: 400,
    minHeight: 300,
  });
  
  return (
    <div className="flex-1 bg-background p-8">
      <div ref={containerRef} className="h-full rounded-lg border bg-card relative">
        {canvasDimensions.isCalculating && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-blue-500/80 text-white text-xs rounded-md z-20">
            Recalculating layout...
          </div>
        )}
        
        {currentImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative transition-all duration-300 ease-out">
              <ImageCanvas 
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                scale={canvasDimensions.scale}
                className={`transition-opacity duration-200 ${
                  canvasDimensions.isCalculating ? 'opacity-75' : 'opacity-100'
                }`}
              />
              <VertexOverlay
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                scale={canvasDimensions.scale}
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">
                No image loaded
              </p>
              <p className="text-sm text-muted-foreground">
                Upload an image to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}