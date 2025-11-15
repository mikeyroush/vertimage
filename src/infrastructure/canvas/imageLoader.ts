/**
 * Image loading utilities
 */

/**
 * Loads an image from a File object
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Loads an image from a URL
 */
export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image from URL'));
    
    img.src = url;
  });
}

/**
 * Validates image dimensions
 */
export function validateImageDimensions(
  width: number,
  height: number,
  minSize: number = 100,
  maxSize: number = 4096
): { valid: boolean; error?: string } {
  if (width < minSize || height < minSize) {
    return {
      valid: false,
      error: `Image too small. Minimum size: ${minSize}x${minSize}px`,
    };
  }
  
  if (width > maxSize || height > maxSize) {
    return {
      valid: false,
      error: `Image too large. Maximum size: ${maxSize}x${maxSize}px`,
    };
  }
  
  return { valid: true };
}