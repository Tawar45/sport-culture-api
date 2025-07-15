const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create a new booking
router.post('/add', bookingController.createBooking);


router.get('/list', bookingController.listBookings);

// Update a booking
router.put('/:id', bookingController.updateBooking);

// Delete a booking
router.delete('/:id', bookingController.deleteBooking);

// Update payment info for a booking
router.put('/payment/:id', bookingController.updatePayment);

// Get a single booking by id
router.get('/:id', bookingController.getBooking);

// List all bookings


// Count bookings per ground/game
router.get('/count', bookingController.countBookings);

module.exports = router; 