import { useEffect } from "react";
import { usePlaceImage } from "./usePlaceImage";
import genericTrip from "../../assets/generic-trip.svg";

interface PlaceImageProps {
  title: string;
  cachedUrl?: string;
  className?: string;
  onResolved?: (url: string) => void;
}

export function PlaceImage({ title, cachedUrl, className, onResolved }: PlaceImageProps) {
  const { src, status } = usePlaceImage(title, cachedUrl);
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
        e.currentTarget.src = genericTrip;
      }}
    />
  );
}
