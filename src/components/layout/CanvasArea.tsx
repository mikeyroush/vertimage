/**
 * Main canvas area for image and visualization display
 */

import { useRef } from 'react';
import { useImageStore } from '@/application/store/imageStore';
import { useConfigStore } from '@/application/store/configStore';
import { useDroneStore } from '@/application/store/droneStore';
import { useCanvasDimensions } from '@/application/hooks/useCanvasDimensions';
import { ImageCanvas } from '../canvas/ImageCanvas';
import { VertexOverlay } from '../canvas/VertexOverlay';
import { BrightnessMaskOverlay } from '../canvas/BrightnessMaskOverlay';

export function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentImage = useImageStore((state) => state.currentImage);
  const showImagePreview = useConfigStore((state) => state.showImagePreview);
  const showBrightnessMask = useConfigStore((state) => state.showBrightnessMask);
  const avoidDarkAreas = useConfigStore((state) => state.avoidDarkAreas);
  const brightnessMask = useDroneStore((state) => state.brightnessMask);
  
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
              {/* Background pattern when image is hidden */}
              {!showImagePreview && (
                <div 
                  className="border border-border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm"
                  style={{
                    width: canvasDimensions.width,
                    height: canvasDimensions.height,
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}
                />
              )}
              
              {/* Image canvas - conditionally rendered */}
              {showImagePreview && (
                <ImageCanvas 
                  width={canvasDimensions.width}
                  height={canvasDimensions.height}
                  scale={canvasDimensions.scale}
                  className={`transition-opacity duration-200 ${
                    canvasDimensions.isCalculating ? 'opacity-75' : 'opacity-100'
                  }`}
                />
              )}
              
              {/* Brightness mask overlay - shown when enabled and available */}
              {showBrightnessMask && avoidDarkAreas && brightnessMask && currentImage && (
                <BrightnessMaskOverlay
                  mask={brightnessMask}
                  canvasWidth={canvasDimensions.width}
                  canvasHeight={canvasDimensions.height}
                  imageWidth={currentImage.width}
                  imageHeight={currentImage.height}
                  scale={canvasDimensions.scale}
                  offsetX={(canvasDimensions.width - currentImage.width * canvasDimensions.scale) / 2}
                  offsetY={(canvasDimensions.height - currentImage.height * canvasDimensions.scale) / 2}
                />
              )}
              
              {/* Vertex overlay - always rendered */}
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