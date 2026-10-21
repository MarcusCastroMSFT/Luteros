export const DEFAULT_MAX_DISTINCT_IPS = 3
export const ACCESS_WINDOW_MS = 24 * 60 * 60 * 1000

export interface KnownAccessIp {
  ipAddress: string
  lastSeenAt: Date
}

export interface IpAccessInput {
  knownIps: KnownAccessIp[]
  currentIp: string
  now: Date
  maxDistinctIps: number
  windowMs?: number
}

// Allows a known IP, or a new one while the account has not reached its distinct-IP budget
// inside the rolling window. Mobile networks and Wi-Fi/4G switches justify more than one IP.
export function evaluateIpAccess(input: IpAccessInput): { allowed: boolean } {
  const { knownIps, currentIp, now, maxDistinctIps, windowMs = ACCESS_WINDOW_MS } = input
  if (maxDistinctIps <= 0) return { allowed: true }

  const cutoff = now.getTime() - windowMs
  const recent = knownIps.filter((entry) => entry.lastSeenAt.getTime() >= cutoff)

  if (recent.some((entry) => entry.ipAddress === currentIp)) return { allowed: true }
  return { allowed: recent.length < maxDistinctIps }
}

export function parseMaxDistinctIps(value: string | undefined): number {
  if (value === undefined || value.trim() === '') return DEFAULT_MAX_DISTINCT_IPS
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_MAX_DISTINCT_IPS
}
