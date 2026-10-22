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

test('lesson references persist through the API and remain behind paid classroom access', {
  skip: !baseUrl || !databaseUrl,
}, async () => {
  assert.ok(baseUrl!.startsWith('http://localhost:'), 'Integration server must be local');
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  assert.ok(secret, 'An auth secret is required for the local integration session');
  const database = drizzle(neon(databaseUrl!), { schema });
  const userId = `lesson-test-${randomUUID()}`;
  const courseId = randomUUID();
  const slug = `lesson-test-${courseId}`;
  const references = '<p>PRIVATE_REFERENCE_MARKER</p><a href="https://example.org" target="_blank">Fonte</a><script>REF_SCRIPT_MARKER</script>';
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
      id: courseId, slug, title: 'Curso fictício', description: 'Teste de referências',
      category: 'saude-sexual', level: 'Iniciante', instructorId: userId,
      price: '10.00', isPublished: true,
    });
    const post = (input: unknown) => fetch(endpoint, {
      method: 'POST', headers: adminHeaders, body: JSON.stringify(input),
    });
    assert.equal((await post({ title: 'Artigo', type: 'article', references: {} })).status, 400);
    const created = await post({
      title: 'Artigo', type: 'article', content: '<p>Conteúdo</p>',
      references, isPublished: true, isFree: false,
    });
    assert.equal(created.status, 201);
    const lesson = (await created.json()).data;
    assert.equal(lesson.references, references);
    const itemUrl = `${endpoint}/${lesson.id}`;
    const put = (input: unknown) => fetch(itemUrl, {
      method: 'PUT', headers: adminHeaders, body: JSON.stringify(input),
    });
    assert.equal((await fetch(endpoint)).status, 401);
    assert.equal((await fetch(endpoint, { headers: readerHeaders })).status, 403);
    const listed = await (await fetch(endpoint, { headers: adminHeaders })).json();
    assert.equal(listed.data[0].references, references);
    assert.equal((await (await fetch(itemUrl, { headers: adminHeaders })).json()).data.references, references);
    assert.equal((await put({ references: [] })).status, 400);
    assert.equal((await (await put({ title: 'Artigo atualizado' })).json()).data.references, references);

    for (const path of [`/courses/${slug}`, `/api/courses-public/${slug}`]) {
      const response = await fetch(`${baseUrl}${path}`);
      assert.equal(response.status, 200);
      assert.ok(!(await response.text()).includes('PRIVATE_REFERENCE_MARKER'), path);
    }
    const classroom = `${baseUrl}/courses/${slug}/lessons`;
    const blocked = async () => {
      const response = await fetch(classroom, { headers: readerHeaders, redirect: 'manual' });
      const html = await response.text();
      assert.ok([307, 308].includes(response.status) || /NEXT_REDIRECT|__next-page-redirect/.test(html));
      assert.ok(!html.includes('PRIVATE_REFERENCE_MARKER'));
    };
    await blocked();
    await database.insert(schema.enrollments).values({ userId, courseId, paymentStatus: 'PENDING' });
    await blocked();
    await database.update(schema.enrollments).set({ paymentStatus: 'COMPLETED' }).where(eq(schema.enrollments.courseId, courseId));
    const reader = await fetch(classroom, { headers: readerHeaders });
    assert.equal(reader.status, 200);
    const html = await reader.text();
    assert.ok(html.includes('PRIVATE_REFERENCE_MARKER'));
    assert.ok(!html.includes('REF_SCRIPT_MARKER'));
    await database.update(schema.enrollments).set({ paymentStatus: 'REFUNDED' }).where(eq(schema.enrollments.courseId, courseId));
    await blocked();

    for (const cleared of ['', null]) {
      assert.equal((await (await put({ references: cleared })).json()).data.references, null);
      await put({ references });
    }
    assert.equal((await (await put({ type: 'audio' })).json()).data.references, null);
    assert.equal((await (await put({ type: 'article' })).json()).data.references, null);
    const [stored] = await database.select({ references: schema.lessons.references })
      .from(schema.lessons).where(eq(schema.lessons.id, lesson.id));
    assert.equal(stored.references, null);
  } finally {
    await database.delete(schema.courses).where(eq(schema.courses.id, courseId));
    await database.delete(schema.users).where(eq(schema.users.id, userId));
  }
});
