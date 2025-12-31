import { useState, useEffect } from "react";
import { buildImageUrl } from "../lib/uploadApi";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export function useImageLoader(
  imageUrl: string | null | undefined,
  placeholderPath: string
) {
  const placeholderImage = buildImageUrl(placeholderPath);
  const [displayImageUrl, setDisplayImageUrl] = useState<string>(
    placeholderImage
  );

  useEffect(() => {
    if (!imageUrl) {
      setDisplayImageUrl(placeholderImage);
      return;
    }

    const fullImageUrl = buildImageUrl(imageUrl);
    let retryCount = 0;
    let isMounted = true;

    const attemptLoadImage = async () => {
      try {
        const response = await fetch(fullImageUrl, { method: "HEAD" });
        if (isMounted && response.ok) {
          setDisplayImageUrl(fullImageUrl);
          return;
        }
      } catch (error) {
        // Fetch failed, will retry
      }

      retryCount++;
      if (retryCount < MAX_RETRIES && isMounted) {
        setTimeout(attemptLoadImage, RETRY_DELAY_MS);
      } else if (isMounted) {
        setDisplayImageUrl(placeholderImage);
      }
    };

    attemptLoadImage();

    return () => {
      isMounted = false;
    };
  }, [imageUrl, placeholderImage]);

  return displayImageUrl;
}
