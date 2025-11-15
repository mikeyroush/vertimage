/**
 * Toggle control for avoiding dark areas in vertex distribution
 */

import { Label } from '@/components/ui/label';
import { useConfigStore } from '@/application/store/configStore';

export function AvoidDarkAreasToggle() {
  const avoidDarkAreas = useConfigStore((state) => state.avoidDarkAreas);
  const setAvoidDarkAreas = useConfigStore((state) => state.setAvoidDarkAreas);

  return (
    <div className="space-y-3">
      <Label htmlFor="avoid-dark-areas-toggle" className="text-sm font-medium">
        Smart Placement
      </Label>
      
      <div className="flex items-center space-x-3">
        <input
          id="avoid-dark-areas-toggle"
          type="checkbox"
          checked={avoidDarkAreas}
          onChange={(e) => setAvoidDarkAreas(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <Label htmlFor="avoid-dark-areas-toggle" className="text-sm cursor-pointer">
          Avoid Dark Areas
        </Label>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {avoidDarkAreas 
          ? 'Placing vertices in brighter areas when possible'
          : 'Standard placement ignoring image brightness'
        }
      </p>
    </div>
  );
}