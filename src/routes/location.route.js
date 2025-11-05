const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { protect } = require('../middleware/auth.middleware');

// Endpoint: POST /api/events/:eventId/location
router.post('/:eventId/location', protect, locationController.updateLocation);

module.exports = router;