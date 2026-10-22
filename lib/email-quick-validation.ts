/**
 * Client-side quick validation (subset of server validation).
 * Kept free of heavy imports so it is safe to bundle in the browser.
 */
export function quickValidateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmedEmail = email.trim().toLowerCase()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Por favor, insira um e-mail válido (ex: nome@email.com)',
    }
  }

  const [localPart] = trimmedEmail.split('@')

  // Obvious fake patterns only; the server applies the full rules.
  const obviousFakes = [
    /^test[0-9]*$/i,
    /^fake[0-9]*$/i,
    /^aaa+$/i,
    /^asdf+$/i,
    /^[a-z]$/i, // Single character
  ]

  for (const pattern of obviousFakes) {
    if (pattern.test(localPart)) {
      return {
        isValid: false,
        error: 'Por favor, use seu e-mail real',
      }
    }
  }

  return { isValid: true }
}
