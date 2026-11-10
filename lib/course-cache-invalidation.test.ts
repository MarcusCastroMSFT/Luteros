import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { ModuleKind, transpileModule } from 'typescript';

test('cache invalidation explicitly expires tags rather than using stale-while-revalidate', async () => {
  const source = await readFile(new URL('./cache.ts', import.meta.url), 'utf8');
  const calls: unknown[][] = [];
  const exports: { revalidateTag?: (tag: string) => void } = {};
  runInNewContext(transpileModule(source, {
    compilerOptions: { module: ModuleKind.CommonJS },
  }).outputText, {
    exports,
    require: (id: string) => {
      assert.equal(id, 'next/cache');
      return { revalidateTag: (...args: unknown[]) => { calls.push(args); } };
    },
  });
  exports.revalidateTag!('course-example');
  assert.equal(JSON.stringify(calls), JSON.stringify([['course-example', { expire: 0 }]]));
});

test('all lesson mutation routes invalidate public course data after persistence', async () => {
  for (const path of [
    '../app/api/courses/[courseId]/lessons/route.ts',
    '../app/api/courses/[courseId]/lessons/[lessonId]/route.ts',
    '../app/api/courses/[courseId]/lessons/reorder/route.ts',
  ]) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    const handlers = source.split(/export async function /).slice(1);
    for (const handler of handlers.filter(handler => /^(POST|PUT|DELETE)\(/.test(handler))) {
      assert.match(handler, /revalidateTag\(`course-\$\{course(?:\?\.|\.)slug\}`\)/, path);
      assert.match(handler, /revalidateTag\('courses'\)/, path);
      assert.match(handler, /revalidateTag\('courses-initial'\)/, path);
      assert.ok(handler.indexOf('revalidateTag(') < handler.lastIndexOf('success: true'), path);
    }
  }
});

test('course APIs do not retain an independent stale CDN response', async () => {
  for (const path of [
    '../app/api/courses-public/route.ts',
    '../app/api/courses-public/[slug]/route.ts',
  ]) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.match(source, /'Cache-Control',\s*'no-store'/, path);
    assert.doesNotMatch(source, /s-maxage|stale-while-revalidate/, path);
  }
});
