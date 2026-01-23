import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { connection } from 'next/server';

export interface UpdateProfileData {
  fullName?: string;
  displayName?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  title?: string;
  company?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  marketingEmails?: boolean;
}

// PUT /api/users/profile/update - Update current user's profile
export async function PUT(request: NextRequest) {
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

    const body: UpdateProfileData = await request.json();

    // Validate and sanitize input
    const updateData: Record<string, unknown> = {};

    if (body.fullName !== undefined) {
      updateData.fullName = body.fullName?.trim() || null;
    }
    if (body.displayName !== undefined) {
      updateData.displayName = body.displayName?.trim() || null;
    }
    if (body.bio !== undefined) {
      updateData.bio = body.bio?.trim() || null;
    }
    if (body.phone !== undefined) {
      updateData.phone = body.phone?.trim() || null;
    }
    if (body.dateOfBirth !== undefined) {
      updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }
    if (body.title !== undefined) {
      updateData.title = body.title?.trim() || null;
    }
    if (body.company !== undefined) {
      updateData.company = body.company?.trim() || null;
    }
    if (body.website !== undefined) {
      updateData.website = body.website?.trim() || null;
    }
    if (body.linkedin !== undefined) {
      updateData.linkedin = body.linkedin?.trim() || null;
    }
    if (body.twitter !== undefined) {
      updateData.twitter = body.twitter?.trim() || null;
    }
    if (body.instagram !== undefined) {
      updateData.instagram = body.instagram?.trim() || null;
    }
    if (body.language !== undefined) {
      updateData.language = body.language;
    }
    if (body.timezone !== undefined) {
      updateData.timezone = body.timezone;
    }
    if (body.emailNotifications !== undefined) {
      updateData.emailNotifications = body.emailNotifications;
    }
    if (body.marketingEmails !== undefined) {
      updateData.marketingEmails = body.marketingEmails;
    }

    // Update profile
    const updatedProfile = await prisma.user_profiles.update({
      where: { id: user.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedProfile.id,
        fullName: updatedProfile.fullName,
        displayName: updatedProfile.displayName,
        bio: updatedProfile.bio,
        phone: updatedProfile.phone,
        dateOfBirth: updatedProfile.dateOfBirth?.toISOString() || null,
        title: updatedProfile.title,
        company: updatedProfile.company,
        website: updatedProfile.website,
        linkedin: updatedProfile.linkedin,
        twitter: updatedProfile.twitter,
        instagram: updatedProfile.instagram,
        language: updatedProfile.language,
        timezone: updatedProfile.timezone,
        emailNotifications: updatedProfile.emailNotifications,
        marketingEmails: updatedProfile.marketingEmails,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
