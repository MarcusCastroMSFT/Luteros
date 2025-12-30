/**
 * Image compression utility for optimizing uploaded images
 * Compresses images while maintaining quality
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, default 0.85
  maxSizeMB?: number;
  convertToFormat?: 'jpeg' | 'png' | 'webp';
}

/**
 * Compress an image file to reduce size while maintaining quality
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<{ file: File; dataUrl: string; originalSize: number; compressedSize: number }> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    maxSizeMB = 5,
    convertToFormat = 'jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = document.createElement('img');
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = Math.min(width, maxWidth);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, maxHeight);
              width = height * aspectRatio;
            }
          }
          
          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Determine output format
          const mimeType = convertToFormat === 'png' 
            ? 'image/png' 
            : convertToFormat === 'webp'
            ? 'image/webp'
            : 'image/jpeg';
          
          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              
              const compressedSize = blob.size;
              const compressedSizeMB = compressedSize / (1024 * 1024);
              
              // Check if compressed size is within limit
              if (compressedSizeMB > maxSizeMB) {
                // Try with lower quality
                const newQuality = Math.max(0.5, quality - 0.1);
                if (newQuality >= 0.5) {
                  // Recursively try with lower quality
                  compressImage(file, { ...options, quality: newQuality })
                    .then(resolve)
                    .catch(reject);
                  return;
                }
                reject(new Error(`Compressed image still exceeds ${maxSizeMB}MB limit`));
                return;
              }
              
              // Create new file from blob
              const extension = convertToFormat === 'png' ? 'png' : convertToFormat === 'webp' ? 'webp' : 'jpg';
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, `.${extension}`),
                { type: mimeType }
              );
              
              // Convert to data URL for preview
              const dataUrlReader = new FileReader();
              dataUrlReader.onload = (event) => {
                resolve({
                  file: compressedFile,
                  dataUrl: event.target?.result as string,
                  originalSize: file.size,
                  compressedSize: blob.size,
                });
              };
              dataUrlReader.onerror = () => reject(new Error('Failed to create data URL'));
              dataUrlReader.readAsDataURL(blob);
            },
            mimeType,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate compression percentage
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): number {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
