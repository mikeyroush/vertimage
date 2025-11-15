/**
 * Conditional brightness mask visibility toggle
 * Only appears when "Avoid Dark Areas" is enabled
 */

import { useConfigStore } from '@/application/store/configStore';

export function BrightnessMaskToggle() {
  const showBrightnessMask = useConfigStore((state) => state.showBrightnessMask);
  const avoidDarkAreas = useConfigStore((state) => state.avoidDarkAreas);
  const setShowBrightnessMask = useConfigStore((state) => state.setShowBrightnessMask);
  
  // Only render when brightness-aware mode is active
  if (!avoidDarkAreas) {
    return null;
  }
  
  return (
    <div className="space-y-3">
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={showBrightnessMask}
          onChange={(e) => setShowBrightnessMask(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            Show Brightness Mask
          </span>
          <span className="text-xs text-gray-500">
            Visualize bright and dark areas used for placement
          </span>
        </div>
      </label>
    </div>
  );
}