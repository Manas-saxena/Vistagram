import { useState } from 'react';
import { timeAgo } from '../utils/time';
import { copyToClipboard } from '../utils/copy';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';
import type { Post } from '../types/post';

type Props = { post: Post };

export default function PostCard({ post }: Props) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [shareCount, setShareCount] = useState(post.shareCount);

  const onToggleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
  };

  const onShare = async () => {
    const ok = await copyToClipboard(`${window.location.origin}/p/${post.id}`);
    if (ok) setShareCount((c) => c + 1);
  };

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
      <div className="aspect-square w-full bg-black">
        <img src={post.imageUrl} alt={post.caption} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="p-4">
        <p className="mb-3 line-clamp-2 text-white/90">{post.caption}</p>
        <div className="flex items-center gap-3">
          <LikeButton liked={liked} count={likeCount} onToggle={onToggleLike} />
          <ShareButton count={shareCount} onShare={onShare} />
        </div>
      </div>
    </article>
  );
}


