export type UserLite = { id: string; username: string };

export type Post = {
  id: string;
  imageUrl: string;
  caption: string;
  likeCount: number;
  shareCount: number;
  createdAt: string;
  user: UserLite;
};


