const { Ground, Court, CourtSlot } = require('../models'); // Add CourtSlot to imports
const upload = require('../config/multerConfig');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');
const { Op, Sequelize } = require('sequelize'); // Add Sequelize import for literal queries
const Games = require('../models/Games');
const Amenities = require('../models/Amenities');
const sequelize = require('../database/db');

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
  games: Joi.array().items(Joi.number().integer()).min(1).required()
    .messages({
        'any.required': 'Games selection is required'
    }),
  amenities: Joi.array().items(Joi.number().integer()).min(1).required()
    .messages({
        'any.required': 'Amenities selection is required'
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
    }),
  price: Joi.number().min(0).required()
    .messages({
      'number.base': 'Price is required',
      'number.min': 'Price must be at least 0'
    }),
  rules_and_guidelines: Joi.string().min(10).max(1000).required().trim()
    .messages({
      'string.empty': 'Rules and guidelines are required',
      'string.min': 'Rules and guidelines must be at least 10 characters'
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
    const { name, address, city, games, amenities, status, description, openTime, closeTime, vendor_id, price, rules_and_guidelines } = value;

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one ground image is required'
      });
    }

    // Get the image paths for multiple images
    const imagePaths = req.files.map(file => `/uploads/ground/${file.filename}`);
    const mainImagePath = imagePaths[0]; // First image as main image

    // Check for existing ground
    const existingGround = await Ground.findOne({ 
      where: { name: name }
    });

    if (existingGround) {
      // Delete uploaded files if ground already exists
      req.files.forEach(file => {
        const uploadedFilePath = path.join(process.cwd(), 'public', `/uploads/ground/${file.filename}`);
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      });
      return res.status(400).json({
        success: false,
        message: 'Ground already exists'
      });
    }

    // Validate games array
    if (!games || !Array.isArray(games) || games.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one game must be selected'
      });
    }

    // Create new ground with all fields including multiple images and games
    const newGround = await Ground.create({
      name,
      address,
      city,
      games_ids: games, // Store multiple games
      amenities_ids: amenities, // Store multiple amenities
      status,
      description,
      openTime,
      closeTime,
      image: mainImagePath, // Keep main image for backward compatibility
      images: imagePaths, // Store all image paths
      vendor_id,
      price,
      rules_and_guidelines
    });

    // Return success response with all images and games
    return res.status(201).json({
      success: true,
      message: 'Ground added successfully',
      data: {
        id: newGround.id,
        name: newGround.name,
        address: newGround.address,
        city: newGround.city,
        games_ids: newGround.games_ids, // Multiple games
        amenities_ids: newGround.amenities_ids, // Multiple amenities
        status: newGround.status,
        description: newGround.description,
        openTime: newGround.openTime,
        closeTime: newGround.closeTime,
        image: newGround.image,
        imageUrl: `${req.protocol}://${req.get('host')}${newGround.image}`,
        images: newGround.images,
        imageUrls: newGround.images.map(img => `${req.protocol}://${req.get('host')}${img}`),
        vendor_id: newGround.vendor_id,
        price: newGround.price, // Include price in response
        rules_and_guidelines: newGround.rules_and_guidelines, // Include rules and guidelines
        createdAt: newGround.createdAt
      }
    });

  } catch (error) {
    console.log(error,'checking');
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
    const { games } = req.query; // Get games filter from query parameters

    // Build where clause
    let whereClause = id ? { vendor_id: id } : {};
    
    // If games filter is provided, add it to the where clause
    if (games) {
      const gameIds = games.split(',').map(id => parseInt(id.trim()));      
      // Use JSON_CONTAINS for MySQL JSON array filtering
      whereClause = {
        ...whereClause,
        [Op.or]: gameIds.map(gameId => 
          sequelize.literal(`JSON_CONTAINS(games_ids, '${gameId}')`)
        )
      };
    }
  
    const grounds = await Ground.findAll({
      attributes: ['id', 'name', 'address', 'city', 'games_ids', 'amenities_ids', 'status', 'description', 'openTime', 'closeTime', 'image', 'images', 'price', 'rules_and_guidelines'],
      order: [['id', 'ASC']],
      where: whereClause
    });
     
    const groundsWithUrls = await Promise.all(grounds.map(async ground => {
      // Safely parse images array
      let imagesArray = [];
      try {
        if (ground.images) {
          // If it's a string, parse it as JSON
          if (typeof ground.images === 'string') {
            imagesArray = JSON.parse(ground.images);
          } else if (Array.isArray(ground.images)) {
            imagesArray = ground.images;
          }
        }
      } catch (error) {
        console.error('Error parsing images for ground:', ground.id, error);
        imagesArray = [];
      }

      // Parse games_ids array
      let gamesArray = [];
      try {
        if (ground.games_ids) {
          if (typeof ground.games_ids === 'string') {
            gamesArray = JSON.parse(ground.games_ids);
          } else if (Array.isArray(ground.games_ids)) {
            gamesArray = ground.games_ids;
          }
        }
      } catch (error) {
        gamesArray = [];
      }

      // Parse amenities_ids array
      let amenitiesArray = [];
      try {
        if (ground.amenities_ids) {
          if (typeof ground.amenities_ids === 'string') {
            amenitiesArray = JSON.parse(ground.amenities_ids);
          } else if (Array.isArray(ground.amenities_ids)) {
            amenitiesArray = ground.amenities_ids;
          }
        }
      } catch (error) {
        amenitiesArray = [];
      }

      // Fetch games data for these IDs
      let gamesData = [];
      if (gamesArray.length > 0) {
        gamesData = await Games.findAll({
          where: { id: { [Op.in]: gamesArray } },
          attributes: ['id', 'name', 'image','description']
        });
      }

      // Fetch amenities data for these IDs
      let amenitiesData = [];
      if (amenitiesArray.length > 0) {
        // Assuming Amenities model has an 'id' and 'name' field
        amenitiesData = await Amenities.findAll({
          where: { id: { [Op.in]: amenitiesArray } },
          attributes: ['id', 'name']
        });
      }
  
      return {
        id: ground.id,
        name: ground.name,
        address: ground.address,
        city: ground.city,
        games: gamesArray, // Multiple games
        amenities: amenitiesData, // Multiple amenities
        gameNames: gamesData, // Array of game names
        amenityNames: amenitiesData, // Array of amenity names
        status: ground.status,
        description: ground.description,
        openTime: ground.openTime,
        closeTime: ground.closeTime,
        image: ground.image,
        imageUrl: ground.image ? `${req.protocol}://${req.get('host')}${ground.image}` : null,
        images: imagesArray,
        imageUrls: imagesArray.map(img => `${req.protocol}://${req.get('host')}${img}`),
        vendor_id: ground.vendor_id,
        price: ground.price, // Include price in response
        rules_and_guidelines: ground.rules_and_guidelines, // Include rules and guidelines
      };
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

exports.getGround = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ground = await Ground.findByPk(id);
    
    if (!ground) {
      return res.status(404).json({
        success: false,
        message: 'Ground not found'
      });
    }

    // Get all games for reference
    // Safely parse images array
    let imagesArray = [];
    try {
      if (ground.images) {
        // If it's a string, parse it as JSON
        if (typeof ground.images === 'string') {
          imagesArray = JSON.parse(ground.images);
        } else if (Array.isArray(ground.images)) {
          imagesArray = ground.images;
        }
      }
    } catch (error) {
      console.error('Error parsing images for ground:', ground.id, error);
      imagesArray = [];
    }

    let gamesArray = [];
    try {
      if (ground.games_ids) {
        if (typeof ground.games_ids === 'string') {
          gamesArray = JSON.parse(ground.games_ids);
        } else if (Array.isArray(ground.games_ids)) {
          gamesArray = ground.games_ids;
        }
      }
    } catch (error) {
      gamesArray = [];
    }

    // Parse amenities_ids array
    let amenitiesArray = [];
    try {
      if (ground.amenities_ids) {
        if (typeof ground.amenities_ids === 'string') {
          amenitiesArray = JSON.parse(ground.amenities_ids);
        } else if (Array.isArray(ground.amenities_ids)) {
          amenitiesArray = ground.amenities_ids;
        }
      }
    } catch (error) {
      amenitiesArray = [];
    }

    // Fetch games data for these IDs
    let gamesData = [];
    if (gamesArray.length > 0) {
      gamesData = await Games.findAll({
        where: { id: { [Op.in]: gamesArray } },
        attributes: ['id', 'name', 'image','description']
      });
      gamesData = gamesData.map(game => ({
        ...game.toJSON(),
        imageUrl: game.image ? `${req.protocol}://${req.get('host')}${game.image}` : null
      }));
    }

    // Fetch amenities data for these IDs
    let amenitiesData = [];
    if (amenitiesArray.length > 0) {
      // Assuming Amenities model has an 'id' and 'name' field
      amenitiesData = await Amenities.findAll({
        where: { id: { [Op.in]: amenitiesArray } },
        attributes: ['id', 'name']
      });
    }

    // Include full image URLs for all images and game data
    const groundWithUrl = {
      id: ground.id,
      name: ground.name,
      address: ground.address,
      city: ground.city,
      games: gamesArray, // Multiple games
      amenities: amenitiesArray, // Multiple amenities
      gameNames: gamesData, // Array of game names
      amenityNames: amenitiesData, // Array of amenity names
      status: ground.status,
      description: ground.description,
      openTime: ground.openTime,
      closeTime: ground.closeTime,
      image: ground.image,
      imageUrl: ground.image ? `${req.protocol}://${req.get('host')}${ground.image}` : null,
      images: imagesArray,
      imageUrls: imagesArray.map(img => `${req.protocol}://${req.get('host')}${img}`),
      vendor_id: ground.vendor_id,
      price: ground.price, // Include price in response
      createdAt: ground.createdAt,
      updatedAt: ground.updatedAt,
      rules_and_guidelines: ground.rules_and_guidelines, // Include rules and guidelines
    };

    res.status(200).json({
      success: true,
      message: 'Ground fetched successfully',
      ground: groundWithUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ground',
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Parse games array if it's sent as JSON string
    if (req.body.games && typeof req.body.games === 'string') {
      try {
        req.body.games = JSON.parse(req.body.games);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid games array format'
        });
      }
    }

    // Parse amenities array if it's sent as JSON string
    if (req.body.amenities && typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid amenities array format'
        });
      }
    }

    // Validate request body
    const { error, value } = groundSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(err => err.message)
      });
    }

    // Destructure validated values (removed game field)
    const { name, address, city, games, amenities, status, description, openTime, closeTime, vendor_id, price, rules_and_guidelines } = value;

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

    // Validate games array
    if (!games || !Array.isArray(games) || games.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one game must be selected'
      });
    }

    // Validate amenities array
    if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one amenity must be selected'
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
    
    // Update ground with games array
    ground.name = name;
    ground.address = address;
    ground.city = city;
    ground.games_ids = games; // Update multiple games
    ground.amenities_ids = amenities; // Update multiple amenities
    ground.status = status;
    ground.description = description;
    ground.openTime = openTime;
    ground.closeTime = closeTime;
    ground.image = imagePath;
    ground.vendor_id = vendor_id;
    ground.price = price; // Update price
    ground.rules_and_guidelines = rules_and_guidelines; // Update rules and guidelines
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
        games: ground.games_ids, // Multiple games
        amenities: ground.amenities_ids, // Multiple amenities
        status: ground.status,
        description: ground.description,
        openTime: ground.openTime,
        closeTime: ground.closeTime,
        image: ground.image,
        imageUrl: `${req.protocol}://${req.get('host')}${ground.image}`,
        vendor_id: ground.vendor_id,
        price: ground.price, // Include price in response
        rules_and_guidelines: ground.rules_and_guidelines, // Include rules and guidelines
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

