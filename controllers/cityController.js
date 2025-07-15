const City = require('../models/City'); // Adjust path as needed

exports.add = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'City name is required' });
    }
    const existingCity = await City.findOne({ where: { name: name } });
    if (existingCity) {
      return res.status(400).json({ message: 'City already exists' });
    }
    const newCity = await City.create({ name: name });

    res.status(201).json({
      message: 'City added successfully',
      city: { id: newCity.id, name: newCity.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add city', error: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const cities = await City.findAll({
      attributes: ['id', 'name'], // only return necessary fields
      order: [['id', 'ASC']],   // optional: sort by city name
    });

    res.status(200).json({
      message: 'City list fetched successfully',
      cities: cities,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch cities',
      error: error.message,
    });
  }
};
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'City name is required' });
    }

    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    const duplicate = await City.findOne({
      where: {
        name,
        id: { [require('sequelize').Op.ne]: id },
      },
    });

    if (duplicate) {
      return res.status(400).json({ message: 'City name already exists' });
    }

    city.name = name;
    await city.save();

    res.status(200).json({
      message: 'City updated successfully',
      city: { id: city.id, name: city.name },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update city', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findByPk(id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    await city.destroy();

    res.status(200).json({ message: 'City deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete city', error: error.message });
  }
};

