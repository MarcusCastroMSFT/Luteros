export function applyStoredSessionImage<T extends Record<string, unknown>>(
  token: T,
  storedImage: string | null | undefined
): T {
  if (storedImage === undefined) {
    return token;
  }

  return { ...token, image: storedImage };
}