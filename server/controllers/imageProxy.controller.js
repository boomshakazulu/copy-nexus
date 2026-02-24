const { URL } = require("url");

const ALLOWLIST = (process.env.IMAGE_PROXY_ALLOWLIST || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const isAllowedHost = (host) => {
  if (!ALLOWLIST.length) return true;
  return ALLOWLIST.some((allowed) => allowed === host);
};

const buildError = (res, status, message) =>
  res.status(status).json({ error: { message, code: "image_proxy_error" } });

async function proxyImage(req, res, next) {
  try {
    const target = req.query.url;
    if (!target) return buildError(res, 400, "Missing url");

    let parsed;
    try {
      parsed = new URL(target);
    } catch (_err) {
      return buildError(res, 400, "Invalid url");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return buildError(res, 400, "Invalid protocol");
    }

    if (!isAllowedHost(parsed.host)) {
      return buildError(res, 403, "Host not allowed");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: { "User-Agent": "CopyNexusImageProxy/1.0" },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return buildError(res, response.status, "Image fetch failed");
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      "public, max-age=604800, stale-while-revalidate=86400"
    );

    const buffer = Buffer.from(await response.arrayBuffer());
    return res.send(buffer);
  } catch (err) {
    if (err?.name === "AbortError") {
      return buildError(res, 504, "Image fetch timed out");
    }
    return next(err);
  }
}

module.exports = {
  proxyImage,
};
