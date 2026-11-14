import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { ImageNode } from './imagePlugin.tsx';

const { $isElementNode, createEditor } = createRequire(import.meta.url)('lexical');
const originalImage = Object.getOwnPropertyDescriptor(globalThis, 'HTMLImageElement');
const originalNode = Object.getOwnPropertyDescriptor(globalThis, 'Node');

class TestImageElement {
  tagName = 'IMG';
  nodeType = 1;
  textContent = '';
  src = 'https://example.test/figura.svg';
  alt = 'Figura';
  width = 720;
  height = 582;
}

Object.defineProperty(globalThis, 'HTMLImageElement', { configurable: true, value: TestImageElement });
Object.defineProperty(globalThis, 'Node', { configurable: true, value: { ELEMENT_NODE: 1 } });

test.after(() => {
  if (originalImage) Object.defineProperty(globalThis, 'HTMLImageElement', originalImage);
  else delete globalThis.HTMLImageElement;
  if (originalNode) Object.defineProperty(globalThis, 'Node', originalNode);
  else delete globalThis.Node;
});

function makeFigure({ alignment = 'center', caption = 'Legenda da figura.', children, extraText = '' } = {}) {
  const image = new TestImageElement();
  const captionElement = { tagName: 'FIGCAPTION', nodeType: 1, textContent: caption, children: [] };
  const figureChildren = children ?? (caption === null ? [image] : [image, captionElement]);
  return {
    children: figureChildren,
    childNodes: [{ nodeType: 3, textContent: extraText }, ...figureChildren],
    getAttribute: (name) => name === 'data-align' ? alignment : null,
    style: { textAlign: '' },
  };
}

function convertFigure(figure, inspect) {
  const conversion = ImageNode.importDOM().figure(figure);
  assert.ok(conversion);
  const editor = createEditor({ nodes: [ImageNode], onError: (error) => { throw error; } });
  editor.update(() => {
    const output = conversion.conversion(figure);
    inspect(output.node);
    assert.equal(output.forChild(output.node, null), null);
  }, { discrete: true });
}

test('imports a captioned figure with its dimensions and alignment', () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement: () => ({
        style: { setProperty(name, value) { this[name] = value; } },
        setAttribute() {},
        appendChild() {},
      }),
    },
  });

  try {
    convertFigure(makeFigure(), (paragraph) => {
      assert.ok($isElementNode(paragraph));
      assert.equal(paragraph.getFormatType(), 'center');
      const [image] = paragraph.getChildren();
      assert.ok(image instanceof ImageNode);
      assert.equal(image.getCaption(), 'Legenda da figura.');
      assert.equal(image.getSrc(), 'https://example.test/figura.svg');
      assert.equal(image.getAlt(), 'Figura');
      assert.equal(image.getWidth(), 720);
      assert.equal(image.getHeight(), 582);
      image.setCaption('Legenda atualizada.');
      assert.equal(image.getCaption(), 'Legenda atualizada.');
      assert.equal(image.exportDOM().element.style.textAlign, 'center');
      paragraph.setFormat('right');
      assert.equal(image.exportDOM().element.style.textAlign, 'right');
    });
  } finally {
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
    else delete globalThis.document;
  }
});

test('keeps uncaptioned figures and their alignment', () => {
  for (const [alignment, expected] of [['start', 'left'], ['end', 'right']]) {
    convertFigure(makeFigure({ alignment, caption: null }), (paragraph) => {
      assert.ok($isElementNode(paragraph));
      assert.equal(paragraph.getFormatType(), expected);
      const [image] = paragraph.getChildren();
      assert.ok(image instanceof ImageNode);
      assert.equal(image.getCaption(), undefined);
    });
  }
});

test('restores alignment from figure styles after reopening an edited article', () => {
  const figure = makeFigure({ alignment: null });
  figure.style.textAlign = 'right';
  convertFigure(figure, (paragraph) => {
    assert.ok($isElementNode(paragraph));
    assert.equal(paragraph.getFormatType(), 'right');
    assert.equal(paragraph.getChildren()[0].getCaption(), 'Legenda da figura.');
  });
});

test('imports captions even when no alignment is specified', () => {
  convertFigure(makeFigure({ alignment: null }), (image) => {
    assert.ok(image instanceof ImageNode);
    assert.equal(image.getCaption(), 'Legenda da figura.');
  });
});

test('leaves complex figures to the existing child converters', () => {
  const image = new TestImageElement();
  const richCaption = { tagName: 'FIGCAPTION', nodeType: 1, textContent: 'Legenda', children: [{}] };
  for (const figure of [
    makeFigure({ children: [image, new TestImageElement()] }),
    makeFigure({ children: [image, richCaption] }),
    makeFigure({ children: [image, { tagName: 'P', nodeType: 1, textContent: 'Outro conteúdo' }] }),
    makeFigure({ extraText: 'Texto adicional' }),
  ]) {
    assert.equal(ImageNode.importDOM().figure(figure), null);
  }
});

test('keeps the existing standalone image import', () => {
  const image = new TestImageElement();
  const conversion = ImageNode.importDOM().img();
  const editor = createEditor({ nodes: [ImageNode], onError: (error) => { throw error; } });
  editor.update(() => {
    const output = conversion.conversion(image);
    assert.ok(output.node instanceof ImageNode);
    assert.equal(output.node.getSrc(), image.src);
    assert.equal(output.node.getCaption(), undefined);
  }, { discrete: true });
});
