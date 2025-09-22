'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getSelection, 
  $isRangeSelection, 
  COMMAND_PRIORITY_CRITICAL, 
  KEY_TAB_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import { useEffect } from 'react';

export function TabIndentationPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeListener = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event: KeyboardEvent) => {
        const selection = $getSelection();
        
        if (!$isRangeSelection(selection)) {
          return false;
        }

        event.preventDefault();

        if (event.shiftKey) {
          return editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        } else {
          return editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    return removeListener;
  }, [editor]);

  return null;
}
