/**
 * Toggle control for showing/hiding image preview
 */

import { Label } from '@/components/ui/label';
import { useConfigStore } from '@/application/store/configStore';

export function ImagePreviewToggle() {
  const showImagePreview = useConfigStore((state) => state.showImagePreview);
  const setShowImagePreview = useConfigStore((state) => state.setShowImagePreview);

  return (
    <div className="space-y-3">
      <Label htmlFor="image-preview-toggle" className="text-sm font-medium">
        Display Options
      </Label>
      
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
    </div>
  );
}