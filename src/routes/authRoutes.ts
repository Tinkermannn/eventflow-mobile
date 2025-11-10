import { Router } from 'express';
import { register, login, updateUser, deleteUser } from '../controllers/authController';
import { requireAuth } from '../utils/requireAuth';

const router = Router();


router.post('/register', register);
router.post('/login', login);
router.patch('/update', requireAuth, updateUser);
router.delete('/delete', requireAuth, deleteUser);

export default router;
