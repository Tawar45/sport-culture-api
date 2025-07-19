const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Amenities = sequelize.define('Amenities', {
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
  dataJson: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

module.exports = Amenities; 