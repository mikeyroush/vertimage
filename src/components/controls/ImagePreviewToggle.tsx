/**
 * Toggle controls for display options including image preview and brightness mask
 */

import { Label } from '@/components/ui/label';
import { useConfigStore } from '@/application/store/configStore';

export function ImagePreviewToggle() {
  const showImagePreview = useConfigStore((state) => state.showImagePreview);
  const setShowImagePreview = useConfigStore((state) => state.setShowImagePreview);
  const showBrightnessMask = useConfigStore((state) => state.showBrightnessMask);
  const setShowBrightnessMask = useConfigStore((state) => state.setShowBrightnessMask);
  const avoidDarkAreas = useConfigStore((state) => state.avoidDarkAreas);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Display Options
      </Label>
      
      {/* Image Preview Toggle */}
      <div className="flex items-center space-x-3">
        <input
          id="image-preview-toggle"
          type="checkbox"
          checked={showImagePreview}
          onChange={(e) => setShowImagePreview(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <Label htmlFor="image-preview-toggle" className="text-sm cursor-pointer">
          Show Image Preview
        </Label>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {showImagePreview 
          ? 'Displaying vertices over the uploaded image'
          : 'Showing vertices only without background image'
        }
      </p>
      
      {/* Brightness Mask Toggle - Only show when avoiding dark areas */}
      {avoidDarkAreas && (
        <>
          <div className="flex items-center space-x-3">
            <input
              id="brightness-mask-toggle"
              type="checkbox"
              checked={showBrightnessMask}
              onChange={(e) => setShowBrightnessMask(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <Label htmlFor="brightness-mask-toggle" className="text-sm cursor-pointer">
              Show Brightness Mask
            </Label>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Visualize bright and dark areas used for placement
          </p>
        </>
      )}
    </div>
  );
}