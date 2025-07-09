const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get dashboard statistics
router.get('/stats', dashboardController.getStats);

module.exports = router; 