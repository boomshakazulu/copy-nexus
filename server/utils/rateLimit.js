const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX = 60;

const buckets = new Map();

const now = () => Date.now();

const getKey = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

const cleanup = () => {
  const cutoff = now() - DEFAULT_WINDOW_MS * 10;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < cutoff) {
      buckets.delete(key);
    }
  }
};

setInterval(cleanup, DEFAULT_WINDOW_MS).unref?.();

function rateLimit({
  windowMs = DEFAULT_WINDOW_MS,
  max = DEFAULT_MAX,
  message = "Too many requests. Please try again later.",
} = {}) {
  return (req, res, next) => {
    const key = getKey(req);
    const current = buckets.get(key);
    const time = now();

    if (!current || current.resetAt <= time) {
      buckets.set(key, { count: 1, resetAt: time + windowMs });
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - 1));
      res.setHeader("X-RateLimit-Reset", String(time + windowMs));
      return next();
    }

    current.count += 1;
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader(
      "X-RateLimit-Remaining",
      String(Math.max(0, max - current.count))
    );
    res.setHeader("X-RateLimit-Reset", String(current.resetAt));

    if (current.count > max) {
      return res.status(429).json({
        error: {
          message,
          code: "rate_limited",
        },
      });
    }

    return next();
  };
}

module.exports = {
  rateLimit,
};
