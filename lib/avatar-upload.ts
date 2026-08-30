export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export async function validateAvatarFile(file: Blob): Promise<string | null> {
  if (file.size > MAX_AVATAR_BYTES) {
    return 'Imagem muito grande (máximo 5MB).';
  }

  if (file.type !== 'image/jpeg') {
    return 'Envie uma imagem JPG válida.';
  }

  const signature = new Uint8Array(await file.slice(0, 3).arrayBuffer());
  if (signature[0] !== 0xff || signature[1] !== 0xd8 || signature[2] !== 0xff) {
    return 'Envie uma imagem JPG válida.';
  }

  return null;
}