"use client";

import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import { useEffect, useState } from "react";

function isValidSrc(src: string | StaticImport) {
  if (typeof src === "string") {
    try {
      new URL(src);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
  ...props
}: React.ComponentProps<typeof Image> & { fallback?: () => React.ReactNode }) {
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    setLoaded(isValidSrc(src));
  }, [src]);

  return loaded ? (
    typeof src === "string" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setLoaded(false)}
      />
    ) : (
      <Image
        src={src}
        alt={alt}
        className={className}
        onError={() => setLoaded(false)}
        {...props}
      />
    )
  ) : (
    fallback?.() ?? null
  );
}
