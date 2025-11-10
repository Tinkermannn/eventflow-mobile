import { Router } from 'express';
import { updateLocation, getEventLocations, getMyLocation } from '../controllers/locationController';

const router = Router();

// Update current user's location in event
router.post('/events/:eventId/location', updateLocation);

// Get all participant locations for event
router.get('/events/:eventId/locations', getEventLocations);

// Get current user's location in event
router.get('/events/:eventId/location/me', getMyLocation);

export default router;
