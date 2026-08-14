import { useEffect } from "react";
import { usePlaceImage } from "./usePlaceImage";
import { categoryImage } from "./categoryImage";

interface PlaceImageProps {
  title: string;
  cachedUrl?: string;
  category?: string;
  className?: string;
  onResolved?: (url: string) => void;
}

export function PlaceImage({ title, cachedUrl, category, className, onResolved }: PlaceImageProps) {
  const { src, status } = usePlaceImage(title, cachedUrl, category);
  useEffect(() => {
    if (status === "resolved") onResolved?.(src);
  }, [status, src, onResolved]);
  return (
    <img
      className={className}
      src={src}
      alt=""
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src = categoryImage(category);
      }}
    />
  );
}
