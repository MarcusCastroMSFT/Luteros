import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { connection } from 'next/server';

export interface UserProfileData {
  id: string;
  fullName: string | null;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  title: string | null;
  company: string | null;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  instagram: string | null;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  stats: {
    enrolledCourses: number;
    completedCourses: number;
    registeredEvents: number;
    savedArticles: number;
    certificates: number;
  };
}

// GET /api/users/profile - Get current user's profile with stats
export async function GET() {
  await connection();

  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Fetch user profile and stats in parallel
    const [profile, enrolledCourses, completedCourses, registeredEvents, savedArticles, certificates] = await Promise.all([
      prisma.user_profiles.findUnique({
        where: { id: user.id },
      }),
      prisma.enrollments.count({
        where: { userId: user.id },
      }),
      prisma.enrollments.count({
        where: { 
          userId: user.id,
          completedAt: { not: null },
        },
      }),
      prisma.event_registrations.count({
        where: { userId: user.id },
      }),
      prisma.blog_bookmarks.count({
        where: { userId: user.id },
      }),
      prisma.certificates.count({
        where: { userId: user.id },
      }),
    ]);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    const profileData: UserProfileData = {
      id: profile.id,
      fullName: profile.fullName,
      displayName: profile.displayName,
      bio: profile.bio,
      avatar: profile.avatar,
      email: user.email || '',
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth?.toISOString() || null,
      title: profile.title,
      company: profile.company,
      website: profile.website,
      linkedin: profile.linkedin,
      twitter: profile.twitter,
      instagram: profile.instagram,
      language: profile.language,
      timezone: profile.timezone,
      emailNotifications: profile.emailNotifications,
      marketingEmails: profile.marketingEmails,
      createdAt: profile.createdAt.toISOString(),
      lastLoginAt: profile.lastLoginAt?.toISOString() || null,
      stats: {
        enrolledCourses,
        completedCourses,
        registeredEvents,
        savedArticles,
        certificates,
      },
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}
