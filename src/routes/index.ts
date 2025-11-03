import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import participantRoutes from './participant.routes';
import locationRoutes from './location.routes';
import zoneRoutes from './zone.routes';
import reportRoutes from './report.routes';
//import facilityRoutes from './facility.routes';
import eventNestedRoutes from './event-nested.routes';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'EventFlow API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * API Routes
 */
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/events', eventNestedRoutes); // Nested routes
router.use('/participants', participantRoutes);
router.use('/locations', locationRoutes);
router.use('/zones', zoneRoutes);
router.use('/reports', reportRoutes);
//router.use('/facilities', facilityRoutes); // ✅ NEW!

/**
 * API Info endpoint
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EventFlow API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      events: '/api/v1/events',
      participants: '/api/v1/participants',
      locations: '/api/v1/locations',
      zones: '/api/v1/zones',
      reports: '/api/v1/reports',
      facilities: '/api/v1/facilities', // ✅ NEW!
    },
    docs: '/api/v1/docs',
  });
});

export default router;