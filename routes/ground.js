const express = require('express');
const router = express.Router();
const groundController = require('../controllers/groundController');
const upload = require('../config/multerConfig');

router.post('/add', upload.array('images', 5), groundController.add);
router.put('/update/:id', upload.array('images', 5), groundController.update);
router.get('/list/:id', groundController.list);
router.get('/list', groundController.list);
router.get('/get/:id', groundController.getGround);
router.delete('/remove/:id', groundController.remove);
router.get('/games/:groundId', groundController.getGroundGames);
router.get('/courts/:groundId', groundController.getGroundCourts); // Add this new route

module.exports = router; 