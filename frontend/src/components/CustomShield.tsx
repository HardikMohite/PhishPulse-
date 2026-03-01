interface CustomShieldProps {
  size?: number;
  className?: string;
}

export default function CustomShield({ size = 32, className = "" }: CustomShieldProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield outline */}
      <path
        d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Half fill (left side) */}
      <path
        d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12V2z"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}
