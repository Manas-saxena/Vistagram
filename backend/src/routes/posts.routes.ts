import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { createPost, getPost, listPosts, likePost, sharePost, unlikePost } from '../controllers/posts.controller';

const router = Router();

// Attach optionalAuth so we can compute likedByMe/share attribution
router.get('/', optionalAuth, listPosts);
router.get('/:id', optionalAuth, getPost);
router.post('/', requireAuth, createPost);
router.put('/:id/like', requireAuth, likePost);
router.delete('/:id/like', requireAuth, unlikePost);
router.post('/:id/share', optionalAuth, sharePost);

export default router;


