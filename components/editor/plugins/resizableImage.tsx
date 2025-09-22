'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey } from 'lexical';
import { ImageNode } from './imagePlugin';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

interface ResizableImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  nodeKey: string;
}

export function ResizableImage({ src, alt, width: initialWidth, height: initialHeight, caption: initialCaption, nodeKey }: ResizableImageProps) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setIsSelected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: initialWidth || 300,
    height: initialHeight || 200,
  });
  const [showCaption, setShowCaption] = useState(false);
  const [caption, setCaption] = useState(initialCaption || '');
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startMousePos = useRef({ x: 0, y: 0 });
  const startDimensions = useRef({ width: 0, height: 0 });
  const currentDimensions = useRef({ width: initialWidth || 300, height: initialHeight || 200 });
  const resizeDirection = useRef<string>('');

  // Handle image load to get natural dimensions
  const handleImageLoad = useCallback(() => {
    if (imageRef.current && !initialWidth && !initialHeight) {
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;
      
      // Set initial size to a reasonable maximum while maintaining aspect ratio
      const maxWidth = 600;
      const maxHeight = 400;
      
      let newWidth = naturalWidth;
      let newHeight = naturalHeight;
      
      if (naturalWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = (naturalHeight * maxWidth) / naturalWidth;
      }
      
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = (naturalWidth * maxHeight) / naturalHeight;
      }
      
      setDimensions({ width: Math.round(newWidth), height: Math.round(newHeight) });
      updateNodeDimensions(Math.round(newWidth), Math.round(newHeight));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWidth, initialHeight]); // updateNodeDimensions is defined after this callback

  // Keep currentDimensions ref in sync with dimensions state
  useEffect(() => {
    currentDimensions.current = dimensions;
  }, [dimensions]);

  // Update the Lexical node with new dimensions
  const updateNodeDimensions = useCallback((width: number, height: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof ImageNode) {
        node.setWidthAndHeight(width, height);
      }
    });
  }, [editor, nodeKey]);

  // Update the Lexical node with new caption
  const updateNodeCaption = useCallback((newCaption: string) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof ImageNode) {
        node.setCaption(newCaption);
      }
    });
  }, [editor, nodeKey]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startMousePos.current.x;
    const deltaY = e.clientY - startMousePos.current.y;
    const direction = resizeDirection.current;
    
    let newWidth = startDimensions.current.width;
    let newHeight = startDimensions.current.height;
    
    // Calculate new dimensions based on resize direction
    if (direction.includes('right')) {
      newWidth = Math.max(50, startDimensions.current.width + deltaX);
    } else if (direction.includes('left')) {
      newWidth = Math.max(50, startDimensions.current.width - deltaX);
    }
    
    if (direction.includes('bottom')) {
      newHeight = Math.max(30, startDimensions.current.height + deltaY);
    } else if (direction.includes('top')) {
      newHeight = Math.max(30, startDimensions.current.height - deltaY);
    }
    
    // Maintain aspect ratio for corner handles (holding Shift)
    if ((direction === 'bottom-right' || direction === 'top-left' || 
         direction === 'bottom-left' || direction === 'top-right') && e.shiftKey) {
      const aspectRatio = startDimensions.current.width / startDimensions.current.height;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
    }
    
    // Update dimensions immediately
    const roundedWidth = Math.round(newWidth);
    const roundedHeight = Math.round(newHeight);
    currentDimensions.current = { width: roundedWidth, height: roundedHeight };
    setDimensions({ width: roundedWidth, height: roundedHeight });
  }, [isResizing]);

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      resizeDirection.current = '';
      // Use the current dimensions from the ref instead of state to avoid timing issues
      updateNodeDimensions(currentDimensions.current.width, currentDimensions.current.height);
    }
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [isResizing, updateNodeDimensions]); // handleMouseMove/handleMouseUp cause circular dependencies

  // Handle mouse down for resize handles
  const handleMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    resizeDirection.current = direction;
    startMousePos.current = { x: e.clientX, y: e.clientY };
    startDimensions.current = { ...dimensions };
    
    // Add event listeners to document for global mouse tracking
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dimensions, handleMouseMove, handleMouseUp]);

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Handle image selection
  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsSelected(true);
  }, []);

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelected]);

  // Delete image
  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  // Resize handles data
  const resizeHandles = [
    { direction: 'top-left', className: 'top-0 left-0 cursor-nw-resize' },
    { direction: 'top-right', className: 'top-0 right-0 cursor-ne-resize' },
    { direction: 'bottom-left', className: 'bottom-0 left-0 cursor-sw-resize' },
    { direction: 'bottom-right', className: 'bottom-0 right-0 cursor-se-resize' },
    { direction: 'top', className: 'top-0 left-1/2 -translate-x-1/2 cursor-n-resize' },
    { direction: 'bottom', className: 'bottom-0 left-1/2 -translate-x-1/2 cursor-s-resize' },
    { direction: 'left', className: 'left-0 top-1/2 -translate-y-1/2 cursor-w-resize' },
    { direction: 'right', className: 'right-0 top-1/2 -translate-y-1/2 cursor-e-resize' },
  ];

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${isSelected ? 'ring-2 ring-[#e27447]' : ''}`}
      onClick={handleImageClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={src}
        alt={alt || ''}
        width={dimensions.width}
        height={dimensions.height}
        className="block rounded-lg shadow-sm"
        draggable={false}
        onLoad={handleImageLoad}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          objectFit: 'cover',
        }}
      />
      
      {/* Resize handles */}
      {isSelected && (
        <>
          {resizeHandles.map(({ direction, className }) => (
            <div
              key={direction}
              className={`absolute w-3 h-3 bg-[#e27447] border border-white rounded-sm hover:bg-[#d16640] ${className}`}
              onMouseDown={(e) => handleMouseDown(e, direction)}
            />
          ))}
          
          {/* Toolbar */}
          <div className="absolute -top-10 left-0 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border p-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 cursor-pointer"
              onClick={() => setShowCaption(!showCaption)}
              title="Add Caption"
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 cursor-pointer"
              onClick={handleDelete}
              title="Delete Image"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Dimensions display */}
          <div className="absolute -bottom-6 left-0 bg-black/75 text-white text-xs px-2 py-1 rounded">
            {dimensions.width} × {dimensions.height}
          </div>
        </>
      )}
      
      {/* Caption input */}
      {showCaption && (
        <div className="mt-3">
          <input
            type="text"
            placeholder="Add a caption..."
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              updateNodeCaption(e.target.value);
            }}
            className="w-full px-3 py-2 text-sm text-center italic text-gray-600 dark:text-gray-400 bg-orange-50 dark:bg-orange-900/20 rounded-md focus:bg-orange-100 dark:focus:bg-orange-900/30 outline-none"
          />
        </div>
      )}
      
      {/* Display caption */}
      {caption && !showCaption && (
        <div className="mt-3 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-md text-sm text-center italic text-gray-600 dark:text-gray-400">
          {caption}
        </div>
      )}
    </div>
  );
}
