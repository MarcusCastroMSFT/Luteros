import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { encode } from 'next-auth/jwt';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema';

const baseUrl = process.env.LESSON_TEST_BASE_URL;
const databaseUrl = process.env.LESSON_TEST_DATABASE_URL;

test('upcoming lessons are visible but their content, media and progress remain unavailable', {
  skip: !baseUrl || !databaseUrl,
}, async () => {
  assert.ok(baseUrl?.startsWith('http://localhost:'), 'Integration server must be local');
  assert.ok(databaseUrl);
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  assert.ok(secret, 'An auth secret is required for the local integration session');
  const database = drizzle(neon(databaseUrl), { schema });
  const userId = `lesson-visibility-test-${randomUUID()}`;
  const courseId = randomUUID();
  const slug = `lesson-visibility-test-${courseId}`;
  const cookie = async (role: string) => `authjs.session-token=${await encode({
    token: { sub: userId, id: userId, role, name: 'Teste', email: `${userId}@example.org` },
    secret, salt: 'authjs.session-token', maxAge: 600,
  })}`;
  const adminHeaders = { Cookie: await cookie('ADMIN'), 'Content-Type': 'application/json' };
  const readerHeaders = { Cookie: await cookie('USER') };
  const endpoint = `${baseUrl}/api/courses/${courseId}/lessons`;

  try {
    await database.insert(schema.users).values({ id: userId, name: 'Teste', email: `${userId}@example.org` });
    await database.insert(schema.courses).values({
      id: courseId, slug, title: 'Curso fictício', description: 'Teste de visibilidade',
      category: 'saude-sexual', level: 'Iniciante', instructorId: userId, isPublished: true,
    });
    await database.insert(schema.enrollments).values({ userId, courseId, paymentStatus: 'COMPLETED' });

    const create = (body: object) => fetch(endpoint, {
      method: 'POST', headers: adminHeaders, body: JSON.stringify(body),
    });
    const response = await create({
      title: 'Aula futura', type: 'article', description: 'PRIVATE_DESCRIPTION',
      content: '<p>PRIVATE_CONTENT</p>', references: '<p>PRIVATE_REFERENCES</p>',
      isComingSoon: true, isFree: true,
    });
    assert.equal(response.status, 201);
    const lesson = (await response.json()).data;
    assert.equal(lesson.isComingSoon, true);
    assert.equal(lesson.isPublished, false);

    const videoResponse = await create({
      title: 'Vídeo futuro', type: 'video', videoProvider: 'azure',
      videoUrl: 'courses/private.mp4', isComingSoon: true,
    });
    assert.equal(videoResponse.status, 201);
    const video = (await videoResponse.json()).data;
    const itemUrl = `${endpoint}/${lesson.id}`;
    const update = (body: object) => fetch(itemUrl, {
      method: 'PUT', headers: adminHeaders, body: JSON.stringify(body),
    });
    assert.equal((await update({ isPublished: true, isComingSoon: true })).status, 400);

    for (const path of [`/courses/${slug}`, `/api/courses-public/${slug}`, `/courses/${slug}/lessons`]) {
      const page = await fetch(`${baseUrl}${path}`, { headers: readerHeaders });
      assert.equal(page.status, 200);
      const text = await page.text();
      assert.match(text, /Aula futura/);
      assert.doesNotMatch(text, /PRIVATE_DESCRIPTION|PRIVATE_CONTENT|PRIVATE_REFERENCES|courses\/private\.mp4/);
    }
    const progressUrl = `${itemUrl}/progress`;
    const progress = (isCompleted: boolean) => fetch(progressUrl, {
      method: 'POST', headers: { ...readerHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted }),
    });
    assert.equal((await progress(true)).status, 404);
    assert.notEqual((await fetch(`${endpoint}/${video.id}/media`, { headers: readerHeaders, redirect: 'manual' })).status, 307);
    const initialProgress = await (await fetch(`${baseUrl}/api/courses/${courseId}/progress`, { headers: readerHeaders })).json();
    assert.equal(initialProgress.data.totalLessons, 0);

    assert.equal((await update({ isPublished: true })).status, 200);
    const classroom = await fetch(`${baseUrl}/courses/${slug}/lessons`, { headers: readerHeaders });
    assert.match(await classroom.text(), /PRIVATE_CONTENT/);
    assert.equal((await progress(true)).status, 200);
    const publishedProgress = await (await fetch(`${baseUrl}/api/courses/${courseId}/progress`, { headers: readerHeaders })).json();
    assert.equal(publishedProgress.data.totalLessons, 1);
    assert.equal(publishedProgress.data.progressPercent, 100);

    assert.equal((await update({ isComingSoon: true })).status, 200);
    assert.equal((await progress(true)).status, 404);
    const resetProgress = await (await fetch(`${baseUrl}/api/courses/${courseId}/progress`, { headers: readerHeaders })).json();
    assert.equal(resetProgress.data.totalLessons, 0);
    assert.equal(resetProgress.data.progressPercent, 0);
    assert.equal((await update({ isPublished: false })).status, 200);
    const publicData = await (await fetch(`${baseUrl}/api/courses-public/${slug}`)).json();
    assert.ok(!publicData.data.lessons.some((item: { id: string }) => item.id === lesson.id));
  } finally {
    await database.delete(schema.courses).where(eq(schema.courses.id, courseId));
    await database.delete(schema.users).where(eq(schema.users.id, userId));
  }
});
