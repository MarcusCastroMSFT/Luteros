import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const lessonRoutePaths = [
  '../app/api/courses/[courseId]/lessons/[lessonId]/route.ts',
];

test('lesson mutation routes do not use transactions unsupported by neon-http', async () => {
  const dbSource = await readFile(new URL('./db/index.ts', import.meta.url), 'utf8');
  assert.match(dbSource, /drizzle-orm\/neon-http/);

  for (const routePath of lessonRoutePaths) {
    const routeSource = await readFile(new URL(routePath, import.meta.url), 'utf8');
    assert.doesNotMatch(routeSource, /\bdb\.transaction\s*\(/, routePath);
  }
});