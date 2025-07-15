const Booking = require('../models/Booking');
const { Op } = require('sequelize');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      user_id, ground_id, game_id, court_id, booking_date, slot, booking_type,
      payment_status, payment_method, payment_reference, amount, status
    } = req.body;
    const booking = await Booking.create({
      user_id, ground_id, game_id, court_id,booking_date, slot, booking_type,
      payment_status, payment_method, payment_reference, amount, status
    });
    res.status(201).json({ 
      success: true,
      message: 'Booking created successfully',
      data: booking 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id, ground_id, game_id, booking_date, slot, booking_type,
      payment_status, payment_method, payment_reference, amount, status
    } = req.body;
    
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    await booking.update({
      user_id, ground_id, game_id, booking_date, slot, booking_type,
      payment_status, payment_method, payment_reference, amount, status
    });
    
    res.json({ 
      success: true,
      message: 'Booking updated successfully',
      data: booking 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    await booking.destroy();
    res.json({ 
      success: true,
      message: 'Booking deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update payment info for a booking
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method, payment_reference } = req.body;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ 
      success: false,
      message: 'Booking not found' 
    });
    await booking.update({ payment_status, payment_method, payment_reference });
    res.json({ 
      success: true,
      message: 'Payment updated successfully',
      data: booking 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get a single booking by id
exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ 
      success: false,
      message: 'Booking not found' 
    });
    res.json({
      success: true,
      data: booking
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// List all bookings
exports.listBookings = async (req, res) => {
  try {
    const { Ground, Games, Court } = require('../models');
    const bookings = await Booking.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Ground,
          as: 'ground',
          attributes: ['id', 'name']
        },
        {
          model: Games,
          as: 'game',
          attributes: ['id', 'name']
        },
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json({
      success: true,
      data: bookings
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Count bookings per ground/game
exports.countBookings = async (req, res) => {
  try {
    const { ground_id, game_id } = req.query;
    const where = {};
    if (ground_id) where.ground_id = ground_id;
    if (game_id) where.game_id = game_id;
    const count = await Booking.count({ where });
    res.json({ 
      success: true,
      data: { count } 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
}; 

// Get cash collection summary
exports.getCashCollectionSummary = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: {
        booking_type: 'cash',
        admin_cash_received_at: {
        [Op.is]: null
        }},
      order: [['booking_date', 'DESC']],
    });
    const totalAmount = bookings.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const vendorShare = totalAmount * 0.8;
    const adminShare = totalAmount * 0.2;
    res.json({
      success: true,
      totalAmount,
      vendorShare,
      adminShare,
      bookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark admin's share as received for a booking
exports.markAdminCashReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!booking.is_cash_collected) return res.status(400).json({ success: false, message: 'Cash not collected yet' });
    booking.cash_collected_by = true;
    booking.cash_collected_at = new Date();
    await booking.save();
    res.json({ success: true, message: 'Admin cash marked as received', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 

// Get online payment settlement summary (vendor 20%, admin 80%)
exports.getOnlinePaymentSettlement = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { 
          booking_type: 'online' ,
          cash_collected_by: {
            [Op.is]: null
        }},
      order: [['booking_date', 'DESC']]
    });
    const totalAmount = bookings.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const vendorShare = totalAmount * 0.8;
    const adminShare = totalAmount * 0.2;
    res.json({
      success: true,
      totalAmount,
      vendorShare,
      adminShare,
      bookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark admin's share as received for an online payment booking
exports.markOnlineSettlementReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.booking_type !== 'online') return res.status(400).json({ success: false, message: 'Not an online payment booking' });
    booking.admin_cash_received = true;
    booking.admin_cash_received_at = new Date();
    await booking.save();
    res.json({ success: true, message: 'Admin online settlement marked as received', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 
