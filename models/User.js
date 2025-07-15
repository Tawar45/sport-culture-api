const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usertype: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
    enum: ['user', 'admin','vendor'],
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
 profile_image: {
    type: DataTypes.STRING,
    allowNull: true
},
status: {
  type: DataTypes.STRING,
  allowNull: true,
  defaultValue: 'active'
}
});

module.exports = User; 