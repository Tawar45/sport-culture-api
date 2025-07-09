const Games = require('../models/Games'); // Adjust path as needed
const upload = require('../config/multerConfig');
const fs = require('fs');
const path = require('path');

exports.add = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if name exists
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Game name is required'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Game image is required'
      });
    }

    // Get the image path
    const imagePath = `/uploads/games/${req.file.filename}`;

    // Check for existing game
    const existingGame = await Games.findOne({ 
      where: { name: name }
    });

    if (existingGame) {
      return res.status(400).json({
        success: false,
        message: 'Game already exists'
      });
    }

    // Create new game with image path
    const newGame = await Games.create({
      name: name,
      image: imagePath // Save the path to the database
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Game added successfully',
      data: {
        id: newGame.id,
        name: newGame.name,
        image: newGame.image,
        imageUrl: `${req.protocol}://${req.get('host')}${newGame.image}`,
        createdAt: newGame.createdAt
      }
    });

  } catch (error) {
    console.error('Error adding game:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add game',
      error: error.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    const games = await Games.findAll({
      attributes: ['id', 'name', 'image'], // only return necessary fields
      order: [['id', 'ASC']],   // optional: sort by game name
    });

    // Map games to include full image URLs
    const gamesWithUrls = games.map(game => ({
      id: game.id,
      name: game.name,
      image: game.image,
      imageUrl: `${req.protocol}://${req.get('host')}${game.image}`
    }));

    res.status(200).json({
      success: true,
      message: 'Game list fetched successfully',
      games: gamesWithUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games',
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate name
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Game name is required'
      });
    }

    // Find game
    const game = await Games.findByPk(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check for duplicate name
    const duplicate = await Games.findOne({
      where: {
        name,
        id: { [require('sequelize').Op.ne]: id },
      },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'Game name already exists'
      });
    }

    // Handle image update
    let imagePath = game.image;
    if (req.file) {
      imagePath = `/uploads/games/${req.file.filename}`;
      // Optional: Delete old image file here
    }

    // Update game
    game.name = name;
    game.image = imagePath;
    await game.save();

    // Return response
    return res.status(200).json({
      success: true,
      message: 'Game updated successfully',
      data: {
        id: game.id,
        name: game.name,
        image: game.image,
        imageUrl: `${req.protocol}://${req.get('host')}${game.image}`
      }
    });

  } catch (error) {
    console.error('Error updating game:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update game',
      error: error.message
    });
  }
};

exports.remove = async (req, res) => {
  try {
    console.log(req.params);
    const { id } = req.params;
     console.log(id);
    // Find game
    const game = await Games.findByPk(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Remove image file if it exists
    if (game.image) {
      // Get absolute path of image
      const imagePath = path.join(process.cwd(), 'public', game.image);
      
      // Check if file exists before deleting
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log('Image deleted successfully:', imagePath);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    // Delete game record from database
    await game.destroy();

    return res.status(200).json({
      success: true,
      message: 'Game and image deleted successfully'
    });

  } catch (error) {
    console.error('Error in remove:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete game',
      error: error.message
    });
  }
};

