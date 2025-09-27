import { useEffect, useMemo, useRef, useState } from 'react';
import PostCard from '../components/PostCard';
import type { Post } from '../types/post';
import { listPosts } from '../services/posts';

export default function Feed() {
  const [pages, setPages] = useState<Post[][]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const items = useMemo(() => pages.flat(), [pages]);

  async function fetchPage(cursor?: string | null) {
    try {
      setLoading(true);
      setError(null);
      const res = await listPosts({ cursor: cursor ?? null, limit: 10 });
      setPages((prev) => [...prev, res.items]);
      setNextCursor(res.nextCursor);
    } catch (e: any) {
      setError(e.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loading && nextCursor) {
        fetchPage(nextCursor);
      }
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [nextCursor, loading]);


  return (
    <div className="h-screen w-screen bg-slate-950 text-white overflow-auto">
      <div className="mx-auto max-w-xl p-4 space-y-4 ">
        {items.map((p, index) => (
          <PostCard key={`${p.id}_${index}`} post={p} />
        ))}
        <div ref={loadMoreRef} />
        {loading && <div className="text-center py-6 text-white/60">Loading…</div>}
        {error && <div className="text-center py-6 text-rose-300">{error}</div>}
        {!nextCursor && !loading && items.length > 0 && (
          <div className="text-center py-6 text-white/50">You’re all caught up</div>
        )}
        <a href="/new" className="fixed bottom-6 right-6 rounded-full bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 shadow-xl">New Post</a>
      </div>
    </div>
  );
}


