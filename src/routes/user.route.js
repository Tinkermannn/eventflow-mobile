const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Endpoint untuk mendapatkan profil user yang sedang login
// GET /api/users/me
router.get('/me', protect, userController.getProfile);

// Endpoint untuk update profil user
// PUT /api/users/me
// Middleware `upload.single('avatar')` akan menangani upload 1 file dengan field name 'avatar'
router.put('/me', protect, upload.single('avatar'), userController.updateProfile);

module.exports = router;