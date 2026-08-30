export function applyStoredSessionImage<T extends Record<string, unknown>>(
  token: T,
  storedImage: string | null | undefined
): T {
  if (storedImage === undefined) {
    return token;
  }

  return { ...token, image: storedImage };
}

export async function refreshStoredProfile(
  updateSession: (payload: Record<string, never>) => Promise<unknown | null>
): Promise<void> {
  const updatedSession = await updateSession({});

  if (!updatedSession) {
    throw new Error('Sessão não atualizada.');
  }
}