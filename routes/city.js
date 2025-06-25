const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', cityController.add);
router.get('/list', cityController.list);
router.put('/update/:id', cityController.update);
router.delete('/remove/:id', cityController.remove);


// Example protected route
// router.get('/profile', authMiddleware, (req, res) => {
//   res.json({ user: req.user });
// });

module.exports = router; 