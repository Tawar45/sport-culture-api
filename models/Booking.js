const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  ground_id: { type: DataTypes.INTEGER, allowNull: false },
  game_id: { type: DataTypes.INTEGER, allowNull: false },
  booking_date: { type: DataTypes.DATEONLY, allowNull: false },
  slot: { type: DataTypes.STRING(20), allowNull: false },
  booking_type: { type: DataTypes.ENUM('online', 'cash'), allowNull: false },
  payment_status: { type: DataTypes.ENUM('pending', 'paid', 'failed'), defaultValue: 'pending' },
  payment_method: { type: DataTypes.STRING(20), allowNull: true }, // e.g. 'card', 'upi', 'cash'
  payment_reference: { type: DataTypes.STRING(100), allowNull: true }, // transaction id or receipt
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' }, // e.g. 'pending', 'confirmed', 'cancelled'
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Booking; 