exports.getGroundGames = async (req, res) => {
  const { id } = req.params;
  console.log(id, 'ground');
  
  try {
    // Get the ground with its games IDs
    const ground = await Ground.findByPk(id);
    
    if (!ground) {
      return res.status(404).json({ message: 'Ground not found' });
    }
    
    // Get the games IDs from the ground and ensure it's an array
    let gameIds = [];
    try {
      if (ground.games_ids) {
        // If it's a string, parse it as JSON
        if (typeof ground.games_ids === 'string') {
          gameIds = JSON.parse(ground.games_ids);
        } else if (Array.isArray(ground.games_ids)) {
          gameIds = ground.games_ids;
        } else {
          gameIds = [];
        }
      }
    } catch (error) {
      console.error('Error parsing games for ground:', groundId, error);
      gameIds = [];
    }
    
    console.log(gameIds, 'game IDs from ground');
    
    // Count how many game IDs there are
    const gameCount = gameIds.length;
    
    // Get the actual game details if there are game IDs
    let games = [];
    if (gameCount > 0) {
      games = await Games.findAll({
        where: {
          id: {
            [Op.in]: gameIds
          }
        },
        attributes: ['id', 'name', 'image']
      });
    }
    
    res.json({
      ground_id: parseInt(id),
      game_ids: gameIds,
      game_count: gameCount,
      games: games
    });
    
  } catch (err) {
    console.log(err, "ground not found");
    res.status(500).json({ message: err.message });
  }
}; 

