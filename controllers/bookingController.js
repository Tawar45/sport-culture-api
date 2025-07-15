const Booking = require('../models/Booking');

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