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
      onClick={onToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 border ${
        liked ? 'border-rose-400 bg-rose-500/10 text-rose-300' : 'border-white/15 bg-white/5 text-white/80'
      } hover:bg-white/10`}
    >
      <span className={`h-3 w-3 rounded-full ${liked ? 'bg-rose-400' : 'bg-white/40'}`} />
      <span className="text-sm">{count}</span>
    </button>
  );
}