exports.getGroundCourts = async (req, res) => {
  const { groundId } = req.params;
  
  try {
    // First check if ground exists
    const ground = await Ground.findByPk(groundId);
    
    if (!ground) {
      return res.status(404).json({ 
        success: false,
        message: 'Ground not found' 
      });
    }
    
    // Get all courts for this ground
    const courts = await Court.findAll({
      where: {
        ground_id: groundId
      },
      include: [{
        model: Ground,
        as: 'ground',
        attributes: ['id', 'name']
      }],
      order: [['name', 'ASC']]
    });
    
    // Get detailed slots for each court and include game data
    const courtsWithDetailedSlots = await Promise.all(
      courts.map(async court => {
        // Get all CourtSlot records for this court
        const slots = await CourtSlot.findAll({ 
          where: { court_id: court.id },
          order: [['day', 'ASC'], ['slot', 'ASC']] // Order by day then by slot time
        });
        
        // Group slots by day with detailed information
        const slotsPerDay = {};
        slots.forEach(slot => {
          if (!slotsPerDay[slot.day]) {
            slotsPerDay[slot.day] = [];
          }
          slotsPerDay[slot.day].push({
            id: slot.id,
            slot: slot.slot,
            day: slot.day,
            court_id: slot.court_id
          });
        });

        // Fetch game data for this court
        let gameData = null;
        if (court.games_id) {
          gameData = await Games.findOne({
            where: { id: court.games_id },
            attributes: ['id', 'name', 'image']
          });
        }

        const courtData = court.toJSON();
        return {
          ...courtData,
          slotsPerDay,
          game: gameData
        };
      })
    );
    
    // Calculate total slots across all courts
    const totalSlots = courtsWithDetailedSlots.reduce((total, court) => {
      return total + (court.slot_count || 0);
    }, 0);
    
    res.json({
      success: true,
      message: 'Courts and slots fetched successfully',
      ground: {
        id: ground.id,
        name: ground.name,
        address: ground.address,
        city: ground.city
      },
      courts: courtsWithDetailedSlots,
      court_count: courtsWithDetailedSlots.length,
      total_slots: totalSlots,
    });
    
  } catch (err) {
    console.error('Error fetching ground courts:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
}; 



