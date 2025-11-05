const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

// Endpoint ini akan "bersarang" di bawah event
// POST /api/events/:eventId/reports
router.post('/:eventId/reports', protect, reportController.createReport);

module.exports = router;