const User = require('../models/User');
const { sequelize } = require('../models/User');

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
        usertype: 'vendor',
        status: true
      }
    });

    // Get unique cities count
    const citiesCount = await User.count({
      distinct: true,
      col: 'city',
      where: {
        city: {
          [sequelize.Op.ne]: null
        }
      }
    });

    // Get total bookings (you'll need to adjust this based on your booking model)
    // For now returning a placeholder
    const bookingsCount = 0; // TODO: Implement actual booking count

    res.status(200).json({
      users: userCount,
      vendors: vendorCount,
      cities: citiesCount,
      bookings: bookingsCount
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