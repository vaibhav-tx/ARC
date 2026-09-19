type RateLimitCache = {
  [key: string]: { count: number; lastReset: number }
};

const cache: RateLimitCache = {};

export function rateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60000 // 1 minute default
): { success: boolean; headers: Record<string, string> } {
  const now = Date.now();
  
  if (!cache[ip]) {
    cache[ip] = { count: 1, lastReset: now };
    return {
      success: true,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': (limit - 1).toString(),
      }
    };
  }

  const record = cache[ip];

  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    return {
      success: true,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': (limit - 1).toString(),
      }
    };
  }

  record.count += 1;

  if (record.count > limit) {
    return {
      success: false,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'Retry-After': Math.ceil((windowMs - (now - record.lastReset)) / 1000).toString(),
      }
    };
  }

  return {
    success: true,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': (limit - record.count).toString(),
    }
  };
}
