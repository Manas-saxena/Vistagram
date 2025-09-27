import { Router } from 'express';
import { optionalJwt, requireJwt } from '../middleware/jwt';
import { createPost, getPost, listPosts, likePost, sharePost, unlikePost } from '../controllers/posts.controller';

const router = Router();

// Attach optional JWT so we can compute likedByMe/share attribution
router.get('/', optionalJwt, listPosts);
router.get('/:id', optionalJwt, getPost);
router.post('/', requireJwt, createPost);
router.put('/:id/like', requireJwt, likePost);
router.delete('/:id/like', requireJwt, unlikePost);
router.post('/:id/share', optionalJwt, sharePost);

export default router;


