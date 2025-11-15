/**
 * Brightness mask overlay component for visualizing valid placement areas
 */

import { BrightnessMask } from '@/domain/algorithms/brightnessMask';

interface BrightnessMaskOverlayProps {
  mask: BrightnessMask;
  canvasWidth: number;
  canvasHeight: number;
  imageWidth: number;
  imageHeight: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function BrightnessMaskOverlay({
  mask,
  canvasWidth,
  canvasHeight,
  imageWidth,
  imageHeight,
  scale,
  offsetX,
  offsetY,
}: BrightnessMaskOverlayProps) {
  // Calculate scaled dimensions for the overlay
  const scaledImageWidth = imageWidth * scale;
  const scaledImageHeight = imageHeight * scale;
  
  // Calculate cell dimensions on the scaled canvas
  const cellWidth = scaledImageWidth / mask.width;
  const cellHeight = scaledImageHeight / mask.height;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ width: canvasWidth, height: canvasHeight }}
    >
      <svg
        width={canvasWidth}
        height={canvasHeight}
        className="absolute inset-0"
        style={{ 
          width: canvasWidth, 
          height: canvasHeight,
          zIndex: 1, // Above image, below vertices
        }}
      >
        {/* Mask overlay grid */}
        <g className="brightness-mask-overlay">
          {mask.grid.map((row, rowIndex) =>
            row.map((isBright, colIndex) => {
              // Calculate position on the scaled canvas
              const x = offsetX + colIndex * cellWidth;
              const y = offsetY + rowIndex * cellHeight;
              
              // Skip cells that are outside the visible area
              if (x + cellWidth < 0 || y + cellHeight < 0 || 
                  x > canvasWidth || y > canvasHeight) {
                return null;
              }
              
              return (
                <rect
                  key={`mask-cell-${rowIndex}-${colIndex}`}
                  x={x}
                  y={y}
                  width={cellWidth}
                  height={cellHeight}
                  fill={isBright ? 'rgba(0, 255, 0, 0.15)' : 'rgba(255, 0, 0, 0.1)'}
                  stroke={isBright ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.2)'}
                  strokeWidth={0.5}
                />
              );
            })
          )}
        </g>
        
        {/* Optional: Add a legend */}
        <g className="mask-legend">
          <rect
            x={10}
            y={10}
            width={120}
            height={60}
            fill="rgba(0, 0, 0, 0.8)"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={1}
            rx={4}
          />
          
          {/* Bright areas indicator */}
          <rect
            x={15}
            y={18}
            width={12}
            height={12}
            fill="rgba(0, 255, 0, 0.3)"
            stroke="rgba(0, 255, 0, 0.6)"
            strokeWidth={1}
          />
          <text
            x={32}
            y={28}
            fill="white"
            fontSize="10"
            fontFamily="monospace"
          >
            Bright Areas
          </text>
          
          {/* Dark areas indicator */}
          <rect
            x={15}
            y={38}
            width={12}
            height={12}
            fill="rgba(255, 0, 0, 0.2)"
            stroke="rgba(255, 0, 0, 0.4)"
            strokeWidth={1}
          />
          <text
            x={32}
            y={48}
            fill="white"
            fontSize="10"
            fontFamily="monospace"
          >
            Dark Areas
          </text>
          
          {/* Statistics */}
          <text
            x={15}
            y={62}
            fill="white"
            fontSize="9"
            fontFamily="monospace"
          >
            {mask.brightCellPercentage.toFixed(1)}% bright
          </text>
        </g>
      </svg>
    </div>
  );
}