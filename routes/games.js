const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/gamesController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

router.post('/add', upload.single('image'), gamesController.add);
router.put('/update/:id', upload.single('image'), gamesController.update);
router.get('/list', gamesController.list);
// router.get('/get/:id', gamesController.get);
router.delete('/remove/:id', gamesController.remove);


// Example protected route
// router.get('/profile', authMiddleware, (req, res) => {
//   res.json({ user: req.user });
// });

module.exports = router; 