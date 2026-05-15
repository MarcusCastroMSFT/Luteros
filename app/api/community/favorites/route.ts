import { NextRequest, NextResponse, connection } from 'next/server';
import { count, desc, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { communityLikes, communityPosts, communityReplies, communityReplyLikes, users } from '@/lib/db/schema';

export interface LikedPost {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory: string | null;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  author: {
    name: string;
    avatar: string | null;
  };
}

export interface LikedReply {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  post: {
    id: string;
    title: string;
    category: string;
  };
  author: {
    name: string;
    avatar: string | null;
  };
}

// GET - Get all posts and replies that the current user has liked
export async function GET(request: NextRequest) {
  await connection();

  try {
    const authUser = await requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    const postAuthors = alias(users, 'postAuthor');
    const replyAuthors = alias(users, 'replyAuthor');

    const [likedPostRows, [{ totalPosts }], likedReplyRows, [{ totalReplies }]] = await Promise.all([
      db
        .select({
          id: communityPosts.id,
          title: communityPosts.title,
          content: communityPosts.content,
          category: communityPosts.category,
          subcategory: communityPosts.subcategory,
          createdAt: communityPosts.createdAt,
          likeCount: communityPosts.likeCount,
          replyCount: communityPosts.replyCount,
          authorName: postAuthors.name,
          authorDisplayName: postAuthors.displayName,
          authorAvatar: postAuthors.image,
        })
        .from(communityLikes)
        .innerJoin(communityPosts, eq(communityLikes.postId, communityPosts.id))
        .innerJoin(postAuthors, eq(communityPosts.userId, postAuthors.id))
        .where(eq(communityLikes.userId, authUser.id))
        .orderBy(desc(communityLikes.createdAt))
        .limit(limit)
        .offset(page * limit),
      db.select({ totalPosts: count() }).from(communityLikes).where(eq(communityLikes.userId, authUser.id)),
      db
        .select({
          id: communityReplies.id,
          content: communityReplies.content,
          createdAt: communityReplies.createdAt,
          likeCount: communityReplies.likeCount,
          postId: communityPosts.id,
          postTitle: communityPosts.title,
          postCategory: communityPosts.category,
          authorName: replyAuthors.name,
          authorDisplayName: replyAuthors.displayName,
          authorAvatar: replyAuthors.image,
        })
        .from(communityReplyLikes)
        .innerJoin(communityReplies, eq(communityReplyLikes.replyId, communityReplies.id))
        .innerJoin(communityPosts, eq(communityReplies.postId, communityPosts.id))
        .innerJoin(replyAuthors, eq(communityReplies.userId, replyAuthors.id))
        .where(eq(communityReplyLikes.userId, authUser.id))
        .orderBy(desc(communityReplyLikes.createdAt))
        .limit(limit)
        .offset(page * limit),
      db.select({ totalReplies: count() }).from(communityReplyLikes).where(eq(communityReplyLikes.userId, authUser.id)),
    ]);

    const formattedPosts: LikedPost[] = likedPostRows.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      category: p.category,
      subcategory: p.subcategory,
      createdAt: p.createdAt.toISOString(),
      likeCount: p.likeCount,
      replyCount: p.replyCount,
      author: { name: p.authorDisplayName || p.authorName || 'Anônimo', avatar: p.authorAvatar },
    }));

    const formattedReplies: LikedReply[] = likedReplyRows.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      likeCount: r.likeCount,
      post: { id: r.postId, title: r.postTitle, category: r.postCategory },
      author: { name: r.authorDisplayName || r.authorName || 'Anônimo', avatar: r.authorAvatar },
    }));

    return NextResponse.json({
      success: true,
      data: { posts: formattedPosts, replies: formattedReplies },
      pagination: {
        page,
        limit,
        totalPosts: Number(totalPosts),
        totalReplies: Number(totalReplies),
        total: Number(totalPosts) + Number(totalReplies),
      },
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar favoritos' }, { status: 500 });
  }
}
