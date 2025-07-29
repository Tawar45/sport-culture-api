const Volunteer = require('../models/Volunteer');
// Create a new volunteer

exports.addVolunteer = async (req, res) => {
  try {
    const { name, email, phone, city ,area_of_interest,message } = req.body;
    if (!name || !email || !phone || !city) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const volunteer = await Volunteer.create({ name, email, phone, city,area_of_interest,message });
    res.status(201).json({ message: 'Volunteer created successfully', volunteer });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    res.status(500).json({ message: 'Failed to create volunteer', error: error.message });
  }
};

// List all volunteers
exports.listVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.findAll();
    res.status(200).json(volunteers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch volunteers', error: error.message });
  }
}; 