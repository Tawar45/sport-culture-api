const GroundRequest = require('../models/GroundRequest'); // Adjust path as needed
const Joi = require('joi');
const Ground = require('../models/Ground');
const { Op } = require('sequelize');
    

// Validation schema
const groundRequestSchema = Joi.object({
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
  mobile: Joi.string().min(2).max(50).required().trim()
    .messages({
      'string.empty': 'Mobile is required'
    }),
  groundId: Joi.string().min(1).max(50).required().trim()
    .messages({
      'string.empty': 'Ground ID is required'
    }),
  gamesType: Joi.string().min(1).max(50).required().trim()
    .messages({
      'string.empty': 'Games type is required'
    }),
    
  status: Joi.string().valid('pending', 'approved', 'rejected').required()
    .messages({
      'string.empty': 'Status is required',
      'any.only': 'Status must be one of: pending, approved, rejected',
      'any.required': 'Status is required'
    }),
});

exports.add = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = groundRequestSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(err => err.message)
      });
    }

    // Destructure validated values
    const { name, address, city, mobile, groundId, status,gamesType } = value;
    // // Check if ground ID exists
    // Check for existing ground request
    const existingGroundRequest = await GroundRequest.findOne({ 
      where: { name: name }
    });
    
    if (existingGroundRequest) {
      return res.status(400).json({
        success: false,
        message: 'Ground request already exists'
      });
    }

    // Create new ground request with all fields
    const newGroundRequest = await GroundRequest.create({
      name,
      address,
      city,
      mobile,
      groundId,
      status,
      gamesType
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Ground request added successfully',
      data: {
        id: newGroundRequest.id,
        name: newGroundRequest.name,
        address: newGroundRequest.address,
        city: newGroundRequest.city,
        mobile: newGroundRequest.mobile,
        groundId: newGroundRequest.groundId,
        gamesType:newGroundRequest.gamesType,
        status: newGroundRequest.status,
        createdAt: newGroundRequest.createdAt
      }
    });

  } catch (error) {
    console.error('Error adding ground request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add ground request',
      error: error.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    const groundRequests = await GroundRequest.findAll({
      attributes: ['id', 'name', 'address', 'city', 'mobile', 'groundId', 'status'],
      order: [['id', 'ASC']],
    });
    const gamesType = groundRequests.map(groundRequest => groundRequest.gamesType);

    console.log(gamesType);
    
    // const gamesTypeArray = gamesType.split(',').map(game => game.trim());
    // console.log(gamesTypeArray);
    // console.log(gamesType); 
    
    const grounds = await Ground.findAll({
      where: {
          game: {
              [Op.in]: gamesTypeArray
          }
      }
  });

    // Map ground requests to include full image URLs
    const groundRequestsWithUrls = groundRequests.map(groundRequest => ({
      id: groundRequest.id,
      name: groundRequest.name,
      address: groundRequest.address,
      city: groundRequest.city,
      mobile: groundRequest.mobile,
      groundId: groundRequest.groundId,
      gamesType:gamesTypeArray,
      status: groundRequest.status,
      createdAt: groundRequest.createdAt
    }));

    res.status(200).json({
      success: true,
      message: 'Ground request list fetched successfully',
      groundRequests: groundRequestsWithUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ground request list',
      error: error.message,
    });
  }
};



