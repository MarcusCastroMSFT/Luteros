import { put } from '@vercel/blob';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse, connection } from 'next/server';
import { auth } from '@/auth';
import { validateAvatarFile } from '@/lib/avatar-upload';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  await connection();

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'Arquivo não enviado.' }, { status: 400 });
    }

    const validationError = await validateAvatarFile(file);
    if (validationError) {
      const status = file.size > 5 * 1024 * 1024 ? 413 : 415;
      return NextResponse.json({ error: validationError }, { status });
    }

    const userId = session.user.id;
    const filename = `avatars/${userId}/${Date.now()}-${crypto.randomUUID()}.jpg`;
    const blob = await put(filename, file, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });

    await db
      .update(users)
      .set({ image: blob.url, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar foto do perfil.' }, { status: 500 });
  }
}