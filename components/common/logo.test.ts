import assert from 'node:assert/strict';
import test from 'node:test';
import type { ReactElement } from 'react';
import { Logo } from './logo';

test('bounds the clickable area to the cropped logo viewport', () => {
  const link = Logo({ iconSize: 'lg', asLink: true }) as ReactElement<{
    className: string;
    style?: { width?: number; height?: number };
  }>;

  assert.equal(link.props.className.includes('min-h-'), false);
  assert.deepEqual(link.props.style, { width: 160, height: 32 });
});
