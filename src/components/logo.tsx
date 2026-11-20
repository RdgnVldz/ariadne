export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-lg font-semibold tracking-tight ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3h18v18H7V7h10v10h-6v-4h2"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      Ariadne
    </span>
  );
}