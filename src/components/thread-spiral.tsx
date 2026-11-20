export function ThreadSpiral({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 560"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        pathLength={1}
        className="thread-draw stroke-thread-light"
        strokeWidth="3"
        strokeLinejoin="miter"
        d="M0 60H420V500H60V120H360V440H120V180H300V380H180V240H240V320"
      />
      <circle
        className="thread-dot fill-thread-light"
        cx="240"
        cy="320"
        r="8"
      />
    </svg>
  );
}