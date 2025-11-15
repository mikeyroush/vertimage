/**
 * Mask Grid Density slider control
 * Controls the resolution of the brightness mask generation (conditional on "Avoid Dark Areas")
 */

import { Label } from '@/components/ui/label';
import { useConfigStore } from '@/application/store/configStore';

export function MaskGridDensity() {
  const maskGridDensity = useConfigStore((state) => state.maskGridDensity);
  const setMaskGridDensity = useConfigStore((state) => state.setMaskGridDensity);
  const avoidDarkAreas = useConfigStore((state) => state.avoidDarkAreas);

  // Only render when avoiding dark areas
  if (!avoidDarkAreas) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Slider */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMaskGridDensity(Math.max(10, maskGridDensity - 5))}
          className="w-8 h-8 rounded-md border border-border bg-background hover:bg-accent flex items-center justify-center text-sm font-medium"
          disabled={maskGridDensity <= 10}
        >
          −
        </button>
        <div className="flex-1">
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={maskGridDensity}
            onChange={(e) => setMaskGridDensity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        <button
          onClick={() => setMaskGridDensity(Math.min(100, maskGridDensity + 5))}
          className="w-8 h-8 rounded-md border border-border bg-background hover:bg-accent flex items-center justify-center text-sm font-medium"
          disabled={maskGridDensity >= 100}
        >
          +
        </button>
      </div>

      {/* Input field */}
      <div className="flex items-center space-x-3">
        <Label htmlFor="mask-density-input" className="text-sm font-medium whitespace-nowrap">
          Mask Grid Density
        </Label>
        <input
          id="mask-density-input"
          type="number"
          min={10}
          max={100}
          step={5}
          value={maskGridDensity}
          onChange={(e) => {
            const value = Math.max(10, Math.min(100, parseInt(e.target.value) || 10));
            setMaskGridDensity(value);
          }}
          className="w-20 px-2 py-1 text-sm border border-border rounded-md text-center bg-background"
        />
        <span className="text-xs text-muted-foreground">grid</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Higher values create more detailed brightness masks but increase computation time
      </p>
    </div>
  );
}