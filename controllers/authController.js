const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { generateHash } = require('../utils/hash');
const Joi = require('joi');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const upload = require('../config/multerConfig');


exports.register = async (req, res) => {
  try {
    // Validation schema without profile_image requirement
    const schema = Joi.object({
      username: Joi.string()
        .min(3)
        .max(255)
        .required()
        .messages({
          'string.min': 'Username must be at least 3 characters long',
          'string.max': 'Username cannot exceed 255 characters',
          'any.required': 'Username is required'
        }),
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .min(6)
        .required()
        .messages({
          'string.min': 'Password must be at least 6 characters long',
          'any.required': 'Password is required'
        }),
      phone_number: Joi.string()
        .pattern(/^[0-9]{10,15}$/)
        .allow(null, '')
        .messages({
          'string.pattern.base': 'Phone number must be between 10 and 15 digits'
        }),
      usertype: Joi.string()
        .valid('user', 'vendor', 'admin')
        .default('user')
    });

    // Validate request body
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Destructure validated data
    const { username, email, password, phone_number, usertype } = value;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email.toLowerCase() 
          ? "Email already registered" 
          : "Username already taken"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone_number: phone_number || null,
      usertype: usertype || 'user'
    });

    // Remove sensitive data from response
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone_number: newUser.phone_number,
      usertype: newUser.usertype
    };

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    if (user.status === false) {
      return res.status(400).json({ message: 'User is not active' });
    } else if(user.usertype === 'user'){
      return res.status(400).json({ message: 'User cannot login' });
    } else {
    const token = generateToken({ 
      id: user.id, 
      email: user.email,
      username: user.username,
      usertype: user.usertype
    });
    res.json({ message: 'Login successfully', token, 
      user: {
      email: user.email,
      username: user.username,
      usertype: user.usertype,
      status: user.status,
      id: user.id,
      phone_number: user.phone_number,
      profile_image: user.profile_image ? `${req.protocol}://${req.get('host')}${user.profile_image}`: '',
      }, 
     });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    if (user.status === false) {
      return res.status(400).json({ message: 'User is not active' });
    } else {
    const token = generateToken({ 
      id: user.id, 
      email: user.email,
      username: user.username,
      usertype: user.usertype
    });
    res.json({ message: 'Login successfully', token, 
      user: {
      email: user.email,
      username: user.username,
      usertype: user.usertype,
      status: user.status,
      id: user.id,
      phone_number: user.phone_number,
      profile_image: user.profile_image ? `${req.protocol}://${req.get('host')}${user.profile_image}`: '',
      }, 
     });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Function to generate hash password from plain password
exports.generateHashPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    const hash = await generateHash(password);
    res.json({ hash });
  } catch (error) {
    res.status(500).json({ message: 'Error generating hash', error: error.message });
  }
};

// Change password functionality
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validation schema
    const schema = Joi.object({
      currentPassword: Joi.string().required().messages({
        'string.empty': 'Current password is required',
        'any.required': 'Current password is required'
      }),
      newPassword: Joi.string().min(6).required().messages({
        'string.empty': 'New password is required',
        'string.min': 'New password must be at least 6 characters long',
        'any.required': 'New password is required'
      })
    });

    // Validate request body
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is same as current password
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await user.update({ password: hashedNewPassword });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user profile (for token validation)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user profile data (excluding sensitive information)
    const userProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number,
      usertype: user.usertype,
      status: user.status,
      profile_image: user.profile_image ? `${req.protocol}://${req.get('host')}${user.profile_image}` : '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      user: userProfile
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 