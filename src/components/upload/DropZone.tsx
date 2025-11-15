/**
 * Drag-and-drop zone for image upload
 */

import { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageProcessor } from '@/application/hooks/useImageProcessor';
import { useImageStore } from '@/application/store/imageStore';

export function DropZone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const { processImageFile } = useImageProcessor();
  const { isLoading, error } = useImageStore();
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      processImageFile(imageFile);
    }
  }, [processImageFile]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  }, [processImageFile]);
  
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragOver ? "border-primary bg-primary/10" : "border-border",
        isLoading && "opacity-50 pointer-events-none"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="space-y-4">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
        
        <div>
          <p className="text-sm font-medium">
            {isLoading ? 'Processing...' : 'Drop an image here'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse files
          </p>
        </div>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2 text-destructive text-sm">
            <X className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
}