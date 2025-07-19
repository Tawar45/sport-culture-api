const Amenities = require('../models/Amenities'); // Adjust path as needed

exports.add = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Amenities name is required' });
    }
    const existingAmenities = await Amenities.findOne({ where: { name: name } });
    if (existingAmenities) {
      return res.status(400).json({ message: 'Amenities already exists' });
    }
    const newAmenities = await Amenities.create({ name: name });

    res.status(201).json({
      message: 'Amenities added successfully',
      amenities: { id: newAmenities.id, name: newAmenities.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add Amenities', error: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const amenitiesList = await Amenities.findAll({
      attributes: ['id', 'name'], // only return necessary fields
      order: [['id', 'ASC']],   // optional: sort by amenities name
    });

    res.status(200).json({
      message: 'Amenities list fetched successfully',
      amenities: amenitiesList,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch amenities',
      error: error.message,
    });
  }
};
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Amenities name is required' });
    }

    const amenities = await Amenities.findByPk(id);
    if (!amenities) {
      return res.status(404).json({ message: 'Amenities not found' });
    }

    const duplicate = await Amenities.findOne({
      where: {
        name,
        id: { [require('sequelize').Op.ne]: id },
      },
    });

    if (duplicate) {
      return res.status(400).json({ message: 'Amenities name already exists' });
    }

    amenities.name = name;
    await amenities.save();

    res.status(200).json({
      message: 'City updated successfully',
      amenities: { id: amenities.id, name: amenities.name },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update amenities', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const amenities = await Amenities.findByPk(id);
    if (!amenities) {
      return res.status(404).json({ message: 'amenities not found' });
    }

    await amenities.destroy();

    res.status(200).json({ message: 'amenities deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete amenities', error: error.message });
  }
};

