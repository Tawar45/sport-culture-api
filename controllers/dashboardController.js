const User = require('../models/User');
const Ground = require('../models/Ground');
const Court = require('../models/Court');
const Games = require('../models/Games');
const City = require('../models/City');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
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

    // Get total grounds count
    const groundsCount = await Ground.count({
      where: {
        status: 'active'
      }
    });

    // Get total courts count
    const courtsCount = await Court.count();

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
        grounds: groundsCount,
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