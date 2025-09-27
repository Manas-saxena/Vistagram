import { Router } from 'express';
import { login, signup, refresh, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;


