/**
 * SVG overlay for vertex visualization
 */

import { useState } from 'react';
import { useDroneStore } from '@/application/store/droneStore';
import { useImageStore } from '@/application/store/imageStore';
import { DronePreview } from './DronePreview';

interface VertexOverlayProps {
  width: number;
  height: number;
  scale: number;
}

export function VertexOverlay({ width, height, scale }: VertexOverlayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const drones = useDroneStore((state) => state.drones);
  const currentImage = useImageStore((state) => state.currentImage);
  const isCalculating = useDroneStore((state) => state.isCalculating);
  
  if (!currentImage || drones.length === 0) return null;
  
  // Calculate centering offsets
  const scaledImageWidth = currentImage.width * scale;
  const scaledImageHeight = currentImage.height * scale;
  const offsetX = (width - scaledImageWidth) / 2;
  const offsetY = (height - scaledImageHeight) / 2;
  
  return (
    <div className="absolute inset-0">
      {/* Toggle button for details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`absolute top-4 right-4 px-3 py-1 text-white text-xs rounded-md z-10 transition-all ${
          showDetails 
            ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' 
            : 'bg-black/50 hover:bg-black/70'
        }`}
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>
      
      {/* Loading indicator */}
      {isCalculating && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-blue-500/80 text-white text-xs rounded-md z-10">
          Calculating...
        </div>
      )}
      
      {/* Drone count indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-xs rounded-md z-10">
        {drones.filter(d => d.included).length}/{drones.length} drones
      </div>
      
      <svg
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ width, height }}
      >
        {drones.map((drone) => {
          // Convert image coordinates to scaled canvas coordinates
          const x = offsetX + (drone.position.x * scale);
          const y = offsetY + (drone.position.y * scale);
          
          return (
            <DronePreview
              key={drone.id}
              drone={drone}
              x={x}
              y={y}
              scale={scale}
              showDetails={showDetails}
              canvasWidth={width}
              canvasHeight={height}
            />
          );
        })}
      </svg>
    </div>
  );
}