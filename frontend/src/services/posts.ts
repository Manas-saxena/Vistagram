import { apiFetch } from '../api';
import type { Post } from '../types/post';

export async function listPosts(params: { cursor?: string | null; limit?: number } = {}): Promise<{ items: Post[]; nextCursor: string | null }> {
  const q = new URLSearchParams();
  if (params.limit) q.set('limit', String(params.limit));
  if (params.cursor) q.set('cursor', params.cursor);
  const res = await apiFetch(`/api/posts?${q.toString()}`);
  return res as { items: Post[]; nextCursor: string | null };
}

export async function getPost(postId: string): Promise<Post> {
  const res = await apiFetch(`/api/posts/${postId}`);
  return res as Post;
}

export async function likePost(postId: string): Promise<void> {
  await apiFetch(`/api/posts/${postId}/like`, { method: 'PUT' });
}

export async function unlikePost(postId: string): Promise<void> {
  await apiFetch(`/api/posts/${postId}/like`, { method: 'DELETE' });
}

export async function sharePost(postId: string): Promise<{ ok: boolean, alreadyShared: boolean }> {
  return await apiFetch(`/api/posts/${postId}/share`, { method: 'POST', body: JSON.stringify({ channel: 'copy_link' }) });
}


