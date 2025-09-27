import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Post } from '../types/post';
import { getPost } from '../services/posts';
import PostCard from '../components/PostCard';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const p = await getPost(id);
        setPost(p);
        // PostCard manages local like/share state
      } catch (e: any) {
        setError(e.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);


  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-xl p-4">
        <div className="mb-4"><Link to="/" className="text-white/70 hover:text-white">← Back</Link></div>
        {loading && <div className="text-white/60">Loading…</div>}
        {error && <div className="text-rose-300">{error}</div>}
        {post && (<PostCard post={post} />)}
      </div>
    </div>
  );
}


