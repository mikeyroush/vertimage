/**
 * Individual drone preview component with enhanced visualization
 */

import { useState } from 'react';
import { DroneData } from '@/domain/types';

interface DronePreviewProps {
  drone: DroneData;
  x: number;
  y: number;
  scale: number;
  showDetails?: boolean;
}

export function DronePreview({ drone, x, y, scale, showDetails = false }: DronePreviewProps) {
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
        {isHovered && showDetails && (
          <g className="pointer-events-none">
            <rect
              x={x + radius + 5}
              y={y - 25}
              width={120}
              height={30}
              fill="rgba(0, 0, 0, 0.9)"
              rx={4}
            />
            <text
              x={x + radius + 10}
              y={y - 10}
              fill="white"
              fontSize="10"
              fontFamily="monospace"
            >
              Excluded (too dark)
            </text>
          </g>
        )}
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
      {isHovered && showDetails && (
        <g className="pointer-events-none">
          <rect
            x={x + radius + 5}
            y={y - 35}
            width={140}
            height={55}
            fill="rgba(0, 0, 0, 0.9)"
            rx={4}
          />
          <text
            x={x + radius + 10}
            y={y - 25}
            fill="white"
            fontSize="10"
            fontFamily="monospace"
          >
            Drone ID: {drone.id}
          </text>
          <text
            x={x + radius + 10}
            y={y - 15}
            fill="white"
            fontSize="10"
            fontFamily="monospace"
          >
            Position: ({Math.round(drone.position.x)}, {Math.round(drone.position.y)})
          </text>
          <text
            x={x + radius + 10}
            y={y - 5}
            fill="white"
            fontSize="10"
            fontFamily="monospace"
          >
            RGB: ({r}, {g}, {b})
          </text>
          <text
            x={x + radius + 10}
            y={y + 5}
            fill="white"
            fontSize="10"
            fontFamily="monospace"
          >
            Brightness: {Math.round(brightness * 100)}%
          </text>
        </g>
      )}
    </g>
  );
}