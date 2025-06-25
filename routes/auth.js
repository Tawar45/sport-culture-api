const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const cityController = require('../controllers/cityController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/city', cityController.add);

router.post('/hass-password', authController.generateHashPassword);

// Example protected route
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 