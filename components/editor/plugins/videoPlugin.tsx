'use client';

import React, { useEffect } from 'react';
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

export const INSERT_VIDEO_COMMAND = createCommand<{
  src: string;
  title?: string;
  width?: number;
  height?: number;
}>('INSERT_VIDEO_COMMAND');

export interface VideoPayload {
  src: string;
  title?: string;
  width?: number;
  height?: number;
  key?: NodeKey;
}

export type SerializedVideoNode = Spread<
  {
    src: string;
    title?: string;
    width?: number;
    height?: number;
  },
  SerializedLexicalNode
>;

export class VideoNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __title?: string;
  __width?: number;
  __height?: number;

  static getType(): string {
    return 'video';
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(
      node.__src,
      node.__title,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  constructor(
    src: string,
    title?: string,
    width?: number,
    height?: number,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__title = title;
    this.__width = width || 560;
    this.__height = height || 315;
  }

  exportJSON(): SerializedVideoNode {
    return {
      src: this.getSrc(),
      title: this.getTitle(),
      width: this.getWidth(),
      height: this.getHeight(),
      type: 'video',
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const { src, title, width, height } = serializedNode;
    return $createVideoNode({ src, title, width, height });
  }

  exportDOM(): DOMExportOutput {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', this.getEmbedUrl());
    iframe.setAttribute('width', String(this.getWidth()));
    iframe.setAttribute('height', String(this.getHeight()));
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('class', 'w-full max-w-full rounded-lg shadow-sm');
    iframe.style.aspectRatio = '16/9';
    iframe.style.maxWidth = '100%';
    iframe.style.height = 'auto';
    if (this.__title) {
      iframe.setAttribute('title', this.__title);
    }
    
    // Wrap iframe in div for proper spacing
    const div = document.createElement('div');
    div.className = 'my-4';
    div.appendChild(iframe);
    
    return { element: div };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: () => ({
        conversion: (element: HTMLElement) => {
          if (element instanceof HTMLIFrameElement) {
            const { src, title, width, height } = element;
            return {
              node: $createVideoNode({
                src,
                title,
                width: width ? parseInt(width, 10) : undefined,
                height: height ? parseInt(height, 10) : undefined,
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

  getTitle(): string | undefined {
    return this.__title;
  }

  getWidth(): number {
    return this.__width || 560;
  }

  getHeight(): number {
    return this.__height || 315;
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    const className = config.theme.video;
    if (className !== undefined) {
      div.className = className;
    }
    return div;
  }

  updateDOM(): false {
    return false;
  }

  // Helper function to get YouTube embed URL
  getEmbedUrl(): string {
    const url = this.__src;
    
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?playsinline=1`;
    }
    
    // Return original URL if not a known format
    return url;
  }

  decorate(): React.JSX.Element {
    return (
      <div className="my-4">
        <iframe
          src={this.getEmbedUrl()}
          width={this.getWidth()}
          height={this.getHeight()}
          title={this.__title || 'Video'}
          frameBorder="0"
          allowFullScreen
          className="w-full max-w-full rounded-lg shadow-sm"
          style={{
            aspectRatio: '16/9',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </div>
    );
  }
}

export function $createVideoNode({
  src,
  title,
  width,
  height,
  key,
}: VideoPayload): VideoNode {
  return new VideoNode(src, title, width, height, key);
}

export function $isVideoNode(node: LexicalNode | null | undefined): node is VideoNode {
  return node instanceof VideoNode;
}

export function VideoPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([VideoNode])) {
      throw new Error('VideoPlugin: VideoNode not registered on editor');
    }

    return editor.registerCommand(
      INSERT_VIDEO_COMMAND,
      (payload: VideoPayload) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const videoNode = $createVideoNode(payload);
          selection.insertNodes([videoNode]);
        }
        return true;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  return null;
}
