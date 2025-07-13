const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Court = sequelize.define('Court', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ground_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  games_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  open_time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  close_time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
});

module.exports = Court; 