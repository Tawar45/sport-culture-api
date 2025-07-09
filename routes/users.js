const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');
router.get('/list/:usertype', userController.list);
router.delete('/remove/:id', userController.remove);
router.get('/get/:id', userController.getUser);
router.put('/update/:id', upload.single('profile_image'), userController.update);
router.patch('/toggle-status/:id', userController.toggleStatus);
// Example protected route

module.exports = router; 