import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env, features } from '@/lib/env'

// Only create the client if Redis is configured
function getRateLimiter(
  requests: number, 
  window: string
) {
  if (!features.rateLimitEnabled) return null
  
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  })
  
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as any),
  })
}

/**
 * Rate limit by IP address.
 * Returns true if the request should be blocked.
 */
export async function isRateLimited(
  identifier: string,
  requests = 5,
  window = '1 m'
): Promise<boolean> {
  const limiter = getRateLimiter(requests, window)
  
  // If Redis not configured, skip rate limiting
  // (acceptable for small schools, configure before scaling)
  if (!limiter) return false
  
  const { headers } = await import('next/headers')
  const headersList = await headers()
  const ip = 
    headersList.get('x-forwarded-for') || 
    headersList.get('x-real-ip') || 
    'unknown'
  
  const key = `${identifier}:${ip}`
  const { success } = await limiter.limit(key)
  
  return !success
}