import { NextRequest, NextResponse, connection } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export interface UserReply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  post: {
    id: string;
    title: string;
    category: string;
    subcategory: string | null;
  };
}

// GET - Get all replies by the current user
export async function GET(request: NextRequest) {
  try {
    await connection();

    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Não autorizado',
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = page * limit;

    // Fetch user's replies with post info
    const [replies, totalCount] = await Promise.all([
      prisma.community_replies.findMany({
        where: { userId: user.id },
        include: {
          community_posts: {
            select: {
              id: true,
              title: true,
              category: true,
              subcategory: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.community_replies.count({
        where: { userId: user.id },
      }),
    ]);

    const formattedReplies: UserReply[] = replies.map((reply: {
      id: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
      likesCount: number;
      community_posts: {
        id: string;
        title: string;
        category: string;
        subcategory: string | null;
      };
    }) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      likesCount: reply.likesCount,
      post: {
        id: reply.community_posts.id,
        title: reply.community_posts.title,
        category: reply.community_posts.category,
        subcategory: reply.community_posts.subcategory,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedReplies,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Get user replies error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar respostas' },
      { status: 500 }
    );
  }
}
