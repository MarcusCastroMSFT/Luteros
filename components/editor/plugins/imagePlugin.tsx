'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  createCommand,
  DecoratorNode,
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import { useEffect, ReactElement } from 'react';
import { ResizableImage } from './resizableImage';

export const INSERT_IMAGE_COMMAND = createCommand<{
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}>('INSERT_IMAGE_COMMAND');

export interface ImagePayload {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  key?: NodeKey;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    caption?: string;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string;
  __alt?: string;
  __width?: number;
  __height?: number;
  __caption?: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__alt,
      node.__width,
      node.__height,
      node.__caption,
      node.__key,
    );
  }

  constructor(
    src: string,
    alt?: string,
    width?: number,
    height?: number,
    caption?: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
    this.__caption = caption;
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.getSrc(),
      alt: this.getAlt(),
      width: this.getWidth(),
      height: this.getHeight(),
      caption: this.getCaption(),
      type: 'image',
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, alt, width, height, caption } = serializedNode;
    return $createImageNode({ src, alt, width, height, caption });
  }

  exportDOM(): DOMExportOutput {
    // Create container div for image and caption with semantic structure
    const container = document.createElement('figure');
    container.setAttribute('itemScope', '');
    container.setAttribute('itemType', 'https://schema.org/ImageObject');
    
    // Set container width to match image width
    if (this.__width) {
      container.style.width = `${this.__width}px`;
      container.style.setProperty('width', `${this.__width}px`, 'important');
    }
    container.style.display = 'inline-block'; // Keep container inline-block to respect width
    
    // Create and style the image with SEO attributes
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('itemProp', 'contentUrl');
    
    // SEO: Always provide alt text
    const altText = this.__alt || 'Imagen del artículo';
    element.setAttribute('alt', altText);
    element.setAttribute('itemProp', 'description');
    
    // SEO: Performance optimizations
    element.setAttribute('loading', 'lazy');
    element.setAttribute('decoding', 'async');
    
    // SEO: Add title attribute for better accessibility
    if (this.__alt) {
      element.setAttribute('title', this.__alt);
    }
    
    if (this.__width) {
      element.style.width = `${this.__width}px`;
      element.style.setProperty('width', `${this.__width}px`, 'important');
      element.setAttribute('width', this.__width.toString());
      element.setAttribute('itemProp', 'width');
    }
    if (this.__height) {
      element.style.height = `${this.__height}px`;
      element.style.setProperty('height', `${this.__height}px`, 'important');
      element.setAttribute('height', this.__height.toString());
      element.setAttribute('itemProp', 'height');
    }
    // Ensure the image doesn't get constrained by prose styles
    element.style.setProperty('max-width', 'none', 'important');
    element.style.setProperty('max-height', 'none', 'important');
    // Match the styling from edit mode
    element.style.setProperty('object-fit', 'cover', 'important');
    element.style.setProperty('display', 'block', 'important');
    element.style.setProperty('border-radius', '0.5rem', 'important'); // rounded-lg
    element.style.setProperty('box-shadow', '0 1px 2px 0 rgb(0 0 0 / 0.05)', 'important'); // shadow-sm
    
    container.appendChild(element);
    
    // Add caption if it exists with proper semantic markup
    if (this.__caption) {
      const captionElement = document.createElement('figcaption');
      captionElement.textContent = this.__caption;
      captionElement.setAttribute('itemProp', 'caption');
      captionElement.style.marginTop = '0.75rem'; // mt-3
      captionElement.style.padding = '0.5rem 0.75rem'; // px-3 py-2
      captionElement.style.backgroundColor = '#e6f4f5'; // bg-brand-50 (teal)
      captionElement.style.borderRadius = '0.375rem'; // rounded-md
      captionElement.style.fontSize = '0.875rem'; // text-sm
      captionElement.style.textAlign = 'center';
      captionElement.style.fontStyle = 'italic';
      captionElement.style.color = '#4b5563'; // text-gray-600
      captionElement.style.width = '100%'; // Full width of container
      captionElement.style.boxSizing = 'border-box'; // Include padding in width calculation
      container.appendChild(captionElement);
    }
    
    return { element: container };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (element: HTMLElement) => {
          if (element instanceof HTMLImageElement) {
            const { src, alt } = element;
            const width = element.width ? element.width : undefined;
            const height = element.height ? element.height : undefined;
            return {
              node: $createImageNode({
                src,
                alt,
                width,
                height,
              }),
            };
          }
          return null;
        },
        priority: 0,
      }),
    };
  }

  getSrc(): string {
    return this.__src;
  }

  getAlt(): string | undefined {
    return this.__alt;
  }

  getWidth(): number | undefined {
    return this.__width;
  }

  getHeight(): number | undefined {
    return this.__height;
  }

  getCaption(): string | undefined {
    return this.__caption;
  }

  setCaption(caption: string): void {
    const writable = this.getWritable();
    writable.__caption = caption;
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const className = config.theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): ReactElement {
    return (
      <ResizableImage
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        caption={this.__caption}
        nodeKey={this.__key}
      />
    );
  }
}

export function $createImageNode({
  src,
  alt,
  width,
  height,
  caption,
  key,
}: ImagePayload): ImageNode {
  return new ImageNode(src, alt, width, height, caption, key);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

export function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagePlugin: ImageNode not registered on editor');
    }

    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload: ImagePayload) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const imageNode = $createImageNode(payload);
          selection.insertNodes([imageNode]);
        }
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  return null;
}
