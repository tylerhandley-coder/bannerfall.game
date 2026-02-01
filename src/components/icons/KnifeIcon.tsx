interface KnifeIconProps {
  size?: number;
}

export function KnifeIcon({ size = 20 }: KnifeIconProps) {
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
      <rect x="7" y="10" width="3" height="4" rx="0.5" fill="none" stroke="white" strokeWidth="1.5" />
      <rect x="14" y="10" width="3" height="4" rx="0.5" fill="none" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}
