import domains from 'disposable-email-domains'

// Convert to Set for O(1) lookup
const disposableDomains = new Set(domains)

// Common fake email patterns (local part)
const FAKE_LOCAL_PATTERNS = [
  /^test[0-9]*$/i,
  /^fake[0-9]*$/i,
  /^spam[0-9]*$/i,
  /^temp[0-9]*$/i,
  /^aaa+$/i,
  /^bbb+$/i,
  /^abc[0-9]*$/i,
  /^123[0-9]*$/i,
  /^asdf[0-9]*$/i,
  /^qwerty[0-9]*$/i,
  /^admin[0-9]*$/i,
  /^user[0-9]*$/i,
  /^sample[0-9]*$/i,
  /^example[0-9]*$/i,
  /^demo[0-9]*$/i,
  /^null[0-9]*$/i,
  /^void[0-9]*$/i,
  /^noreply[0-9]*$/i,
  /^no-reply[0-9]*$/i,
  /^none[0-9]*$/i,
  /^nobody[0-9]*$/i,
  /^anonymous[0-9]*$/i,
  /^[a-z]{1,2}@/i, // Very short local parts like "a@" or "ab@"
  /^(.)\1{3,}$/i, // Repeating characters like "aaaa", "bbbb"
  /^[0-9]+$/i, // All numbers
]

// Common fake full email addresses
const FAKE_EMAILS = new Set([
  'test@test.com',
  'test@example.com',
  'test@gmail.com',
  'fake@fake.com',
  'fake@gmail.com',
  'spam@spam.com',
  'a@a.com',
  'aa@aa.com',
  'aaa@aaa.com',
  'email@email.com',
  'mail@mail.com',
  'no@no.com',
  'none@none.com',
  'user@user.com',
  'admin@admin.com',
])

// Domains that are commonly used for testing
const BLOCKED_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'test.org',
  'localhost',
  'localhost.localdomain',
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'fakeinbox.com',
  'throwaway.email',
])

export interface EmailValidationResult {
  isValid: boolean
  error?: string
  errorCode?: 'INVALID_FORMAT' | 'DISPOSABLE' | 'FAKE_PATTERN' | 'BLOCKED_DOMAIN' | 'TOO_SHORT'
}

/**
 * Validates an email address for newsletter subscription
 * Checks format, disposable domains, fake patterns, and blocked domains
 */
export function validateEmail(email: string): EmailValidationResult {
  const trimmedEmail = email.trim().toLowerCase()
  
  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: 'Por favor, insira um e-mail válido',
      errorCode: 'INVALID_FORMAT',
    }
  }

  const [localPart, domain] = trimmedEmail.split('@')
  
  // Check for very short local parts
  if (localPart.length < 2) {
    return {
      isValid: false,
      error: 'E-mail muito curto',
      errorCode: 'TOO_SHORT',
    }
  }

  // Check exact fake emails
  if (FAKE_EMAILS.has(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Por favor, use seu e-mail real',
      errorCode: 'FAKE_PATTERN',
    }
  }

  // Check blocked domains
  if (BLOCKED_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Este domínio de e-mail não é permitido',
      errorCode: 'BLOCKED_DOMAIN',
    }
  }

  // Check disposable email domains
  if (disposableDomains.has(domain)) {
    return {
      isValid: false,
      error: 'E-mails temporários não são permitidos. Use seu e-mail real.',
      errorCode: 'DISPOSABLE',
    }
  }

  // Check fake local part patterns
  for (const pattern of FAKE_LOCAL_PATTERNS) {
    if (pattern.test(localPart)) {
      return {
        isValid: false,
        error: 'Por favor, use seu e-mail real',
        errorCode: 'FAKE_PATTERN',
      }
    }
  }

  return { isValid: true }
}

/**
 * Client-side quick validation (subset of server validation)
 * Use this for instant feedback without exposing full validation logic
 */
export function quickValidateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmedEmail = email.trim().toLowerCase()
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Por favor, insira um e-mail válido (ex: nome@email.com)',
    }
  }

  const [localPart] = trimmedEmail.split('@')
  
  // Check for obvious fake patterns (client-side only)
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
