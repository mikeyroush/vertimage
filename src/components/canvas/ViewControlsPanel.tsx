/**
 * Enhanced view controls panel with hover states and visual indicators
 * Minimized by default, expands on hover with smooth transitions
 */

import { useState } from 'react';
import { useConfigStore } from '@/application/store/configStore';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

export function ViewControlsPanel() {
  const [isHovered, setIsHovered] = useState(false);
  
  const showImagePreview = useConfigStore((state) => state.showImagePreview);
  const setShowImagePreview = useConfigStore((state) => state.setShowImagePreview);
  const showVertices = useConfigStore((state) => state.showVertices);
  const setShowVertices = useConfigStore((state) => state.setShowVertices);
  const showDetails = useConfigStore((state) => state.showDetails);
  const setShowDetails = useConfigStore((state) => state.setShowDetails);
  const avoidDarkAreas = useConfigStore((state) => state.avoidDarkAreas);
  const showBrightnessMask = useConfigStore((state) => state.showBrightnessMask);
  const setShowBrightnessMask = useConfigStore((state) => state.setShowBrightnessMask);
  const zoomLevel = useConfigStore((state) => state.zoomLevel);
  const setZoomLevel = useConfigStore((state) => state.setZoomLevel);

  return (
    <div className="absolute top-4 right-4 z-20">
      <div
        className={`
          bg-black/60 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl
          transition-all duration-300 ease-out cursor-pointer
          ${isHovered ? 'bg-black/80 p-3' : 'bg-black/40 p-2'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered ? (
          // Expanded state - full controls
          <div className="space-y-2 min-w-[140px]">
            <div className="text-white text-xs font-medium opacity-75 mb-3">
              View Controls
            </div>
            
            {/* Image Preview Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showImagePreview}
                onChange={(e) => setShowImagePreview(e.target.checked)}
                className="w-3 h-3 text-blue-500 bg-transparent border border-white/40 rounded focus:ring-blue-400 focus:ring-1"
              />
              <span className="text-white text-xs group-hover:text-blue-200 transition-colors">
                Image Preview
              </span>
            </label>
            
            {/* Vertices Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showVertices}
                onChange={(e) => setShowVertices(e.target.checked)}
                className="w-3 h-3 text-blue-500 bg-transparent border border-white/40 rounded focus:ring-blue-400 focus:ring-1"
              />
              <span className="text-white text-xs group-hover:text-blue-200 transition-colors">
                Show Vertices
              </span>
            </label>
            
            {/* Details Toggle - Only show when vertices are visible */}
            {showVertices && (
              <label className="flex items-center space-x-2 cursor-pointer group ml-3">
                <input
                  type="checkbox"
                  checked={showDetails}
                  onChange={(e) => setShowDetails(e.target.checked)}
                  className="w-3 h-3 text-blue-500 bg-transparent border border-white/40 rounded focus:ring-blue-400 focus:ring-1"
                />
                <span className="text-white text-xs group-hover:text-blue-200 transition-colors">
                  Show Details
                </span>
              </label>
            )}
            
            {/* Brightness Mask Toggle - Only show when avoiding dark areas */}
            {avoidDarkAreas && (
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showBrightnessMask}
                  onChange={(e) => setShowBrightnessMask(e.target.checked)}
                  className="w-3 h-3 text-blue-500 bg-transparent border border-white/40 rounded focus:ring-blue-400 focus:ring-1"
                />
                <span className="text-white text-xs group-hover:text-blue-200 transition-colors">
                  Brightness Mask
                </span>
              </label>
            )}
            
            {/* Zoom Controls */}
            <div className="border-t border-white/20 my-3 pt-3">
              <div className="text-white text-xs font-medium opacity-75 mb-2">
                Zoom: {(zoomLevel * 100).toFixed(0)}%
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoomLevel(zoomLevel - 0.25)}
                  disabled={zoomLevel <= 0.5}
                  className="h-6 px-2 text-white hover:bg-white/20 text-xs"
                >
                  −
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoomLevel(1.0)}
                  className="h-6 px-2 text-white hover:bg-white/20 text-xs"
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoomLevel(zoomLevel + 0.25)}
                  disabled={zoomLevel >= 3.0}
                  className="h-6 px-2 text-white hover:bg-white/20 text-xs"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Minimized state - accessible button indicators
          <div className="flex items-center space-x-1">
            {/* Image Preview Indicator */}
            <Tooltip content="Toggle Image Preview">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowImagePreview(!showImagePreview)}
                aria-label={`Image Preview ${showImagePreview ? 'enabled' : 'disabled'}`}
                className="w-6 h-6 p-0 hover:bg-white/20"
              >
                <div 
                  className={`w-2.5 h-2.5 rounded-full border ${
                    showImagePreview 
                      ? 'bg-green-500 border-green-400' 
                      : 'bg-gray-700 border-gray-600'
                  }`}
                />
              </Button>
            </Tooltip>
            
            {/* Vertices Indicator */}
            <Tooltip content="Toggle Vertex Display">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowVertices(!showVertices)}
                aria-label={`Show Vertices ${showVertices ? 'enabled' : 'disabled'}`}
                className="w-6 h-6 p-0 hover:bg-white/20"
              >
                <div 
                  className={`w-2.5 h-2.5 rounded-full border ${
                    showVertices 
                      ? 'bg-blue-500 border-blue-400' 
                      : 'bg-gray-700 border-gray-600'
                  }`}
                />
              </Button>
            </Tooltip>
            
            {/* Details Indicator - Only show when vertices are enabled */}
            {showVertices && (
              <Tooltip content="Toggle Vertex Details">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowDetails(!showDetails)}
                  aria-label={`Show Details ${showDetails ? 'enabled' : 'disabled'}`}
                  className="w-5 h-5 p-0 hover:bg-white/20"
                >
                  <div 
                    className={`w-2 h-2 rounded-full border ${
                      showDetails 
                        ? 'bg-blue-400 border-blue-300' 
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  />
                </Button>
              </Tooltip>
            )}
            
            {/* Brightness Mask Indicator - Only show when avoiding dark areas */}
            {avoidDarkAreas && (
              <Tooltip content="Toggle Brightness Mask">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowBrightnessMask(!showBrightnessMask)}
                  aria-label={`Brightness Mask ${showBrightnessMask ? 'enabled' : 'disabled'}`}
                  className="w-6 h-6 p-0 hover:bg-white/20"
                >
                  <div 
                    className={`w-2.5 h-2.5 border ${
                      showBrightnessMask 
                        ? 'bg-green-500 border-green-400' 
                        : 'bg-gray-700 border-gray-600'
                    }`}
                    style={{
                      clipPath: 'polygon(0 0, 50% 0, 50% 50%, 100% 50%, 100% 100%, 50% 100%, 50% 50%, 0 50%)'
                    }}
                  />
                </Button>
              </Tooltip>
            )}
            
            {/* Zoom Controls in Minimized State */}
            {zoomLevel !== 1.0 && (
              <div className="text-white text-[10px] opacity-75 ml-1">
                {(zoomLevel * 100).toFixed(0)}%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}