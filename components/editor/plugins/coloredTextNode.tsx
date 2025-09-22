import { $applyNodeReplacement, TextNode, LexicalNode, SerializedTextNode, EditorConfig } from 'lexical';

interface SerializedColoredTextNode extends SerializedTextNode {
  color: string;
}

export class ColoredTextNode extends TextNode {
  __color: string;

  constructor(text: string, color?: string, key?: string) {
    super(text, key);
    this.__color = color || '#000000';
  }

  static getType(): string {
    return 'colored-text';
  }

  static clone(node: ColoredTextNode): ColoredTextNode {
    return new ColoredTextNode(node.__text, node.__color, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    if (this.__color !== '#000000') {
      element.style.color = this.__color;
    }
    return element;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config);
    if ((prevNode as ColoredTextNode).__color !== this.__color) {
      if (this.__color !== '#000000') {
        dom.style.color = this.__color;
      } else {
        dom.style.removeProperty('color');
      }
    }
    return isUpdated;
  }

  setColor(color: string): ColoredTextNode {
    const writable = this.getWritable();
    writable.__color = color;
    return writable;
  }

  getColor(): string {
    return this.__color;
  }

  static importJSON(serializedNode: SerializedColoredTextNode): ColoredTextNode {
    const { text, color } = serializedNode;
    const node = $createColoredTextNode(text, color);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedColoredTextNode {
    return {
      ...super.exportJSON(),
      color: this.__color,
      type: 'colored-text',
    };
  }
}

export function $createColoredTextNode(text: string, color?: string): ColoredTextNode {
  return $applyNodeReplacement(new ColoredTextNode(text, color));
}

export function $isColoredTextNode(node: LexicalNode | null | undefined): node is ColoredTextNode {
  return node instanceof ColoredTextNode;
}
