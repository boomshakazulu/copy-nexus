import { useEffect, useState } from "react";

export default function SmartImage({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  priority = false,
  loading = "lazy",
  decoding = "async",
  fetchPriority,
  sizes,
  width,
  height,
  fallbackSrc,
  onLoad,
  onError,
  ...rest
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const rawProxyBase =
    import.meta.env.VITE_IMAGE_PROXY ||
    `${import.meta.env.VITE_API_BASE || "/api"}/images/proxy`;
  const normalizeProxyBase = (value) => {
    let base = String(value || "/api/v1/images/proxy");
    base = base.replace(/\/+$/g, "");
    while (base.includes("/api/v1/v1")) {
      base = base.replace("/api/v1/v1", "/api/v1");
    }
    while (base.includes("/api/v1/api/v1")) {
      base = base.replace("/api/v1/api/v1", "/api/v1");
    }
    return base.replace(/\/{2,}/g, "/");
  };
  const proxyBase = normalizeProxyBase(rawProxyBase);

  useEffect(() => {
    if (!src) {
      setCurrentSrc(src);
      setIsLoaded(false);
      return;
    }
    const isAbsolute = /^https?:\/\//i.test(src);
    const nextSrc = isAbsolute
      ? `${proxyBase}?url=${encodeURIComponent(src)}`
      : src;
    setCurrentSrc(nextSrc);
    setIsLoaded(false);
  }, [src, proxyBase]);

  const handleLoad = (event) => {
    setIsLoaded(true);
    if (onLoad) onLoad(event);
  };

  const handleError = (event) => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoaded(false);
      return;
    }
    if (onError) onError(event);
  };

  const computedLoading = priority ? "eager" : loading;
  const computedFetchPriority = priority ? "high" : fetchPriority;

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        loading={computedLoading}
        decoding={decoding}
        fetchpriority={computedFetchPriority}
        sizes={sizes}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`h-full w-full transition duration-500 ease-out ${
          isLoaded
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-md scale-105"
        } ${imgClassName}`}
        {...rest}
      />
      {!isLoaded && (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 animate-pulse"
        />
      )}
    </span>
  );
}
