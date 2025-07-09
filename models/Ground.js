const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Ground = sequelize.define('Ground', {
  
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  game: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  openTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  closeTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  });

module.exports = Ground; 