/**
 * Slider control for adjusting color sampling radius
 */

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useConfigStore } from '@/application/store/configStore';
import { CONSTRAINTS } from '@/domain/constants/defaults';

export function SamplingRadius() {
  const { samplingRadius, setSamplingRadius } = useConfigStore();
  const [inputValue, setInputValue] = useState(samplingRadius.toString());
  
  // Sync input with store when store changes
  useEffect(() => {
    setInputValue(samplingRadius.toString());
  }, [samplingRadius]);
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Only update store if value is valid
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(
        CONSTRAINTS.MIN_SAMPLING_RADIUS,
        Math.min(CONSTRAINTS.MAX_SAMPLING_RADIUS, numValue)
      );
      setSamplingRadius(clampedValue);
    }
  };
  
  const handleInputBlur = () => {
    // Ensure input shows the actual store value on blur
    setInputValue(samplingRadius.toString());
  };
  
  const increment = () => {
    const newValue = Math.min(CONSTRAINTS.MAX_SAMPLING_RADIUS, samplingRadius + 1);
    setSamplingRadius(newValue);
  };
  
  const decrement = () => {
    const newValue = Math.max(CONSTRAINTS.MIN_SAMPLING_RADIUS, samplingRadius - 1);
    setSamplingRadius(newValue);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="sampling-radius" className="text-sm font-medium">
          Color Sampling Radius
        </Label>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={decrement}
            disabled={samplingRadius <= CONSTRAINTS.MIN_SAMPLING_RADIUS}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="relative">
            <Input
              id="sampling-radius"
              type="number"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleInputBlur}
              min={CONSTRAINTS.MIN_SAMPLING_RADIUS}
              max={CONSTRAINTS.MAX_SAMPLING_RADIUS}
              step={1}
              className="w-20 text-center text-sm h-8 pr-6"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              px
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={increment}
            disabled={samplingRadius >= CONSTRAINTS.MAX_SAMPLING_RADIUS}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <Slider
        min={CONSTRAINTS.MIN_SAMPLING_RADIUS}
        max={CONSTRAINTS.MAX_SAMPLING_RADIUS}
        step={1}
        value={[samplingRadius]}
        onValueChange={([value]) => setSamplingRadius(value)}
        className="w-full"
      />
      
      <p className="text-xs text-muted-foreground">
        Area around each drone to sample color from
      </p>
    </div>
  );
}