const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const GroundRequest = sequelize.define('GroundRequest', {
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
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gamesType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  groundId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  });

module.exports = GroundRequest; 