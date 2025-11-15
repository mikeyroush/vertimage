/**
 * Individual drone preview component with enhanced visualization
 */

import { useState } from 'react';
import { DroneData } from '@/domain/types';
import { 
  calculateTooltipDimensions, 
  calculateTooltipPosition, 
  createDroneTooltipContent 
} from './utils/tooltipUtils';

interface DronePreviewProps {
  drone: DroneData;
  x: number;
  y: number;
  scale: number;
  showDetails?: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
}

export function DronePreview({ 
  drone, 
  x, 
  y, 
  scale, 
  showDetails = false,
  canvasWidth = 800,
  canvasHeight = 600 
}: DronePreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const radius = Math.max(3, 6 * scale);
  const strokeWidth = Math.max(0.5, 1 * scale);
  
  if (!drone.included) {
    // Show excluded drones as faded gray circles
    return (
      <g>
        <circle
          cx={x}
          cy={y}
          r={radius * 0.7}
          fill="rgba(128, 128, 128, 0.3)"
          stroke="rgba(128, 128, 128, 0.5)"
          strokeWidth={strokeWidth * 0.5}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ cursor: 'pointer' }}
        />
        
        {/* Excluded drone tooltip */}
        {isHovered && showDetails && (() => {
          const tooltipContent = createDroneTooltipContent(drone, true);
          const dimensions = calculateTooltipDimensions(tooltipContent);
          const position = calculateTooltipPosition(
            x, y, radius, dimensions.width, dimensions.height, canvasWidth, canvasHeight
          );
          
          return (
            <g className="pointer-events-none">
              <rect
                x={position.x}
                y={position.y}
                width={dimensions.width}
                height={dimensions.height}
                fill="rgba(0, 0, 0, 0.9)"
                rx={4}
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
    );
  }
  
  const { r, g, b } = drone.color;
  const brightness = drone.brightness;
  
  // Calculate luminance for better contrast on stroke
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  const strokeColor = luminance > 128 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)';
  
  return (
    <g>
      {/* Main drone circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={`rgb(${r}, ${g}, ${b})`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={0.85 + brightness * 0.15} // Brighter drones are more opaque
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Inner highlight for brightness indicator */}
      <circle
        cx={x}
        cy={y}
        r={radius * 0.4}
        fill="rgba(255, 255, 255, 0.3)"
        opacity={brightness}
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Hover ring effect */}
      {isHovered && (
        <circle
          cx={x}
          cy={y}
          r={radius + 2}
          fill="none"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={1}
          className="animate-pulse"
          style={{ pointerEvents: 'none' }}
        />
      )}
      
      {/* Details tooltip on hover (if enabled) */}
      {isHovered && showDetails && (() => {
        const tooltipContent = createDroneTooltipContent(drone, false);
        const dimensions = calculateTooltipDimensions(tooltipContent);
        const position = calculateTooltipPosition(
          x, y, radius, dimensions.width, dimensions.height, canvasWidth, canvasHeight
        );
        
        return (
          <g className="pointer-events-none">
            <rect
              x={position.x}
              y={position.y}
              width={dimensions.width}
              height={dimensions.height}
              fill="rgba(0, 0, 0, 0.9)"
              rx={4}
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
  );
}