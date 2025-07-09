const Ground = require('../models/Ground'); // Adjust path as needed
const upload = require('../config/multerConfig');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');

// Validation schema
const groundSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().trim()
    .messages({
      'string.empty': 'Ground name is required',
      'string.min': 'Ground name must be at least 3 characters',
      'string.max': 'Ground name cannot exceed 100 characters'
    }),
  address: Joi.string().min(5).max(200).required().trim()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 5 characters'
    }),
  city: Joi.string().min(2).max(50).required().trim()
    .messages({
      'string.empty': 'City is required'
    }),
  game: Joi.string().min(2).max(50).required().trim()
    .messages({
      'string.empty': 'Game is required'
    }),
  price: Joi.string().pattern(/^\d+(\.\d{1,2})?$/).required()
    .messages({
      'string.empty': 'Price is required',
      'string.pattern.base': 'Price must be a valid number'
    }),
  status: Joi.string().valid('active', 'inactive', 'maintenance').required()
    .messages({
      'string.empty': 'Status is required',
      'any.only': 'Status must be active, inactive, or maintenance'
    }),
  description: Joi.string().min(10).max(1000).required().trim()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters'
    }),
  openTime: Joi.string().required()
    .messages({
      'string.empty': 'Opening time is required',
    }),
  vendor_id: Joi.number().required()
    .messages({
      'number.base': 'Vendor ID is required',
    }),
  closeTime: Joi.string().required()
    .messages({
      'string.empty': 'Closing time is required',
    })
});

exports.add = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = groundSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(err => err.message)
      });
    }

    // Destructure validated values
    const { name, address, city, game, price, status, description, openTime, closeTime, vendor_id } = value;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Ground image is required'
      });
    }

    // Get the image path
    const imagePath = `/uploads/ground/${req.file.filename}`;

    // Check for existing ground
    const existingGround = await Ground.findOne({ 
      where: { name: name }
    });

    if (existingGround) {
      // Delete uploaded file if ground already exists
      const uploadedFilePath = path.join(process.cwd(), 'public', imagePath);
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(400).json({
        success: false,
        message: 'Ground already exists'
      });
    }

    // Create new ground with all fields
    const newGround = await Ground.create({
      name,
      address,
      city,
      game,
      price,
      status,
      description,
      openTime,
      closeTime,
      image: imagePath,
      vendor_id
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Ground added successfully',
      data: {
        id: newGround.id,
        name: newGround.name,
        address: newGround.address,
        city: newGround.city,
        game: newGround.game,
        price: newGround.price,
        status: newGround.status,
        description: newGround.description,
        openTime: newGround.openTime,
        closeTime: newGround.closeTime,
        image: newGround.image,
        imageUrl: `${req.protocol}://${req.get('host')}${newGround.image}`,
        vendor_id: newGround.vendor_id,
        createdAt: newGround.createdAt
      }
    });

  } catch (error) {
    console.error('Error adding ground:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add ground',
      error: error.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    const { id } = req.params;
    const grounds = await Ground.findAll({
      attributes: ['id', 'name', 'address', 'city', 'game', 'price', 'status', 'description', 'openTime', 'closeTime', 'image'],
      order: [['id', 'ASC']],
      where: id ? { vendor_id: id } : {}
    });

    // Map grounds to include full image URLs
    const groundsWithUrls = grounds.map(ground => ({
      id: ground.id,
      name: ground.name,
      address: ground.address,
      city: ground.city,
      game: ground.game,
      price: ground.price,
      status: ground.status,
      description: ground.description,
      openTime: ground.openTime,
      closeTime: ground.closeTime,
      image: ground.image,
      imageUrl: `${req.protocol}://${req.get('host')}${ground.image}`,
      vendor_id: ground.vendor_id
    }));

    res.status(200).json({
      success: true,
      message: 'Ground list fetched successfully',
      grounds: groundsWithUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grounds',
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = groundSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(err => err.message)
      });
    }

    // Destructure validated values
    const { name, address, city, game, price, status, description, openTime, closeTime, vendor_id } = value;

    // Find ground
    const ground = await Ground.findByPk(id);
    if (!ground) {
      return res.status(404).json({
        success: false,
        message: 'Ground not found'
      });
    }

    // Check for duplicate name
    const duplicate = await Ground.findOne({
      where: {
        name,
        id: { [require('sequelize').Op.ne]: id },
      },
    });

    if (duplicate) {
      // If file was uploaded, delete it since we're not going to use it
      if (req.file) {
        const uploadedFilePath = path.join(process.cwd(), 'public', `/uploads/ground/${req.file.filename}`);
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      }
      return res.status(400).json({
        success: false,
        message: 'Ground name already exists'
      });
    }

    // Handle image update
    let imagePath = ground.image;
    if (req.file) {
      // Delete old image
      const oldImagePath = path.join(process.cwd(), 'public', ground.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      imagePath = `/uploads/ground/${req.file.filename}`;
    }
    // Update ground with all fields
    ground.name = name;
    ground.address = address;
    ground.city = city;
    ground.game = game;
    ground.price = price;
    ground.status = status;
    ground.description = description;
    ground.openTime = openTime;
    ground.closeTime = closeTime;
    ground.image = imagePath;
    ground.vendor_id = vendor_id;
    await ground.save();

    // Return response
    return res.status(200).json({
      success: true,
      message: 'Ground updated successfully',
      data: {
        id: ground.id,
        name: ground.name,
        address: ground.address,
        city: ground.city,
        game: ground.game,
        price: ground.price,
        status: ground.status,
        description: ground.description,
        openTime: ground.openTime,
        closeTime: ground.closeTime,
        image: ground.image,
        imageUrl: `${req.protocol}://${req.get('host')}${ground.image}`,
        vendor_id: ground.vendor_id
      }
    });

  } catch (error) {
    console.error('Error updating ground:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update ground',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find ground
    const ground = await Ground.findByPk(id);
    if (!ground) {
      return res.status(404).json({
        success: false,
        message: 'Ground not found'
      });
    }

    // Remove image file if it exists
    if (ground.image) {
      const imagePath = path.join(process.cwd(), 'public', ground.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log('Image deleted successfully:', imagePath);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    // Delete ground record from database
    await ground.destroy();

    return res.status(200).json({
      success: true,
      message: 'Ground and image deleted successfully'
    });

  } catch (error) {
    console.error('Error in remove:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete ground',
      error: error.message
    });
  }
};

