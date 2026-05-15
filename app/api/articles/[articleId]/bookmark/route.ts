import { NextRequest, NextResponse, connection } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getAuthUser, requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { blogArticles, blogBookmarks } from '@/lib/db/schema';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  await connection();

  try {
    const { articleId } = await params;

    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const article = await db
      .select({ id: blogArticles.id })
      .from(blogArticles)
      .where(eq(blogArticles.id, articleId))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (!article) {
      return NextResponse.json({ success: false, error: 'Artigo não encontrado' }, { status: 404 });
    }

    const existing = await db
      .select()
      .from(blogBookmarks)
      .where(and(eq(blogBookmarks.articleId, articleId), eq(blogBookmarks.userId, authUser.id)))
      .limit(1)
      .then((r) => r[0] ?? null);

    if (existing) {
      await db.delete(blogBookmarks).where(eq(blogBookmarks.id, existing.id));
      return NextResponse.json({ success: true, data: { isBookmarked: false, message: 'Artigo removido dos salvos' } });
    } else {
      await db.insert(blogBookmarks).values({ articleId, userId: authUser.id });
      return NextResponse.json({ success: true, data: { isBookmarked: true, message: 'Artigo salvo com sucesso' } });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar artigo' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  await connection();

  try {
    const { articleId } = await params;

    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: true, data: { isBookmarked: false } });
    }

    const bookmark = await db
      .select()
      .from(blogBookmarks)
      .where(and(eq(blogBookmarks.articleId, articleId), eq(blogBookmarks.userId, authUser.id)))
      .limit(1)
      .then((r) => r[0] ?? null);

    return NextResponse.json({ success: true, data: { isBookmarked: !!bookmark } });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return NextResponse.json({ success: false, error: 'Erro ao verificar artigo salvo' }, { status: 500 });
  }
}
