const express = require('express');
const router = express.Router();
const amenitiesController = require('../controllers/amenitiesController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', amenitiesController.add);
router.get('/list', amenitiesController.list);
router.put('/update/:id', amenitiesController.update);
router.delete('/remove/:id', amenitiesController.remove);

module.exports = router; 