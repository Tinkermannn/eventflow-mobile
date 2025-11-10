import { Router } from 'express';
import { getProfile, updateProfile, deleteUser } from '../controllers/userController';

const router = Router();

router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.delete('/me', deleteUser);

export default router;
