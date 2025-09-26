import { useEffect, useMemo, useRef, useState } from 'react';
import PostCard from '../components/PostCard';
import type { Post } from '../types/post';
import { likePost, listPosts, sharePost, unlikePost } from '../services/posts';
import { copyToClipboard } from '../utils/copy';

export default function Feed() {
  const [pages, setPages] = useState<Post[][]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const items = useMemo(() => pages.flat(), [pages]);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [shareCountMap, setShareCountMap] = useState<Record<string, number>>({});

  async function fetchPage(cursor?: string | null) {
    try {
      setLoading(true);
      setError(null);
      const res = await listPosts({ cursor: cursor ?? null, limit: 10 });
      setPages((prev) => [...prev, res.items]);
      setNextCursor(res.nextCursor);
      setLikeCountMap((m) => ({ ...m, ...Object.fromEntries(res.items.map((p) => [p.id, p.likeCount])) }));
      setShareCountMap((m) => ({ ...m, ...Object.fromEntries(res.items.map((p) => [p.id, p.shareCount])) }));
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

  function toggleLikeLocal(id: string) {
    setLikedMap((m) => ({ ...m, [id]: !m[id] }));
    setLikeCountMap((m) => ({ ...m, [id]: (m[id] ?? 0) + (!likedMap[id] ? 1 : -1) }));
  }

  async function handleLike(id: string) {
    const liked = likedMap[id] ?? false;
    toggleLikeLocal(id);
    try {
      if (!liked) await likePost(id); else await unlikePost(id);
    } catch {
      toggleLikeLocal(id);
    }
  }

  async function handleShare(id: string) {
    const url = `${window.location.origin}/p/${id}`;
    let ok = false;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Vistagram', url });
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      ok = await copyToClipboard(url);
    }
    if (ok) {
      setShareCountMap((m) => ({ ...m, [id]: (m[id] ?? 0) + 1 }));
      try { await sharePost(id); } catch {}
    }
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-white overflow-auto">
      <div className="mx-auto max-w-xl p-4 space-y-4 ">
        {items.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            liked={!!likedMap[p.id]}
            likeCount={likeCountMap[p.id] ?? p.likeCount}
            shareCount={shareCountMap[p.id] ?? p.shareCount}
            onToggleLike={() => handleLike(p.id)}
            onShare={() => handleShare(p.id)}
          />
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


