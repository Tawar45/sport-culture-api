const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const City = sequelize.define('City', {
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
});

module.exports = City; 