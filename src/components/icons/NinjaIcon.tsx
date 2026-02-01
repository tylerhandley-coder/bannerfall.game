interface NinjaIconProps {
  size?: number;
}

export function NinjaIcon({ size = 20 }: NinjaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3c-5 0-8 3-8 8v5c0 2 1 3 3 3h10c2 0 3-1 3-3v-5c0-5-3-8-8-8z" fill="currentColor" />
      <line x1="4" y1="9" x2="20" y2="9" stroke="white" strokeWidth="2" />
      <ellipse cx="9" cy="13" rx="1.5" ry="2" fill="white" />
      <ellipse cx="15" cy="13" rx="1.5" ry="2" fill="white" />
    </svg>
  );
}
