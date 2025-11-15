/**
 * Custom tooltip component with portal rendering
 */

import { useState, useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
  offset?: number;
}

export function Tooltip({ 
  content, 
  children, 
  className, 
  delay = 300, 
  offset = 8 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  
  const showTooltip = (event: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const rect = (event.target as Element).getBoundingClientRect();
      const tooltipX = rect.left + rect.width / 2;
      const tooltipY = rect.top - offset;
      
      // Adjust position to keep tooltip in viewport
      const viewportWidth = window.innerWidth;
      
      let adjustedX = tooltipX;
      let adjustedY = tooltipY;
      
      // Keep tooltip within horizontal bounds
      if (adjustedX < 100) adjustedX = rect.right + offset;
      if (adjustedX > viewportWidth - 200) adjustedX = rect.left - 200 - offset;
      
      // Keep tooltip within vertical bounds
      if (adjustedY < 100) adjustedY = rect.bottom + offset;
      
      setPosition({ x: adjustedX, y: adjustedY });
      setIsVisible(true);
    }, delay);
  };
  
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div
          className={cn(
            "fixed z-50 px-3 py-2 text-xs text-white bg-black rounded-md shadow-lg pointer-events-none",
            "transform -translate-x-1/2",
            className
          )}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {content}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}