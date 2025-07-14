const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Ground = require('../models/Ground');
const Games = require('../models/Games');
// const ExcelJS = require('exceljs');

// Create a new booking with validations
exports.createBooking = async (req, res) => {
  try {
    const {
      user_id, ground_id, court_id, game_id, booking_date, slot, booking_type,
      payment_status, payment_method, payment_reference, amount, status,
      user_type, username, email, phone, vendor_id // Add new fields
    } = req.body;

    // Validation 1: Check if court belongs to the selected ground
    const court = await Court.findOne({
      where: {
        id: court_id,
        ground_id: ground_id
      }
    });

    if (!court) {
      return res.status(400).json({
        success: false,
        message: 'Court does not belong to the selected ground'
      });
    }

    // Validation 2: Check if slots are already booked for this court and date
    const existingBookings = await Booking.findAll({
      where: {
        court_id: court_id,
        booking_date: booking_date,
        status: {
          [require('sequelize').Op.notIn]: ['cancelled']
        }
      }
    });

    // Parse slots from the request
    const requestedSlots = slot.split(',').map(s => s.trim());
    
    // Check for slot conflicts
    const conflictingSlots = [];
    existingBookings.forEach(booking => {
      const bookedSlots = booking.slot.split(',').map(s => s.trim());
      bookedSlots.forEach(bookedSlot => {
        if (requestedSlots.includes(bookedSlot)) {
          conflictingSlots.push(bookedSlot);
        }
      });
    });

    if (conflictingSlots.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The following slots are already booked: ${conflictingSlots.join(', ')}`,
        conflictingSlots
      });
    }

    // Validation 3: Check if user is trying to book the same slot multiple times
    const duplicateSlots = requestedSlots.filter((slot, index) => 
      requestedSlots.indexOf(slot) !== index
    );

    if (duplicateSlots.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Duplicate slots detected: ${duplicateSlots.join(', ')}`
      });
    }

    // Create booking with additional fields
    const bookingData = {
      user_id: user_type === 'guest' ? null : user_id, // null for guest users
      vendor_id: vendor_id || null, // Add vendor_id
      ground_id,
      court_id,
      game_id,
      booking_date,
      slot,
      booking_type,
      payment_status,
      payment_method,
      payment_reference,
      amount,
      status,
      // Add guest user details if applicable
      ...(user_type === 'guest' && {
        guest_name: username,
        guest_email: email,
        guest_phone: phone
      })
    };

    const booking = await Booking.create(bookingData);

    res.status(201).json({ 
      success: true,
      message: 'Booking created successfully',
      data: booking 
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update a booking with validations
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id, ground_id, court_id, game_id, booking_date, slot, booking_type,
      payment_status, payment_method, payment_reference, amount, status,
      user_type, username, email, phone, vendor_id // Add new fields
    } = req.body;
    
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Validation 1: Check if court belongs to the selected ground
    const court = await Court.findOne({
      where: {
        id: court_id,
        ground_id: ground_id
      }
    });

    if (!court) {
      return res.status(400).json({
        success: false,
        message: 'Court does not belong to the selected ground'
      });
    }

    // Validation 2: Check for slot conflicts (excluding current booking)
    const requestedSlots = slot.split(',').map(s => s.trim());
    
    const existingBookings = await Booking.findAll({
      where: {
        court_id: court_id,
        booking_date: booking_date,
        id: {
          [require('sequelize').Op.ne]: id
        },
        status: {
          [require('sequelize').Op.notIn]: ['cancelled']
        }
      }
    });

    const conflictingSlots = [];
    existingBookings.forEach(existingBooking => {
      const bookedSlots = existingBooking.slot.split(',').map(s => s.trim());
      bookedSlots.forEach(bookedSlot => {
        if (requestedSlots.includes(bookedSlot)) {
          conflictingSlots.push(bookedSlot);
        }
      });
    });

    if (conflictingSlots.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The following slots are already booked: ${conflictingSlots.join(', ')}`,
        conflictingSlots
      });
    }

    // Validation 3: Check for duplicate slots in the same booking
    const duplicateSlots = requestedSlots.filter((slot, index) => 
      requestedSlots.indexOf(slot) !== index
    );

    if (duplicateSlots.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Duplicate slots detected: ${duplicateSlots.join(', ')}`
      });
    }

    // Update booking with new fields
    const updateData = {
      user_id: user_type === 'guest' ? null : user_id,
      vendor_id: vendor_id || null,
      ground_id, court_id, game_id, booking_date, slot, booking_type,
      payment_status, payment_method, payment_reference, amount, status,
      // Update guest user details if applicable
      ...(user_type === 'guest' && {
        guest_name: username,
        guest_email: email,
        guest_phone: phone
      })
    };
    
    await booking.update(updateData);
    
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
    const bookings = await Booking.findAll({
      include: [
        {
          model: Ground,
          as: 'ground',
          attributes: ['id', 'name', 'address', 'city', 'games']
        },
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name', 'games_id']
        },
        {
          model: Games,
          as: 'game',
          attributes: ['id', 'name', 'image']
        }
      ],
      order: [['id', 'DESC']]
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

// Get cash collection summary (confirmed bookings)
exports.getCashCollectionSummary = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { status: 'confirmed' , booking_type:'cash'},
    });
    const totalAmount = bookings.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const vendorShare = totalAmount * 0.8;
    const adminShare = totalAmount * 0.2;
    res.json({
      success: true,
      bookings,
      totalAmount,
      vendorShare,
      adminShare
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark a booking as cash received by admin
exports.markCashReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.is_cash_collected = true;
    booking.cash_collected_by = 'admin';
    booking.cash_collected_at = new Date();
    await booking.save();
    res.json({ success: true, message: 'Cash marked as received by admin', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getOnlinePayemnt = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { status: 'confirmed', booking_type:'online'},
    });
    const totalAmount = bookings.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const vendorShare = totalAmount * 0.8;
    const adminShare = totalAmount * 0.2;
    res.json({
      success: true,
      bookings,
      totalAmount,
      vendorShare,
      adminShare
    });
  } catch (err) {
    console.log("checking error");
    res.status(500).json({ success: false, message: "demo by user taht" });
  }
};

// Mark a booking as cash received by admin
exports.markSettlementReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.is_cash_collected = true;
    booking.cash_collected_by = 'vendor';
    booking.cash_collected_at = new Date();
    await booking.save();
    res.json({ success: true, message: 'Settlement marked as received by vendor', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// exports.downloadBookingReport = async (req, res) => {
//   try {
//     const bookings = await Booking.findAll({ include: [/* add associations if needed */] });
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Bookings');
//     worksheet.columns = [
//       { header: 'ID', key: 'id', width: 10 },
//       { header: 'User ID', key: 'user_id', width: 10 },
//       { header: 'Ground ID', key: 'ground_id', width: 10 },
//       { header: 'Court ID', key: 'court_id', width: 10 },
//       { header: 'Game ID', key: 'game_id', width: 10 },
//       { header: 'Date', key: 'booking_date', width: 15 },
//       { header: 'Slot', key: 'slot', width: 20 },
//       { header: 'Amount', key: 'amount', width: 10 },
//       { header: 'Status', key: 'status', width: 15 },
//       // Add more fields as needed
//     ];
//     bookings.forEach(b => worksheet.addRow(b.dataValues));
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename=bookings.xlsx');
//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };