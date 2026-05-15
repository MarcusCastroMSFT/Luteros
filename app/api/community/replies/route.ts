import { NextRequest, NextResponse, connection } from 'next/server';
import { count, desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { communityPosts, communityReplies } from '@/lib/db/schema';

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
  await connection();

  try {
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: communityReplies.id,
          content: communityReplies.content,
          createdAt: communityReplies.createdAt,
          updatedAt: communityReplies.updatedAt,
          likeCount: communityReplies.likeCount,
          postId: communityPosts.id,
          postTitle: communityPosts.title,
          postCategory: communityPosts.category,
          postSubcategory: communityPosts.subcategory,
        })
        .from(communityReplies)
        .innerJoin(communityPosts, eq(communityReplies.postId, communityPosts.id))
        .where(eq(communityReplies.userId, authUser.id))
        .orderBy(desc(communityReplies.createdAt))
        .limit(limit)
        .offset(page * limit),
      db.select({ total: count() }).from(communityReplies).where(eq(communityReplies.userId, authUser.id)),
    ]);

    const formattedReplies: UserReply[] = rows.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      likesCount: r.likeCount,
      post: { id: r.postId, title: r.postTitle, category: r.postCategory, subcategory: r.postSubcategory },
    }));

    return NextResponse.json({
      success: true,
      data: formattedReplies,
      pagination: { page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) },
    });
  } catch (error) {
    console.error('Get user replies error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar respostas' }, { status: 500 });
  }
}
