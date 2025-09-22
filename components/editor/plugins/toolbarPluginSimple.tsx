'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection, 
  FORMAT_TEXT_COMMAND, 
  SELECTION_CHANGE_COMMAND,
  $createParagraphNode,
  $createTextNode,
  FORMAT_ELEMENT_COMMAND,
  ElementFormatType,
  $isTextNode,
  LexicalNode
} from 'lexical';
import { $isHeadingNode, $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $createQuoteNode, $isQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import { TOGGLE_LINK_COMMAND, $createLinkNode } from '@lexical/link';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { INSERT_IMAGE_COMMAND } from './imagePlugin';
import { INSERT_VIDEO_COMMAND } from './videoPlugin';
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
  Link,
  Type,
  Image,
  Video,
  Minus,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { VideoDialog } from './videoDialog';
import { ImageDialog } from './imageDialog';
import { LinkDialog } from './linkDialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const LowPriority = 1;

interface ToolbarState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  isCode: boolean;
  blockType: string;
  elementFormat: ElementFormatType;
  textColor: string;
}

// Predefined color palette
const TEXT_COLORS = [
  { name: 'Negro', value: '#000000' },
  { name: 'Gris oscuro', value: '#374151' },
  { name: 'Gris', value: '#6B7280' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Naranja', value: '#e27447' },
  { name: 'Amarillo', value: '#EAB308' },
  { name: 'Verde', value: '#22C55E' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Púrpura', value: '#A855F7' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Blanco', value: '#FFFFFF' },
];

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [customHexColor, setCustomHexColor] = useState('');
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [toolbarState, setToolbarState] = useState<ToolbarState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrikethrough: false,
    isCode: false,
    blockType: 'paragraph',
    elementFormat: '',
    textColor: '#000000',
  });

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      // Get text color from selection or current node
      let textColor = '#000000';
      
      // First, try to get color from selection style (for future typing)
      if (selection.style) {
        const colorMatch = selection.style.match(/color:\s*([^;]+)/);
        if (colorMatch) {
          textColor = colorMatch[1].trim();
        }
      }
      
      // If no color from selection and we have selected text, get from first text node
      if (textColor === '#000000' && !selection.isCollapsed()) {
        const nodes = selection.getNodes();
        for (const node of nodes) {
          if ($isTextNode(node)) {
            const nodeStyle = node.getStyle();
            if (nodeStyle) {
              const colorMatch = nodeStyle.match(/color:\s*([^;]+)/);
              if (colorMatch) {
                textColor = colorMatch[1].trim();
                break;
              }
            }
          }
        }
      }
      
      // If still no color and cursor is positioned, try to get from anchor node
      if (textColor === '#000000' && $isTextNode(anchorNode)) {
        const nodeStyle = anchorNode.getStyle();
        if (nodeStyle) {
          const colorMatch = nodeStyle.match(/color:\s*([^;]+)/);
          if (colorMatch) {
            textColor = colorMatch[1].trim();
          }
        }
      }

      setToolbarState({
        isBold: selection.hasFormat('bold'),
        isItalic: selection.hasFormat('italic'),
        isUnderline: selection.hasFormat('underline'),
        isStrikethrough: selection.hasFormat('strikethrough'),
        isCode: selection.hasFormat('code'),
        blockType: getBlockType(element),
        elementFormat: '',
        textColor,
      });
    }
  }, []);

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

  const formatAlignment = (alignment: ElementFormatType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
      }
    });
  };

  const formatTextColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Apply color to selected text if any
        if (!selection.isCollapsed()) {
          const nodes = selection.getNodes();
          
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if ($isTextNode(node)) {
              // Remove existing color style and add new one
              let currentStyle = node.getStyle() || '';
              currentStyle = currentStyle.replace(/color:\s*[^;]*(;|$)/g, '');
              if (currentStyle && !currentStyle.endsWith(';')) {
                currentStyle += ';';
              }
              currentStyle += `color: ${color};`;
              node.setStyle(currentStyle);
            }
          }
        }
        
        // Always set the selection style for future typing
        let currentSelectionStyle = selection.style || '';
        currentSelectionStyle = currentSelectionStyle.replace(/color:\s*[^;]*(;|$)/g, '');
        if (currentSelectionStyle && !currentSelectionStyle.endsWith(';')) {
          currentSelectionStyle += ';';
        }
        currentSelectionStyle += `color: ${color};`;
        selection.setStyle(currentSelectionStyle);
      }
    });
    
    // Close the color picker dropdown
    setIsColorPickerOpen(false);
    
    // Update toolbar state immediately
    setToolbarState(prev => ({ ...prev, textColor: color }));
  };

  const handleCustomHexColor = (hex: string) => {
    // Validate hex color format
    const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    if (hexRegex.test(hex)) {
      // Ensure hex starts with #
      const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`;
      formatTextColor(normalizedHex);
      setCustomHexColor('');
    }
  };

  const handleHexInputChange = (value: string) => {
    setCustomHexColor(value);
  };

  const handleHexInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomHexColor(customHexColor);
    }
  };

  const insertLink = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const text = selection.getTextContent();
        setSelectedText(text);
      }
    });
    setIsLinkDialogOpen(true);
  };

  const handleLinkConfirm = (url: string, text?: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (selection.isCollapsed()) {
          // No text selected, insert new link with text
          const linkText = text || url;
          const textNode = $createTextNode(linkText);
          const linkNode = $createLinkNode(url);
          linkNode.append(textNode);
          selection.insertNodes([linkNode]);
        } else {
          // Text is selected, convert to link
          if (text && text !== selection.getTextContent()) {
            // User changed the text, replace it
            selection.insertText(text);
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
          } else {
            // Keep existing text, just add link
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
          }
        }
      }
    });
  };

  const insertImage = () => {
    setIsImageDialogOpen(true);
  };

  const handleImageConfirm = (url: string, altText?: string) => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: url,
      alt: altText || 'Imagem inserida',
    });
  };

  const insertVideo = () => {
    setIsVideoDialogOpen(true);
  };

  const handleVideoConfirm = (url: string) => {
    editor.dispatchCommand(INSERT_VIDEO_COMMAND, {
      src: url,
    });
  };

  const insertHorizontalRule = () => {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
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
        'h-8 w-8 p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800',
        isActive && 'bg-gray-100 dark:bg-gray-800 text-primary'
      )}
    >
      {children}
    </Button>
  );

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {/* Main toolbar */}
      <div 
        className="sticky top-0 z-10 flex items-center gap-1 p-2"
        ref={toolbarRef}
      >
        {/* Block Type - Simple paragraph option */}
        <ToolbarButton
          onClick={() => formatParagraph()}
          isActive={toolbarState.blockType === 'paragraph'}
          title="Parágrafo"
        >
          <Type className="h-4 w-4" />
        </ToolbarButton>
        
        {/* Headings */}
        <ToolbarButton
          onClick={() => formatHeading('h1')}
          isActive={toolbarState.blockType === 'h1'}
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => formatHeading('h2')}
          isActive={toolbarState.blockType === 'h2'}
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => formatHeading('h3')}
          isActive={toolbarState.blockType === 'h3'}
          title="Título 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        
        {/* Quote */}
        <ToolbarButton
          onClick={() => formatQuote()}
          isActive={toolbarState.blockType === 'quote'}
          title="Citação"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        
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

        {/* Text Color */}
        <DropdownMenu open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 relative"
              title="Cor do texto"
            >
              <Palette className="h-4 w-4" />
              <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-1 rounded-t"
                style={{ backgroundColor: toolbarState.textColor }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-2">
              <div className="grid grid-cols-6 gap-2 mb-3">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => formatTextColor(color.value)}
                    className={cn(
                      "w-8 h-8 rounded border-2 hover:scale-110 transition-transform cursor-pointer",
                      toolbarState.textColor === color.value 
                        ? "border-gray-600 dark:border-gray-300" 
                        : "border-gray-300 dark:border-gray-600"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              
              {/* Custom Hex Color Input */}
              <div className="mb-3 border-t pt-3">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
                  Cor personalizada (hex):
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="#ffffff"
                    value={customHexColor}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    onKeyDown={handleHexInputKeyDown}
                    className="text-xs h-8 flex-1"
                    maxLength={7}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCustomHexColor(customHexColor)}
                    className="h-8 px-3 text-xs cursor-pointer"
                    disabled={!customHexColor.trim()}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Selecione o texto e escolha uma cor
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        {/* Text Alignment */}
        <ToolbarButton
          onClick={() => formatAlignment('left')}
          isActive={toolbarState.elementFormat === 'left'}
          title="Alinhar à esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => formatAlignment('center')}
          isActive={toolbarState.elementFormat === 'center'}
          title="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => formatAlignment('right')}
          isActive={toolbarState.elementFormat === 'right'}
          title="Alinhar à direita"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => formatAlignment('justify')}
          isActive={toolbarState.elementFormat === 'justify'}
          title="Justificar"
        >
          <AlignJustify className="h-4 w-4" />
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
        
        {/* Other Elements */}
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
          title="Inserir linha horizontal"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>
      
      {/* Dialogs */}
      <LinkDialog 
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        onConfirm={handleLinkConfirm}
        selectedText={selectedText}
      />
      
      <ImageDialog 
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        onConfirm={handleImageConfirm}
      />
      
      <VideoDialog 
        open={isVideoDialogOpen}
        onOpenChange={setIsVideoDialogOpen}
        onConfirm={handleVideoConfirm}
      />
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
