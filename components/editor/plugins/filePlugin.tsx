'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';
import { useCallback } from 'react';

// Simple markdown conversion functions
function htmlToMarkdown(html: string): string {
  // Basic HTML to Markdown conversion
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n')
    .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple newlines
    .trim();
}

function markdownToHtml(markdown: string): string {
  // Basic Markdown to HTML conversion
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^\s*$/gim, '<br>')
    .replace(/\n/gim, '<br>');
}

export function useFileOperations() {
  const [editor] = useLexicalComposerContext();

  const exportAsMarkdown = useCallback(() => {
    editor.getEditorState().read(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      const markdown = htmlToMarkdown(htmlString);
      
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }, [editor]);

  const exportAsHtml = useCallback(() => {
    editor.getEditorState().read(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Document</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3, h4, h5, h6 { margin-top: 0; }
    blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; }
    code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  ${htmlString}
</body>
</html>`;
      
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }, [editor]);

  const exportAsText = useCallback(() => {
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }, [editor]);

  const importFromFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,.html';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (!content) return;
        
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          
          let htmlContent = content;
          
          // Convert based on file type
          if (file.name.endsWith('.md')) {
            htmlContent = markdownToHtml(content);
          } else if (file.name.endsWith('.txt')) {
            htmlContent = content.replace(/\n/g, '<br>');
          }
          
          // Parse HTML and insert into editor
          const parser = new DOMParser();
          const dom = parser.parseFromString(htmlContent, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          $insertNodes(nodes);
        });
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }, [editor]);

  return {
    exportAsMarkdown,
    exportAsHtml,
    exportAsText,
    importFromFile,
  };
}

// Plugin component (doesn't render anything, just provides the hook)
export function FilePlugin() {
  return null;
}
