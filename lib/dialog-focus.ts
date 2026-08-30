interface FocusedElement {
  tagName?: string;
}

export function shouldRestoreDialogFocus(element: FocusedElement | null): boolean {
  return element?.tagName?.toUpperCase() === 'IFRAME';
}