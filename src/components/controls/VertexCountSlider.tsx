/**
 * Slider control for adjusting the number of drones
 */

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { useConfigStore } from '@/application/store/configStore';
import { CONSTRAINTS } from '@/domain/constants/defaults';

export function VertexCountSlider() {
  const { vertexCount, setVertexCount } = useConfigStore();
  const [inputValue, setInputValue] = useState(vertexCount.toString());
  
  // Sync input with store when store changes
  useEffect(() => {
    setInputValue(vertexCount.toString());
  }, [vertexCount]);
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Only update store if value is valid
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(
        CONSTRAINTS.MIN_VERTEX_COUNT,
        Math.min(CONSTRAINTS.MAX_VERTEX_COUNT, numValue)
      );
      setVertexCount(clampedValue);
    }
  };
  
  const handleInputBlur = () => {
    // Ensure input shows the actual store value on blur
    setInputValue(vertexCount.toString());
  };
  
  const increment = () => {
    const newValue = Math.min(CONSTRAINTS.MAX_VERTEX_COUNT, vertexCount + 10);
    setVertexCount(newValue);
  };
  
  const decrement = () => {
    const newValue = Math.max(CONSTRAINTS.MIN_VERTEX_COUNT, vertexCount - 10);
    setVertexCount(newValue);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="vertex-count" className="text-sm font-medium">
          Number of Drones
        </Label>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={decrement}
            disabled={vertexCount <= CONSTRAINTS.MIN_VERTEX_COUNT}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            id="vertex-count"
            type="number"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            min={CONSTRAINTS.MIN_VERTEX_COUNT}
            max={CONSTRAINTS.MAX_VERTEX_COUNT}
            step={10}
            className="w-20 text-center text-sm h-8"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={increment}
            disabled={vertexCount >= CONSTRAINTS.MAX_VERTEX_COUNT}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <Slider
        min={CONSTRAINTS.MIN_VERTEX_COUNT}
        max={CONSTRAINTS.MAX_VERTEX_COUNT}
        step={10}
        value={[vertexCount]}
        onValueChange={([value]) => setVertexCount(value)}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{CONSTRAINTS.MIN_VERTEX_COUNT}</span>
        <span>{CONSTRAINTS.MAX_VERTEX_COUNT}</span>
      </div>
    </div>
  );
}