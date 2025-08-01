const Court = require('../models/Court');
const CourtSlot = require('../models/CourtSlot');
const Ground = require('../models/Ground');
const Games = require('../models/Games');
const { Op } = require('sequelize');

// Helper to flatten slotsPerDay to array of { day, slot }
function flattenSlots(slotsPerDay) {
  const result = [];
  for (const day in slotsPerDay) {
    for (const slot of slotsPerDay[day]) {
      result.push({ day, slot });
    }
  }
  return result;
}

exports.addCourt = async (req, res) => {
  const { ground_id, name, games_id,openTime, closeTime, price, slotsPerDay } = req.body;
  try {
    // 1. Create court
    const court = await Court.create({
      ground_id,
      name,
      open_time: openTime,
      close_time: closeTime,
      price,
      games_id,
    });
    // 2. Create slots
    const slots = flattenSlots(slotsPerDay).map(s => ({ ...s, court_id: court.id }));
    if (slots.length > 0) await CourtSlot.bulkCreate(slots);
    res.status(201).json({ message: 'Court added successfully', court });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCourt = async (req, res) => {
  const { id } = req.params;
  const { ground_id, name,games_id, openTime, closeTime, price, slotsPerDay } = req.body;
  try {
    // 1. Update court
    const court = await Court.findByPk(id);
    if (!court) return res.status(404).json({ message: 'Court not found' });
    await court.update({
      ground_id,
      name,
      open_time: openTime,
      close_time: closeTime,
      price,
      games_id
    });
    // 2. Delete old slots and add new
    await CourtSlot.destroy({ where: { court_id: id } });
    const slots = flattenSlots(slotsPerDay).map(s => ({ ...s, court_id: id }));
    if (slots.length > 0) await CourtSlot.bulkCreate(slots);
    res.json({ message: 'Court updated successfully', court });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listCourts = async (req, res) => {
  try {
    const courts = await Court.findAll({
      include: [{
        model: Ground,
        as: 'ground',
        attributes: ['id', 'name']
      }]
    });
    
    // Optionally include slots
    const courtsWithSlots = await Promise.all(
      courts.map(async court => {
        const games = await Games.findOne({ where: { id : court.games_id } });

        const slots = await CourtSlot.findAll({ where: { court_id: court.id } });
        // Group slots by day
        const slotsPerDay = {};
        slots.forEach(s => {
          if (!slotsPerDay[s.day]) slotsPerDay[s.day] = [];
          slotsPerDay[s.day].push(s.slot);
        });
        
        const courtData = court.toJSON();
        return { 
          ...courtData, 
          slotsPerDay,
          ground_name: courtData.ground ? courtData.ground.name : null,
          games : games

        };
      })
    );
    res.json(courtsWithSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourt = async (req, res) => {
  const { id } = req.params;
  try {
    const court = await Court.findByPk(id);
    if (!court) return res.status(404).json({ message: 'Court not found' });
    const slots = await CourtSlot.findAll({ where: { court_id: id } });
    const slotsPerDay = {};
    slots.forEach(s => {
      if (!slotsPerDay[s.day]) slotsPerDay[s.day] = [];
      slotsPerDay[s.day].push(s.slot);
    });
    res.json({ ...court.toJSON(), slotsPerDay });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCourt = async (req, res) => {
  const { id } = req.params;
  try {
    const court = await Court.findByPk(id);
    if (!court) return res.status(404).json({ message: 'Court not found' });
    await CourtSlot.destroy({ where: { court_id: id } });
    await court.destroy();
    res.json({ message: 'Court deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 
