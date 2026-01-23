import { NextRequest, NextResponse, connection } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Toggle bookmark for an article
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  await connection();

  try {
    const { articleId } = await params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Você precisa estar logado para salvar artigos' },
        { status: 401 }
      );
    }

    // Check if article exists
    const article = await prisma.blog_articles.findUnique({
      where: { id: articleId },
      select: { id: true, title: true },
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.blog_bookmarks.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId: user.id,
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.blog_bookmarks.delete({
        where: { id: existingBookmark.id },
      });

      return NextResponse.json({
        success: true,
        data: {
          isBookmarked: false,
          message: 'Artigo removido dos salvos',
        },
      });
    } else {
      // Add bookmark
      await prisma.blog_bookmarks.create({
        data: {
          articleId,
          userId: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          isBookmarked: true,
          message: 'Artigo salvo com sucesso',
        },
      });
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar artigo' },
      { status: 500 }
    );
  }
}

// Check if article is bookmarked
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  await connection();

  try {
    const { articleId } = await params;

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: true,
        data: { isBookmarked: false },
      });
    }

    // Check if bookmarked
    const bookmark = await prisma.blog_bookmarks.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { isBookmarked: !!bookmark },
    });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao verificar artigo salvo' },
      { status: 500 }
    );
  }
}
