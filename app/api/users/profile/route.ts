import { NextRequest, NextResponse } from 'next/server';
import { eq, count } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { users, enrollments, eventRegistrations, blogBookmarks, certificates } from '@/lib/db/schema';
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

export async function GET(_request: NextRequest) {
  await connection();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    const userId = session.user.id;

    const [profile, [{ enrolledCount }], [{ completedCount }], [{ eventsCount }], [{ savedCount }], [{ certsCount }]] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1).then((r) => r[0] ?? null),
      db.select({ enrolledCount: count() }).from(enrollments).where(eq(enrollments.userId, userId)),
      db.select({ completedCount: count() }).from(enrollments).where(eq(enrollments.userId, userId)),
      db.select({ eventsCount: count() }).from(eventRegistrations).where(eq(eventRegistrations.userId, userId)),
      db.select({ savedCount: count() }).from(blogBookmarks).where(eq(blogBookmarks.userId, userId)),
      db.select({ certsCount: count() }).from(certificates).where(eq(certificates.userId, userId)),
    ]);

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 });
    }

    const profileData: UserProfileData = {
      id: profile.id,
      fullName: profile.name,
      displayName: profile.displayName,
      bio: profile.bio,
      avatar: profile.image,
      email: profile.email || '',
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
        enrolledCourses: Number(enrolledCount),
        completedCourses: Number(completedCount),
        registeredEvents: Number(eventsCount),
        savedArticles: Number(savedCount),
        certificates: Number(certsCount),
      },
    };

    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

