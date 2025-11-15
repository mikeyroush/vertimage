/**
 * Complete image upload component with preview
 */

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { DropZone } from './DropZone';
import { useImageStore } from '@/application/store/imageStore';
import { useImageProcessor } from '@/application/hooks/useImageProcessor';

export function ImageUpload() {
  const { currentImage } = useImageStore();
  const { cleanup } = useImageProcessor();
  
  if (currentImage) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium truncate">
              {currentImage.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentImage.width} × {currentImage.height}px
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={cleanup}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="aspect-video bg-muted rounded-md overflow-hidden">
          <img
            src={currentImage.url}
            alt="Uploaded"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }
  
  return <DropZone />;
}