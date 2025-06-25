const Games = require('../models/Games'); // Adjust path as needed

exports.add = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Game name is required' });
    }
    const existingGame = await Games.findOne({ where: { name: name } });
    if (existingGame) {
      return res.status(400).json({ message: 'Game already exists' });
    }
    const newGame = await Games.create({ name: name, image: image });

    res.status(201).json({
      message: 'Game added successfully',
      game: { id: newGame.id, name: newGame.name, image: newGame.image }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add game', error: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const games = await Games.findAll({
      attributes: ['id', 'name', 'image'], // only return necessary fields
        order: [['id', 'ASC']],   // optional: sort by game name
    });

    res.status(200).json({
      message: 'Game list fetched successfully',
      games: games,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch games',
      error: error.message,
    });
  }
};
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Game name is required' });
    }

    const game = await Games.findByPk(id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const duplicate = await Games.findOne({
      where: {
        name,
        id: { [require('sequelize').Op.ne]: id },
      },
    });

    if (duplicate) {
      return res.status(400).json({ message: 'Game name already exists' });
    }

    game.name = name;
    game.image = image;
    await game.save();

    res.status(200).json({
      message: 'Game updated successfully',
      game: { id: game.id, name: game.name, image: game.image  },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update game', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Games.findByPk(id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

      await game.destroy();

    res.status(200).json({ message: 'Game deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Failed to delete game', error: error.message });
  }
};

