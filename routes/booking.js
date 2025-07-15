const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create a new booking
router.post('/add', bookingController.createBooking);


router.get('/list', bookingController.listBookings);

router.get('/cash-collection/summary', bookingController.getCashCollectionSummary);
router.post('/cash-collection/:id/received', bookingController.markAdminCashReceived);

router.get('/onlinePayment', bookingController.getOnlinePaymentSettlement);
router.post('/online-settlement/:id/received', bookingController.markOnlineSettlementReceived);


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

// Cash collection summary and admin receive endpoints

module.exports = router; 