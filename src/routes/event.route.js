const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { protect, isOrganizer } = require('../middleware/auth.middleware');

// GET /api/events/ -> Mendapatkan semua event yang diikuti/dibuat user
router.get('/', protect, eventController.getMyEvents);

// POST /api/events/ -> Membuat event baru (hanya organizer)
router.post('/', protect, isOrganizer, eventController.createEvent);

// POST /api/events/join -> Bergabung ke sebuah event
router.post('/join', protect, eventController.joinEvent);

// GET /api/events/:eventId -> Mendapatkan detail sebuah event
router.get('/:eventId', protect, eventController.getEventDetails);

module.exports = router;