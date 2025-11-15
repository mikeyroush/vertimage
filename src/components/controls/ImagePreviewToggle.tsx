/**
 * Note: Display controls have been moved to the View Controls Panel in the preview area.
 * This component can be removed once the sidebar is reorganized.
 */

import { Label } from '@/components/ui/label';

export function ImagePreviewToggle() {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">
        Display Options
      </Label>
      
      <p className="text-xs text-muted-foreground">
        Display controls are now available in the View Controls Panel located in the preview area.
      </p>
    </div>
  );
}