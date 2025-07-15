const User = require('../models/User'); // Adjust path as needed
const userSchema = require('../models/userSchema');
const path = require('path');
const fs = require('fs');

exports.list = async (req, res) => {
  const { usertype } = req.params;
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'phone_number', 'usertype'], // only return necessary fields
      order: [['id', 'ASC']],   // optional: sort by user name
      where: {
        usertype: usertype
      }
    });

    res.status(200).json({
      message: 'User list fetched successfully',
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Toggle the status
    const newStatus = !user.status;
    await user.update({ status: newStatus });

    res.status(200).json({
      success: true,
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        status: newStatus
      }
    });

  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error.message
    });
  }
};
exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = userSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(err => err.message)
      });
    }

    // Destructure validated values 
    const { username, email, phone_number, usertype, profile_image } = value;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate name
    const duplicate = await User.findOne({
      where: {
        username,
        id: { [require('sequelize').Op.ne]: id },
      },
    });

    if (duplicate) {
      // If file was uploaded, delete it since we're not going to use it
      if (req.file) {
        const uploadedFilePath = path.join(process.cwd(), 'public', `/uploads/users/${req.file.filename}`);
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'User name already exists'
      });
    }
    // Handle image update
    let imagePath = user.profile_image;
    if (req.file) {
      // Delete old image if it exists
      if (user.profile_image) {
        const oldImagePath = path.join(process.cwd(), 'public/uploads/users', user.profile_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagePath = `/uploads/users/${req.file.filename}`;
    }
    // Update user with all fields
    user.username = username;
    user.email = email;
    user.phone_number = phone_number;
    user.usertype = usertype;
    user.profile_image = imagePath;
    await user.save();

    // Return response
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user.id,
        name: user.name,
        address: user.address,
        city: user.city,
        game: user.game,
        price: user.price,
        status: user.status,
        image: user.profile_image,
        imageUrl: `${req.protocol}://${req.get('host')}${user.profile_image}`
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'phone_number', 'usertype', 'profile_image', 'status']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        usertype: user.usertype,
        profile_image: `${req.protocol}://${req.get('host')}${user.profile_image}`,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

      await user.destroy();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

