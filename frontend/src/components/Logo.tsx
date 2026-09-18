interface LogoProps {
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Tripper brand mark: a white map-pin (teardrop) with the letter "T" knocked
 * out, on a rounded teal tile. Kept in sync with public/favicon.svg (the browser
 * tab / PWA icon) so the brand reads identically in-app and on the home screen.
 */
export function Logo({ size = 32, className, title = "Tripper" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={title}
      className={className}
    >
      <rect x="2" y="2" width="92" height="92" rx="22" fill="#0d9488" />
      <path
        d="M48 18 C33 18 23 29 23 43 C23 60 48 80 48 80 C48 80 73 60 73 43 C73 29 63 18 48 18 Z"
        fill="#fff"
      />
      <rect x="36" y="34" width="24" height="7" rx="2.5" fill="#0d9488" />
      <rect x="44.5" y="34" width="7" height="22" rx="2.5" fill="#0d9488" />
    </svg>
  );
}
