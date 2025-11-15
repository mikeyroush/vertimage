/**
 * SVG overlay for vertex visualization
 */

import { useState } from 'react';
import { useDroneStore } from '@/application/store/droneStore';
import { useImageStore } from '@/application/store/imageStore';
import { useConfigStore } from '@/application/store/configStore';
import { DronePreview } from './DronePreview';
import { DroneData } from '@/domain/types';
import { 
  calculateTooltipDimensions, 
  calculateTooltipPosition, 
  createDroneTooltipContent 
} from './utils/tooltipUtils';

interface VertexOverlayProps {
  width: number;
  height: number;
  scale: number;
}

export function VertexOverlay({ width, height, scale }: VertexOverlayProps) {
  const [hoveredDrone, setHoveredDrone] = useState<{ drone: DroneData; x: number; y: number } | null>(null);
  const drones = useDroneStore((state) => state.drones);
  const currentImage = useImageStore((state) => state.currentImage);
  const isCalculating = useDroneStore((state) => state.isCalculating);
  const showVertices = useConfigStore((state) => state.showVertices);
  const showDetails = useConfigStore((state) => state.showDetails);
  
  if (!currentImage || drones.length === 0) return null;
  
  // Calculate centering offsets
  const scaledImageWidth = currentImage.width * scale;
  const scaledImageHeight = currentImage.height * scale;
  const offsetX = (width - scaledImageWidth) / 2;
  const offsetY = (height - scaledImageHeight) / 2;
  
  return (
    <div className="absolute inset-0">
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
        {/* Drone vertices layer - conditionally rendered */}
        {showVertices && (
          <g className="vertices-layer">
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
                  onHover={(drone, x, y) => setHoveredDrone({ drone, x, y })}
                  onUnhover={() => setHoveredDrone(null)}
                />
              );
            })}
          </g>
        )}
        
        {/* Tooltips layer - rendered on top with highest z-index */}
        <g className="tooltips-layer">
          {hoveredDrone && showDetails && showVertices && (() => {
            const { drone, x, y } = hoveredDrone;
            const radius = Math.max(3, 6 * scale);
            const isExcluded = !drone.included;
            const tooltipContent = createDroneTooltipContent(drone, isExcluded);
            const dimensions = calculateTooltipDimensions(tooltipContent);
            const position = calculateTooltipPosition(
              x, y, radius, dimensions.width, dimensions.height, width, height
            );
            
            return (
              <g key={`tooltip-${drone.id}`} className="pointer-events-none">
                <rect
                  x={position.x}
                  y={position.y}
                  width={dimensions.width}
                  height={dimensions.height}
                  fill="rgba(0, 0, 0, 0.95)"
                  rx={4}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1"
                />
                {tooltipContent.lines.map((line, index) => (
                  <text
                    key={index}
                    x={position.x + dimensions.padding.x}
                    y={position.y + dimensions.padding.y + (index + 1) * 14}
                    fill="white"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
}