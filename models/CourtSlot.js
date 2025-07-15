const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const CourtSlot = sequelize.define('CourtSlot', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  court_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  day: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  slot: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
});

module.exports = CourtSlot; 