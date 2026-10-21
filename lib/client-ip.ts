import { isIP } from 'node:net'

function expandIpv6(address: string): string[] | null {
  const [head, tail, ...rest] = address.split('::')
  if (rest.length > 0) return null

  const headGroups = head ? head.split(':') : []
  const tailGroups = tail === undefined ? [] : tail ? tail.split(':') : []
  const missing = 8 - headGroups.length - tailGroups.length

  if (tail === undefined) return headGroups.length === 8 ? headGroups : null
  if (missing < 0) return null

  return [...headGroups, ...Array<string>(missing).fill('0'), ...tailGroups]
}

// IPv6 clients rotate the lower 64 bits (privacy extensions), so they are compared by /64 prefix.
export function normalizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null

  let value = raw.trim()
  const bracketed = value.match(/^\[([^\]]+)\](?::\d+)?$/)
  if (bracketed) {
    value = bracketed[1]
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(value)) {
    value = value.slice(0, value.lastIndexOf(':'))
  }

  const mappedIpv4 = value.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i)
  if (mappedIpv4) value = mappedIpv4[1]

  const version = isIP(value)
  if (version === 4) return value
  if (version !== 6) return null

  const groups = expandIpv6(value.toLowerCase())
  if (!groups) return null

  return `${groups.slice(0, 4).map((group) => group.padStart(4, '0')).join(':')}::/64`
}

export function getClientIp(headers: Pick<Headers, 'get'>): string | null {
  const realIp = normalizeIp(headers.get('x-real-ip'))
  if (realIp) return realIp

  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]
  return normalizeIp(forwarded)
}
