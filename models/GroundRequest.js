const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const GroundRequest = sequelize.define('GroundRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  user_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  user_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  ground_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  ground_address: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  ground_city: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  game_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  requested_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  processed_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  processed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'ground_requests',
  timestamps: true,
});

module.exports = GroundRequest; 