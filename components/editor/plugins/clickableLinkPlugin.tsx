'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LinkNode } from '@lexical/link';
import { mergeRegister } from '@lexical/utils';
import { useEffect } from 'react';

export function ClickableLinkPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'A') {
        // Only handle link clicks if Ctrl/Cmd is held or if it's a right click
        if (event.ctrlKey || event.metaKey || event.button === 2) {
          event.preventDefault();
          const href = target.getAttribute('href');
          if (href) {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
          return;
        }
        
        // Prevent default link behavior during editing
        event.preventDefault();
      }
    };

    const onMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        target.style.cursor = 'pointer';
        target.setAttribute('title', 'Ctrl+Click to open in new tab');
      }
    };

    const onMouseLeave = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        target.removeAttribute('title');
      }
    };

    return mergeRegister(
      editor.registerRootListener((rootElement, prevRootElement) => {
        if (prevRootElement !== null) {
          prevRootElement.removeEventListener('click', onClick);
          prevRootElement.removeEventListener('mouseenter', onMouseEnter, true);
          prevRootElement.removeEventListener('mouseleave', onMouseLeave, true);
        }
        if (rootElement !== null) {
          rootElement.addEventListener('click', onClick);
          rootElement.addEventListener('mouseenter', onMouseEnter, true);
          rootElement.addEventListener('mouseleave', onMouseLeave, true);
        }
      })
    );
  }, [editor]);

  // Also register a mutation listener to add proper attributes to link nodes
  useEffect(() => {
    return editor.registerMutationListener(LinkNode, (mutatedNodes) => {
      editor.getEditorState().read(() => {
        for (const [key, mutation] of mutatedNodes) {
          if (mutation === 'created' || mutation === 'updated') {
            editor.update(() => {
              const domElement = editor.getElementByKey(key);
              if (domElement && domElement.tagName === 'A') {
                // Ensure links have proper attributes for new tab opening
                domElement.setAttribute('target', '_blank');
                domElement.setAttribute('rel', 'noopener noreferrer');
                domElement.style.cursor = 'pointer';
              }
            });
          }
        }
      });
    });
  }, [editor]);

  // Also add a general DOM mutation observer to catch any links that might be missed
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const links = element.tagName === 'A' ? [element] : element.querySelectorAll('a');
            links.forEach((link) => {
              if (!link.getAttribute('target')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
              }
            });
          }
        });
      });
    });

    const rootElement = editor.getRootElement();
    if (rootElement) {
      observer.observe(rootElement, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [editor]);

  return null;
}
