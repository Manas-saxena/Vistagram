type Props = {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
};

export default function LikeButton({ liked, count, onToggle, disabled }: Props) {
  return (
    <button
      aria-pressed={liked}
      aria-label={liked ? 'Unlike' : 'Like'}
      onClick={onToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 border transition ${
        liked ? 'border-rose-400/60 bg-rose-500/10 text-rose-300' : 'border-white/15 bg-white/5 text-white/80'
      } hover:bg-white/10 active:scale-[0.98]`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        className={`${liked ? 'text-rose-400' : 'text-white/80'} transition-transform`}
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="text-sm tabular-nums">{count}</span>
    </button>
  );
}


