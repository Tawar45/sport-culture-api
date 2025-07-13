const express = require('express');
const router = express.Router();
const groundRequestController = require('../controllers/groundRequestController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (for users to submit requests)
router.post('/add', groundRequestController.add);

// Protected routes (for admin management)
router.get('/list', authMiddleware, groundRequestController.list);
router.get('/stats', authMiddleware, groundRequestController.getStats);
router.get('/get/:id', authMiddleware, groundRequestController.getGroundRequest);
router.put('/update-status/:id', authMiddleware, groundRequestController.updateStatus);
router.delete('/remove/:id', authMiddleware, groundRequestController.remove);

module.exports = router; 