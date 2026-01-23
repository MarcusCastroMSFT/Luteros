import { NextRequest, NextResponse, connection } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

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
  try {
    await connection();

    // Get current user from Supabase Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log('Favorites API - User:', user?.id);

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

    console.log('Favorites API - Fetching likes for user:', user.id);

    // Fetch liked posts with details
    const [likedPosts, likedPostsCount, likedReplies, likedRepliesCount] = await Promise.all([
      prisma.community_likes.findMany({
        where: { userId: user.id },
        include: {
          community_posts: {
            include: {
              user_profiles: {
                select: {
                  fullName: true,
                  displayName: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.community_likes.count({
        where: { userId: user.id },
      }),
      prisma.community_reply_likes.findMany({
        where: { userId: user.id },
        include: {
          community_replies: {
            include: {
              user_profiles: {
                select: {
                  fullName: true,
                  displayName: true,
                  avatar: true,
                },
              },
              community_posts: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.community_reply_likes.count({
        where: { userId: user.id },
      }),
    ]);

    console.log('Favorites API - Found:', {
      likedPostsCount,
      likedRepliesCount,
      postsData: likedPosts.length,
      repliesData: likedReplies.length
    });

    const formattedPosts: LikedPost[] = likedPosts.map((like: {
      community_posts: {
        id: string;
        title: string;
        content: string;
        category: string;
        subcategory: string | null;
        createdAt: Date;
        likeCount: number;
        replyCount: number;
        user_profiles: {
          fullName: string | null;
          displayName: string | null;
          avatar: string | null;
        };
      };
    }) => ({
      id: like.community_posts.id,
      title: like.community_posts.title,
      content: like.community_posts.content,
      category: like.community_posts.category,
      subcategory: like.community_posts.subcategory,
      createdAt: like.community_posts.createdAt.toISOString(),
      likeCount: like.community_posts.likeCount,
      replyCount: like.community_posts.replyCount,
      author: {
        name: like.community_posts.user_profiles.displayName || like.community_posts.user_profiles.fullName || 'Anônimo',
        avatar: like.community_posts.user_profiles.avatar,
      },
    }));

    const formattedReplies: LikedReply[] = likedReplies.map((like: {
      community_replies: {
        id: string;
        content: string;
        createdAt: Date;
        likeCount: number;
        user_profiles: {
          fullName: string | null;
          displayName: string | null;
          avatar: string | null;
        };
        community_posts: {
          id: string;
          title: string;
          category: string;
        };
      };
    }) => ({
      id: like.community_replies.id,
      content: like.community_replies.content,
      createdAt: like.community_replies.createdAt.toISOString(),
      likeCount: like.community_replies.likeCount,
      post: {
        id: like.community_replies.community_posts.id,
        title: like.community_replies.community_posts.title,
        category: like.community_replies.community_posts.category,
      },
      author: {
        name: like.community_replies.user_profiles.displayName || like.community_replies.user_profiles.fullName || 'Anônimo',
        avatar: like.community_replies.user_profiles.avatar,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        posts: formattedPosts,
        replies: formattedReplies,
      },
      pagination: {
        page,
        limit,
        totalPosts: likedPostsCount,
        totalReplies: likedRepliesCount,
        total: likedPostsCount + likedRepliesCount,
      },
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar favoritos' },
      { status: 500 }
    );
  }
}
