import { useState } from 'react';
import { timeAgo } from '../utils/time';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';
import type { Post } from '../types/post';
import { likePost, sharePost, unlikePost } from '../services/posts';
import toast from 'react-hot-toast';
import { copyToClipboard } from '../utils/copy';

type Props = { post: Post };

export default function PostCard({ post }: Props) {
  const [liked, setLiked] = useState(!!post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [shareCount, setShareCount] = useState(post.shareCount);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(post.imageUrl);

  async function handleToggleLike() {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    try {
      if (!wasLiked) await likePost(post.id); else await unlikePost(post.id);
    } catch {
      // rollback
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
      toast.error('Failed to update like');
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/p/${post.id}`;
    let ok = false;
    if (navigator.share) {
      try { await navigator.share({ title: 'Vistagram', url }); ok = true; } catch { ok = false; }
    }
    if (!ok) ok = await copyToClipboard(url);
    if (ok) {
      try {
        const res = await sharePost(post.id) as any;
        if (!res?.alreadyShared) setShareCount((c) => c + 1);
        toast.success(res?.alreadyShared ? 'Already shared' : 'Link shared');
      } catch {
        toast.error('Share failed');
      }
    }
  }

  return (
    <article className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl overflow-hidden text-white">
      <header className="flex items-center gap-3 p-4">
        <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
          {post.user.username.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{post.user.username}</span>
          <span className="text-xs text-white/60">{timeAgo(post.createdAt)}</span>
        </div>
      </header>
      <div className="w-full bg-black flex items-center justify-center relative min-h-[16rem] overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
        <img
          src={imgSrc}
          alt={post.caption}
          className={`w-full h-auto max-h-[70vh] object-contain transition-opacity ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgSrc('/image-fallback.svg'); setImgLoaded(true); }}
        />
      </div>
      <div className="p-4">
        <p className="mb-3 line-clamp-2 text-white/90">{post.caption}</p>
        <div className="flex items-center gap-3">
          <LikeButton liked={liked} count={likeCount} onToggle={handleToggleLike} />
          <ShareButton count={shareCount} onShare={handleShare} />
        </div>
      </div>
    </article>
  );
}


