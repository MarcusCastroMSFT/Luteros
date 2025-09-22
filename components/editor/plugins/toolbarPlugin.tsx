'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND, $createParagraphNode, LexicalNode } from 'lexical';
import { $isHeadingNode, $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $createQuoteNode, $isQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  Quote, 
  List, 
  ListOrdered, 
  Heading1,
  Heading2, 
  Heading3,
  Image,
  Video,
  Link,
  Minus,
  Type,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { INSERT_IMAGE_COMMAND } from './imagePlugin';
import { INSERT_VIDEO_COMMAND } from './videoPlugin';

const LowPriority = 1;

interface ToolbarState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isCode: boolean;
  blockType: string;
}

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
    blockType: 'paragraph',
  });

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      setToolbarState({
        isBold: selection.hasFormat('bold'),
        isItalic: selection.hasFormat('italic'),
        isUnderline: selection.hasFormat('underline'),
        isStrikethrough: selection.hasFormat('strikethrough'),
        isCode: selection.hasFormat('code'),
        blockType: getBlockType(element),
      });
    }
  }, []); // editor is stable and doesn't need to be in dependencies

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => $createHeadingNode(headingSize));
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => $createQuoteNode());
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => $createParagraphNode());
    });
  };

  const insertLink = () => {
    const url = prompt('Digite a URL do link:');
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  };

  const insertImage = () => {
    const src = prompt('Digite a URL da imagem:');
    if (src) {
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src });
    }
  };

  const insertVideo = () => {
    const src = prompt('Digite a URL do vídeo (YouTube, Vimeo, etc.):');
    if (src) {
      editor.dispatchCommand(INSERT_VIDEO_COMMAND, { src });
    }
  };

  const insertHorizontalRule = () => {
    // TODO: Implement horizontal rule insertion
    console.log('Insert horizontal rule');
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className={cn(
        'h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800',
        isActive && 'bg-gray-100 dark:bg-gray-800 text-primary'
      )}
    >
      {children}
    </Button>
  );

  const BlockTypeDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
          {getBlockTypeLabel(toolbarState.blockType)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => formatParagraph()}>
          <Type className="mr-2 h-4 w-4" />
          Parágrafo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => formatHeading('h1')}>
          <Heading1 className="mr-2 h-4 w-4" />
          Título 1
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => formatHeading('h2')}>
          <Heading2 className="mr-2 h-4 w-4" />
          Título 2
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => formatHeading('h3')}>
          <Heading3 className="mr-2 h-4 w-4" />
          Título 3
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => formatQuote()}>
          <Quote className="mr-2 h-4 w-4" />
          Citação
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div 
      className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
      ref={toolbarRef}
    >
      {/* Block Type */}
      <BlockTypeDropdown />
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        isActive={toolbarState.isBold}
        title="Negrito"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        isActive={toolbarState.isItalic}
        title="Itálico"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        isActive={toolbarState.isUnderline}
        title="Sublinhado"
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        isActive={toolbarState.isStrikethrough}
        title="Riscado"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        isActive={toolbarState.isCode}
        title="Código"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
        title="Lista com marcadores"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
        title="Lista numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* Media & Elements */}
      <ToolbarButton
        onClick={insertLink}
        title="Inserir link"
      >
        <Link className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={insertImage}
        title="Inserir imagem"
      >
        <Image className="h-4 w-4" aria-label="Insert image" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={insertVideo}
        title="Inserir vídeo"
      >
        <Video className="h-4 w-4" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={insertHorizontalRule}
        title="Linha horizontal"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

function getBlockType(element: LexicalNode): string {
  if ($isHeadingNode(element)) {
    return element.getTag();
  }
  if ($isQuoteNode(element)) {
    return 'quote';
  }
  if ($isListNode(element)) {
    return element.getListType();
  }
  return 'paragraph';
}

function getBlockTypeLabel(blockType: string): string {
  switch (blockType) {
    case 'h1':
      return 'Título 1';
    case 'h2':
      return 'Título 2';
    case 'h3':
      return 'Título 3';
    case 'h4':
      return 'Título 4';
    case 'h5':
      return 'Título 5';
    case 'h6':
      return 'Título 6';
    case 'quote':
      return 'Citação';
    case 'bullet':
      return 'Lista';
    case 'number':
      return 'Lista Numerada';
    default:
      return 'Parágrafo';
  }
}

// Import missing command
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
