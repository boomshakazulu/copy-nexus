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

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
  }, [src]);

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
