/**
 * Canvas utility functions for image processing
 */

/**
 * Calculates the optimal canvas dimensions maintaining aspect ratio
 */
export function calculateCanvasDimensions(
  imageWidth: number,
  imageHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number; scale: number } {
  const imageAspectRatio = imageWidth / imageHeight;
  const containerAspectRatio = maxWidth / maxHeight;
  
  let width: number;
  let height: number;
  
  if (imageAspectRatio > containerAspectRatio) {
    // Image is wider - fit to width
    width = Math.min(imageWidth, maxWidth);
    height = width / imageAspectRatio;
  } else {
    // Image is taller - fit to height
    height = Math.min(imageHeight, maxHeight);
    width = height * imageAspectRatio;
  }
  
  const scale = Math.min(width / imageWidth, height / imageHeight);
  
  return { width, height, scale };
}

/**
 * Clears a canvas with transparent background
 */
export function clearCanvas(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/**
 * Draws an image to canvas with proper scaling and centering
 */
export function drawImageToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  scale: number = 1
): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  
  // Clear canvas first
  clearCanvas(canvas);
  
  // Calculate centered position
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const x = (canvas.width - scaledWidth) / 2;
  const y = (canvas.height - scaledHeight) / 2;
  
  // Draw image
  context.drawImage(image, x, y, scaledWidth, scaledHeight);
}

/**
 * Converts screen coordinates to image coordinates
 */
export function screenToImageCoordinates(
  screenX: number,
  screenY: number,
  canvasRect: DOMRect,
  imageWidth: number,
  imageHeight: number,
  scale: number
): { x: number; y: number } {
  // Convert screen coordinates to canvas coordinates
  const canvasX = screenX - canvasRect.left;
  const canvasY = screenY - canvasRect.top;
  
  // Account for centering offset
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;
  const offsetX = (canvasRect.width - scaledWidth) / 2;
  const offsetY = (canvasRect.height - scaledHeight) / 2;
  
  // Convert to image coordinates
  const imageX = (canvasX - offsetX) / scale;
  const imageY = (canvasY - offsetY) / scale;
  
  return { 
    x: Math.max(0, Math.min(imageWidth, imageX)), 
    y: Math.max(0, Math.min(imageHeight, imageY))
  };
}