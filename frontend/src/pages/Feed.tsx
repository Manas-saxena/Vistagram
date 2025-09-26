import PostCard from '../components/PostCard';
import type { Post } from '../types/post';

const dummy: Post[] = [
  {
    id: 'p1',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
    caption: 'Golden hour over the snowy ridge. The air felt crisp and calm.',
    likeCount: 12,
    shareCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    user: { id: 'u1', username: 'aurora' },
  },
  {
    id: 'p2',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop',
    caption: 'Path through the valley. Hiking season is here!',
    likeCount: 5,
    shareCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    user: { id: 'u2', username: 'trailblazer' },
  },
];

export default function Feed() {
  return (
    <div className="h-screen w-screen bg-slate-950 text-white overflow-auto">
      <div className="mx-auto max-w-xl p-4 space-y-4 ">
        {dummy.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}


