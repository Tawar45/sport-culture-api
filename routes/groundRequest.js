const express = require('express');
const router = express.Router();
const groundRequestController = require('../controllers/groundRequestController');
const upload = require('../config/multerConfig');
router.post('/add', groundRequestController.add);
// router.put('/update/:id', groundRequestController.update);
router.get('/list', groundRequestController.list);
// router.delete('/remove/:id', groundRequestController.remove);

module.exports = router; 