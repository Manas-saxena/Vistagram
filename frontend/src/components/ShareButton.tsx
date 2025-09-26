type Props = {
  count: number;
  onShare: () => void;
  disabled?: boolean;
};

export default function ShareButton({ count, onShare, disabled }: Props) {
  return (
    <button
      onClick={onShare}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
    >
      <span className="h-3 w-3 rounded-sm bg-cyan-300" />
      <span className="text-sm">{count}</span>
    </button>
  );
}


