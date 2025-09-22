'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $handleListInsertParagraph } from '@lexical/list';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  INSERT_PARAGRAPH_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import { useEffect } from 'react';

interface ListMaxIndentLevelPluginProps {
  maxDepth: number;
}

export function ListMaxIndentLevelPlugin({ maxDepth }: ListMaxIndentLevelPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeListener = editor.registerCommand(
      INDENT_CONTENT_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // TODO: Implement proper indent logic with maxDepth check
          return false;
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    return removeListener;
  }, [editor, maxDepth]);

  useEffect(() => {
    const removeListener = editor.registerCommand(
      OUTDENT_CONTENT_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // TODO: Implement proper outdent logic
          return false;
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    return removeListener;
  }, [editor]);

  useEffect(() => {
    const removeListener = editor.registerCommand(
      INSERT_PARAGRAPH_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          return $handleListInsertParagraph();
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );

    return removeListener;
  }, [editor]);

  return null;
}
