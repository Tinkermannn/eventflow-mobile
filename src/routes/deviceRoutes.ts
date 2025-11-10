import { Router } from 'express';
import { registerDevice, getMyDevices, deleteDevice } from '../controllers/deviceController';

const router = Router();

// Register or update device push token
router.post('/devices/register', registerDevice);

// Get all devices for current user
router.get('/devices/me', getMyDevices);

// Delete device (logout)
router.delete('/devices/:deviceId', deleteDevice);

export default router;
