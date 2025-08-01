const User = require('../models/User');
const Ground = require('../models/Ground');
const Court = require('../models/Court');
const Games = require('../models/Games');
const City = require('../models/City');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
   const { id } = req.query; // from ?id=2

  try {
    // Get total users (excluding vendors)
    const userCount = await User.count({
      where: {
        usertype: 'user'
      }
    });

    // Get total active vendors
    const vendorCount = await User.count({
      where: {
        usertype: 'vendor'
      }
    });

    // Get total cities count from City model
    const citiesCount = await City.count();

    const whereCondition = {
      status: 'active',
    };
    
    if (id) {
      whereCondition.vendor_id = id; // or whatever field links ground to vendor
    }
    const activeGrounds = await Ground.findAll({
      attributes: ['id'],
      where: whereCondition,
    });
    
    const groundIds = activeGrounds.map(g => g.id);
    
    // Step 2: Count courts where ground_id is in active ground IDs
    let courtsCount = 0;
    if (groundIds.length > 0) {
      courtsCount = await Court.count({
        where: {
          ground_id: groundIds,
        },
      });
    }
    // Get total games count
    const gamesCount = await Games.count();

    // Get total bookings count
    const bookingsCount = await Booking.count();

    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        vendors: vendorCount,
        cities: citiesCount,
        bookings: bookingsCount,
        grounds: activeGrounds.length,
        courts: courtsCount,
        games: gamesCount
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
}; 