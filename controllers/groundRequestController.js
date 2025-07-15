const GroundRequest = require('../models/GroundRequest');
const Joi = require('joi');

// Validation schema for ground request
const groundRequestSchema = Joi.object({
  user_id: Joi.number().required().messages({
    'number.base': 'User ID is required',
    'any.required': 'User ID is required'
  }),
  user_name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'User name is required',
    'string.min': 'User name must be at least 2 characters',
    'string.max': 'User name cannot exceed 100 characters'
  }),
  user_email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  user_phone: Joi.string().pattern(/^[0-9]{10,15}$/).allow(null, '').messages({
    'string.pattern.base': 'Phone number must be between 10 and 15 digits'
  }),
  ground_name: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Ground name is required',
    'string.min': 'Ground name must be at least 3 characters',
    'string.max': 'Ground name cannot exceed 100 characters'
  }),
  ground_address: Joi.string().min(5).max(200).required().messages({
    'string.empty': 'Ground address is required',
    'string.min': 'Ground address must be at least 5 characters',
    'string.max': 'Ground address cannot exceed 200 characters'
  }),
  ground_city: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'City is required',
    'string.min': 'City must be at least 2 characters',
    'string.max': 'City cannot exceed 50 characters'
  }),
  game_type: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Game type is required',
    'string.min': 'Game type must be at least 2 characters',
    'string.max': 'Game type cannot exceed 50 characters'
  }),
  description: Joi.string().max(1000).allow(null, '').messages({
    'string.max': 'Description cannot exceed 1000 characters'
  })
});

// Get all ground requests
exports.list = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const offset = (page - 1) * limit;
    
    const groundRequests = await GroundRequest.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      message: 'Ground requests fetched successfully',
      data: {
        requests: groundRequests.rows,
        total: groundRequests.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(groundRequests.count / limit),
        hasNext: parseInt(page) < Math.ceil(groundRequests.count / limit),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching ground requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ground requests',
      error: error.message
    });
  }
};

// Get single ground request
exports.getGroundRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const groundRequest = await GroundRequest.findByPk(id);
    if (!groundRequest) {
      return res.status(404).json({
        success: false,
        message: 'Ground request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ground request fetched successfully',
      data: groundRequest
    });
  } catch (error) {
    console.error('Error fetching ground request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ground request',
      error: error.message
    });
  }
};

// Add new ground request
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

    // Create new ground request
    const newGroundRequest = await GroundRequest.create(value);

    res.status(201).json({
      success: true,
      message: 'Ground request submitted successfully',
      data: newGroundRequest
    });
  } catch (error) {
    console.error('Error adding ground request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit ground request',
      error: error.message
    });
  }
};

// Update ground request status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    const adminId = req.user.id; // From auth middleware

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    // Find ground request
    const groundRequest = await GroundRequest.findByPk(id);
    if (!groundRequest) {
      return res.status(404).json({
        success: false,
        message: 'Ground request not found'
      });
    }

    // Update status and admin info
    await groundRequest.update({
      status,
      admin_notes,
      processed_date: new Date(),
      processed_by: adminId
    });

    res.status(200).json({
      success: true,
      message: `Ground request ${status} successfully`,
      data: groundRequest
    });
  } catch (error) {
    console.error('Error updating ground request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ground request status',
      error: error.message
    });
  }
};

// Delete ground request
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    const groundRequest = await GroundRequest.findByPk(id);
    if (!groundRequest) {
      return res.status(404).json({
        success: false,
        message: 'Ground request not found'
      });
    }

    await groundRequest.destroy();

    res.status(200).json({
      success: true,
      message: 'Ground request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ground request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ground request',
      error: error.message
    });
  }
};

// Get ground request statistics
exports.getStats = async (req, res) => {
  try {
    const total = await GroundRequest.count();
    const pending = await GroundRequest.count({ where: { status: 'pending' } });
    const approved = await GroundRequest.count({ where: { status: 'approved' } });
    const rejected = await GroundRequest.count({ where: { status: 'rejected' } });

    res.status(200).json({
      success: true,
      message: 'Ground request statistics fetched successfully',
      data: {
        total,
        pending,
        approved,
        rejected
      }
    });
  } catch (error) {
    console.error('Error fetching ground request statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ground request statistics',
      error: error.message
    });
  }
};



