const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');

router.post('/add', volunteerController.addVolunteer);
router.get('/list', volunteerController.listVolunteers);

module.exports = router; 