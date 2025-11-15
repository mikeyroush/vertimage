/**
 * Utility functions for dynamic tooltip sizing and positioning
 */

export interface TooltipContent {
  lines: string[];
  fontSize?: number;
  fontFamily?: string;
  padding?: { x: number; y: number };
}

export interface TooltipDimensions {
  width: number;
  height: number;
  padding: { x: number; y: number };
}

/**
 * Calculate tooltip dimensions based on text content
 * Uses approximate character width for monospace fonts
 */
export function calculateTooltipDimensions(content: TooltipContent): TooltipDimensions {
  const { 
    lines, 
    fontSize = 10, 
    padding = { x: 8, y: 6 }
  } = content;

  // Approximate character widths for common font sizes
  const charWidthMap: Record<number, number> = {
    8: 4.8,
    9: 5.4,
    10: 6.0,  // Standard monospace at 10px
    11: 6.6,
    12: 7.2,
  };

  const charWidth = charWidthMap[fontSize] || fontSize * 0.6;
  const lineHeight = fontSize * 1.4; // Standard line height ratio

  // Find the longest line
  const maxChars = Math.max(...lines.map(line => line.length));
  
  // Calculate dimensions with padding
  const contentWidth = maxChars * charWidth;
  const contentHeight = lines.length * lineHeight;
  
  return {
    width: Math.ceil(contentWidth + padding.x * 2),
    height: Math.ceil(contentHeight + padding.y * 2),
    padding,
  };
}

/**
 * Calculate optimal tooltip position to avoid viewport edges
 */
export function calculateTooltipPosition(
  anchorX: number,
  anchorY: number,
  anchorRadius: number,
  tooltipWidth: number,
  tooltipHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  offset = 5
): { x: number; y: number; position: 'right' | 'left' | 'top' | 'bottom' } {
  const positions = [
    // Right side (preferred)
    {
      x: anchorX + anchorRadius + offset,
      y: anchorY - tooltipHeight / 2,
      position: 'right' as const,
      priority: 1,
    },
    // Left side
    {
      x: anchorX - anchorRadius - offset - tooltipWidth,
      y: anchorY - tooltipHeight / 2,
      position: 'left' as const,
      priority: 2,
    },
    // Top
    {
      x: anchorX - tooltipWidth / 2,
      y: anchorY - anchorRadius - offset - tooltipHeight,
      position: 'top' as const,
      priority: 3,
    },
    // Bottom
    {
      x: anchorX - tooltipWidth / 2,
      y: anchorY + anchorRadius + offset,
      position: 'bottom' as const,
      priority: 4,
    },
  ];

  // Find the first position that fits within the canvas
  for (const pos of positions.sort((a, b) => a.priority - b.priority)) {
    const fitsHorizontally = pos.x >= 0 && pos.x + tooltipWidth <= canvasWidth;
    const fitsVertically = pos.y >= 0 && pos.y + tooltipHeight <= canvasHeight;
    
    if (fitsHorizontally && fitsVertically) {
      return pos;
    }
  }

  // Fallback: clamp to canvas bounds (right side)
  const fallbackPos = positions[0];
  return {
    x: Math.max(0, Math.min(fallbackPos.x, canvasWidth - tooltipWidth)),
    y: Math.max(0, Math.min(fallbackPos.y, canvasHeight - tooltipHeight)),
    position: 'right',
  };
}

/**
 * Create tooltip content for drone data
 */
export function createDroneTooltipContent(drone: any, isExcluded = false): TooltipContent {
  if (isExcluded) {
    return {
      lines: [
        `Position: (${Math.round(drone.position.x)}, ${Math.round(drone.position.y)})`,
        `Brightness: ${Math.round((drone.brightness || 0) * 100)}%`,
        'Status: Excluded (too dark)',
      ],
    };
  }

  const { r, g, b } = drone.color;
  return {
    lines: [
      `Drone ID: ${drone.id}`,
      `Position: (${Math.round(drone.position.x)}, ${Math.round(drone.position.y)})`,
      `RGB: (${r}, ${g}, ${b})`,
      `Brightness: ${Math.round(drone.brightness * 100)}%`,
    ],
  };
}