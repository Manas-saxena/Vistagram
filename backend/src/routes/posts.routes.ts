import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { createPost, getPost, listPosts, likePost, sharePost, unlikePost } from '../controllers/posts.controller';

const router = Router();

router.get('/:id', getPost);
router.post('/', requireAuth, createPost);

export default router;


