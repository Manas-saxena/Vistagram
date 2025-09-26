import { timeAgo } from '../utils/time';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';
import type { Post } from '../types/post';

type Props = {
  post: Post;
  liked: boolean;
  likeCount: number;
  shareCount: number;
  onToggleLike: () => void;
  onShare: () => void;
};

export default function PostCard({ post, liked, likeCount, shareCount, onToggleLike, onShare }: Props) {

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
      <div className="w-full bg-black flex items-center justify-center">
        <img
          src={post.imageUrl}
          alt={post.caption}
          className="w-full h-auto max-h-[70vh] object-contain"
          loading="lazy"
        />
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


