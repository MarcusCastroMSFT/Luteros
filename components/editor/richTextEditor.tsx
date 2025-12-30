'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  TEXT_FORMAT_TRANSFORMERS,
  ELEMENT_TRANSFORMERS,
} from '@lexical/markdown';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { HashtagNode } from '@lexical/hashtag';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';
import type { EditorState, LexicalEditor } from 'lexical';

import { ToolbarPlugin } from './plugins/toolbarPluginSimple';
import { FileOperationsBar } from './plugins/fileOperationsBar';
import { ImagePlugin, ImageNode } from './plugins/imagePlugin';
import { VideoPlugin, VideoNode } from './plugins/videoPlugin';
import { FilePlugin } from './plugins/filePlugin';
import { ClickableLinkPlugin } from './plugins/clickableLinkPlugin';
import { PreviewContent } from './plugins/previewContent';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Plugin to initialize editor with HTML content
function InitialContentPlugin({ html }: { html?: string }) {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!html || hasInitialized.current) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
    });

    hasInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return null;
}

// URL matchers for AutoLinkPlugin
const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const EMAIL_MATCHER = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
    };
  },
  (text: string) => {
    const match = EMAIL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: `mailto:${fullMatch}`,
    };
  },
];

// Custom markdown transformers configuration
// Custom behavior: *text* = bold, **text** = italic (non-standard but per user request)
const customTransformers = [
  // Custom bold transformer: *text* makes bold (swapped from standard)
  {
    format: ['bold'] as const,
    tag: '*',
    intraword: true,
    type: 'text-format' as const,
  },
  // Custom italic transformer: **text** makes italic (swapped from standard)
  {
    format: ['italic'] as const, 
    tag: '**',
    intraword: true,
    type: 'text-format' as const,
  },
  // Use remaining text format transformers (code, etc.)
  ...TEXT_FORMAT_TRANSFORMERS.filter(t => !['bold', 'italic'].includes(t.format[0])),
  // Use default element transformers for headings (# ## ###) and other elements
  ...ELEMENT_TRANSFORMERS,
];

const theme = {
  // Paragraph
  paragraph: 'mb-2 text-gray-900 dark:text-gray-100',
  
  // Headings
  heading: {
    h1: 'text-3xl font-bold mb-4 text-gray-900 dark:text-white',
    h2: 'text-2xl font-semibold mb-3 text-gray-900 dark:text-white',
    h3: 'text-xl font-semibold mb-3 text-gray-900 dark:text-white',
    h4: 'text-lg font-medium mb-2 text-gray-900 dark:text-white',
    h5: 'text-base font-medium mb-2 text-gray-900 dark:text-white',
    h6: 'text-sm font-medium mb-2 text-gray-900 dark:text-white',
  },
  
  // Lists
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal ml-4 mb-2',
    ul: 'list-disc ml-4 mb-2',
    listitem: 'mb-1',
    listitemChecked: 'relative list-none ml-4 mb-1 pl-6 before:content-["✓"] before:absolute before:left-0 before:text-green-500',
    listitemUnchecked: 'relative list-none ml-4 mb-1 pl-6 before:content-["○"] before:absolute before:left-0 before:text-gray-400',
  },
  
  // Quote
  quote: 'border-l-4 border-primary pl-4 italic text-gray-700 dark:text-gray-300 my-4',
  
  // Code
  code: 'bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 font-mono text-sm',
  codeHighlight: {
    atrule: 'text-purple-600',
    attr: 'text-blue-600',
    boolean: 'text-red-600',
    builtin: 'text-purple-600',
    cdata: 'text-gray-600',
    char: 'text-green-600',
    class: 'text-blue-600',
    'class-name': 'text-blue-600',
    comment: 'text-gray-500 italic',
    constant: 'text-red-600',
    deleted: 'text-red-600',
    doctype: 'text-gray-600',
    entity: 'text-orange-600',
    function: 'text-blue-600',
    important: 'text-red-600',
    inserted: 'text-green-600',
    keyword: 'text-purple-600',
    namespace: 'text-blue-600',
    number: 'text-red-600',
    operator: 'text-gray-700',
    prolog: 'text-gray-600',
    property: 'text-blue-600',
    punctuation: 'text-gray-700',
    regex: 'text-green-600',
    selector: 'text-green-600',
    string: 'text-green-600',
    symbol: 'text-red-600',
    tag: 'text-red-600',
    url: 'text-blue-600',
    variable: 'text-orange-600',
  },
  
  // Links
  link: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer transition-colors',
  
  // Text formatting
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
    code: 'bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 font-mono text-sm',
  },
  
  // Tables
  table: 'border-collapse border border-gray-300 dark:border-gray-600 w-full my-4',
  tableCell: 'border border-gray-300 dark:border-gray-600 px-3 py-2',
  tableCellHeader: 'border border-gray-300 dark:border-gray-600 px-3 py-2 font-semibold bg-gray-50 dark:bg-gray-800',
  
  // Hashtag
  hashtag: 'text-primary font-medium',
  
  // Horizontal Rule
  hr: 'my-4 border-0 h-px bg-gray-300 dark:bg-gray-600',
  
  // Element alignment classes
  elementFormat: {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right',
    justify: 'text-justify',
  },
};

interface RichTextEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
}

export function RichTextEditor({
  initialValue,
  onChange,
  placeholder = 'Digite seu conteúdo...',
  className,
  autoFocus = false,
  readOnly = false,
}: RichTextEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Handle editor state changes
  const handleEditorChange = (editorState: EditorState, editor: LexicalEditor) => {
    if (onChange) {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor);
        onChange(htmlString);
      });
    }
  };

  const editorConfig = {
    namespace: 'RichTextEditor',
    theme,
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error);
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
      HashtagNode,
      HorizontalRuleNode,
      ImageNode,
      VideoNode,
    ],
    editable: !readOnly,
  };

  return (
    <div className={cn('border border-gray-200 dark:border-gray-700 rounded-lg', className)}>
      <LexicalComposer initialConfig={editorConfig}>
        {!readOnly && <ToolbarPlugin />}
        
        <div className="relative max-h-[800px] overflow-y-auto">
          {!isPreviewMode ? (
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="min-h-[500px] p-4 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none">
                      {placeholder}
                    </div>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          ) : (
            <PreviewContent isPreviewMode={isPreviewMode} />
          )}
          
          <HistoryPlugin />
          {autoFocus && <AutoFocusPlugin />}
          <LinkPlugin />
          <ClickableLinkPlugin />
          <AutoLinkPlugin matchers={MATCHERS} />
          <ListPlugin />
          <HorizontalRulePlugin />
          <ImagePlugin />
          <VideoPlugin />
          <FilePlugin />
          <MarkdownShortcutPlugin transformers={customTransformers} />
          <OnChangePlugin onChange={handleEditorChange} />
          <InitialContentPlugin html={initialValue} />
        </div>
        
        {!readOnly && <FileOperationsBar isPreviewMode={isPreviewMode} onTogglePreview={togglePreviewMode} />}
      </LexicalComposer>
    </div>
  );
}
