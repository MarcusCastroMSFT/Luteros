type SearchParams = Pick<URLSearchParams, 'get'>

export function getAuthRedirect(params: SearchParams): string | null {
  for (const key of ['redirectTo', 'redirect']) {
    const destination = params.get(key)
    if (
      destination?.startsWith('/') &&
      !destination.startsWith('//') &&
      !/[\\\u0000-\u001f\u007f]/.test(destination)
    ) {
      return destination
    }
  }
  return null
}

export function getPostLoginDestination(params: SearchParams, role?: string): string {
  return getAuthRedirect(params) ?? (role === 'ADMIN' || role === 'INSTRUCTOR' ? '/admin' : '/')
}
