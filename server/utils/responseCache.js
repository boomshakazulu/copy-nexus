const cache = new Map();

const now = () => Date.now();

const cleanup = () => {
  const time = now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= time) {
      cache.delete(key);
    }
  }
};

setInterval(cleanup, 60 * 1000).unref?.();

function responseCache(ttlMs = 120000) {
  return (req, res, next) => {
    if (req.method !== "GET") return next();
    const key = req.originalUrl || req.url;
    const entry = cache.get(key);
    if (entry && entry.expiresAt > now()) {
      res.setHeader("Cache-Control", `public, max-age=${Math.floor(ttlMs / 1000)}`);
      res.setHeader("X-Cache", "HIT");
      return res.status(entry.status).json(entry.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, {
          body,
          status: res.statusCode || 200,
          expiresAt: now() + ttlMs,
        });
        res.setHeader(
          "Cache-Control",
          `public, max-age=${Math.floor(ttlMs / 1000)}`
        );
        res.setHeader("X-Cache", "MISS");
      }
      return originalJson(body);
    };

    return next();
  };
}

function invalidateByPrefix(prefix) {
  if (!prefix) return;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

module.exports = {
  responseCache,
  invalidateByPrefix,
};
