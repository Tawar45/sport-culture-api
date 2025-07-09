const express = require('express');
const router = express.Router();
const groundController = require('../controllers/groundController');
const upload = require('../config/multerConfig');
router.post('/add', upload.single('image'), groundController.add);
router.put('/update/:id', upload.single('image'), groundController.update);
router.get('/list/:id', groundController.list);
router.get('/list', groundController.list);
router.delete('/remove/:id', groundController.remove);

module.exports = router; 