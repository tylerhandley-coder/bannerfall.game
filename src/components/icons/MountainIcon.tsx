interface MountainIconProps {
  size?: number;
  color?: string;
}

export function MountainIcon({ size = 24, color }: MountainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color}
    >
      <path
        d="M4 20L12 4L20 20H4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 20L12 12L16 20H8Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}
