/**
 * Sidebar component containing all controls
 */

import { Card } from '@/components/ui/card';
import { VertexCountSlider } from '../controls/VertexCountSlider';
import { BrightnessThreshold } from '../controls/BrightnessThreshold';
import { SamplingRadius } from '../controls/SamplingRadius';
import { ImagePreviewToggle } from '../controls/ImagePreviewToggle';
import { ExportButton } from '../controls/ExportButton';
import { ImageUpload } from '../upload/ImageUpload';
import { useImageStore } from '@/application/store/imageStore';
import { useDroneStore } from '@/application/store/droneStore';

export function Sidebar() {
  const currentImage = useImageStore((state) => state.currentImage);
  const statistics = useDroneStore((state) => state.getStatistics());
  
  return (
    <div className="w-80 bg-muted/10 border-r p-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Vertimage</h1>
          <p className="text-sm text-muted-foreground">
            Photo to Drone Light Show Converter
          </p>
        </div>
        
        {/* Upload Section */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Upload Image</h2>
          <ImageUpload />
        </Card>
        
        {/* Controls Section */}
        {currentImage && (
          <>
            <Card className="p-4 space-y-4">
              <h2 className="text-sm font-semibold">Configuration</h2>
              <VertexCountSlider />
              <BrightnessThreshold />
              <SamplingRadius />
              <ImagePreviewToggle />
            </Card>
            
            {/* Statistics */}
            {statistics && (
              <Card className="p-4">
                <h2 className="text-sm font-semibold mb-3">Statistics</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Drones:</span>
                    <span className="font-medium">{statistics.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Drones:</span>
                    <span className="font-medium text-green-600">{statistics.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Filtered Out:</span>
                    <span className="font-medium text-red-600">{statistics.filtered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Brightness:</span>
                    <span className="font-medium">
                      {(statistics.averageBrightness * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Export */}
            <ExportButton />
          </>
        )}
      </div>
    </div>
  );
}