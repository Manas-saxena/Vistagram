type Props = {
  count: number;
  onShare: () => void;
  disabled?: boolean;
};

export default function ShareButton({ count, onShare, disabled }: Props) {
  return (
    <button
      aria-label="Share"
      onClick={onShare}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 active:scale-[0.98]"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cyan-300"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.59 13.51l6.83 3.98" />
        <path d="M15.41 6.51L8.59 10.49" />
      </svg>
      <span className="text-sm tabular-nums">{count}</span>
    </button>
  );
}


