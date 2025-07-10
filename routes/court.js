const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');

// Add a new court
router.post('/add', courtController.addCourt);
// Update a court
router.put('/update/:id', courtController.updateCourt);
// List all courts
router.get('/list', courtController.listCourts);
// Get a single court by id
router.get('/:id', courtController.getCourt);
// Delete a court
router.delete('/delete/:id', courtController.deleteCourt);

module.exports = router; 