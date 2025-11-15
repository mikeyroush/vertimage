/**
 * Slider control for adjusting brightness threshold
 */

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useConfigStore } from '@/application/store/configStore';
import { CONSTRAINTS } from '@/domain/constants/defaults';

export function BrightnessThreshold() {
  const { brightnessThreshold, setBrightnessThreshold } = useConfigStore();
  const [inputValue, setInputValue] = useState((brightnessThreshold * 100).toFixed(0));
  
  // Sync input with store when store changes
  useEffect(() => {
    setInputValue((brightnessThreshold * 100).toFixed(0));
  }, [brightnessThreshold]);
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Only update store if value is valid
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(
        CONSTRAINTS.MIN_BRIGHTNESS_THRESHOLD * 100,
        Math.min(CONSTRAINTS.MAX_BRIGHTNESS_THRESHOLD * 100, numValue)
      );
      setBrightnessThreshold(clampedValue / 100);
    }
  };
  
  const handleInputBlur = () => {
    // Ensure input shows the actual store value on blur
    setInputValue((brightnessThreshold * 100).toFixed(0));
  };
  
  const increment = () => {
    const newValue = Math.min(CONSTRAINTS.MAX_BRIGHTNESS_THRESHOLD, brightnessThreshold + 0.05);
    setBrightnessThreshold(newValue);
  };
  
  const decrement = () => {
    const newValue = Math.max(CONSTRAINTS.MIN_BRIGHTNESS_THRESHOLD, brightnessThreshold - 0.05);
    setBrightnessThreshold(newValue);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="brightness-threshold" className="text-sm font-medium">
          Brightness Threshold
        </Label>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={decrement}
            disabled={brightnessThreshold <= CONSTRAINTS.MIN_BRIGHTNESS_THRESHOLD}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="relative">
            <Input
              id="brightness-threshold"
              type="number"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleInputBlur}
              min={CONSTRAINTS.MIN_BRIGHTNESS_THRESHOLD * 100}
              max={CONSTRAINTS.MAX_BRIGHTNESS_THRESHOLD * 100}
              step={1}
              className="w-20 text-center text-sm h-8 pr-6"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              %
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={increment}
            disabled={brightnessThreshold >= CONSTRAINTS.MAX_BRIGHTNESS_THRESHOLD}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <Slider
        min={CONSTRAINTS.MIN_BRIGHTNESS_THRESHOLD * 100}
        max={CONSTRAINTS.MAX_BRIGHTNESS_THRESHOLD * 100}
        step={1}
        value={[brightnessThreshold * 100]}
        onValueChange={([value]) => setBrightnessThreshold(value / 100)}
        className="w-full"
      />
      
      <p className="text-xs text-muted-foreground">
        Drones in areas darker than this will be excluded
      </p>
    </div>
  );
}