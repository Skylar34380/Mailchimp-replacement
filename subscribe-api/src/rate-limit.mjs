export function createRateLimiter({ windowMs, max }) {
  const buckets = new Map();

  return function rateLimit(key) {
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now - bucket.startedAt > windowMs) {
      buckets.set(key, { count: 1, startedAt: now });
      return { allowed: true, remaining: max - 1 };
    }

    bucket.count += 1;
    return {
      allowed: bucket.count <= max,
      remaining: Math.max(0, max - bucket.count),
    };
  };
}
