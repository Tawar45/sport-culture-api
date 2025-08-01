const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.STRING(20), allowNull: false },
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
  guest_name: { type: DataTypes.STRING(100), allowNull: true },
  guest_email: { type: DataTypes.STRING(100), allowNull: true },
  guest_phone: { type: DataTypes.STRING(20), allowNull: true },
  is_cash_collected: { type: DataTypes.BOOLEAN, defaultValue: false },
  cash_collected_by: { type: DataTypes.INTEGER, allowNull: true },
  cash_collected_at: { type: DataTypes.DATE, allowNull: true },
  admin_cash_received: { type: DataTypes.BOOLEAN, defaultValue: false },
  admin_cash_received_at: { type: DataTypes.DATE, allowNull: true },
});

Booking.associate = (models) => {
  Booking.belongsTo(models.Ground, {
    foreignKey: 'ground_id',
    as: 'ground',
  });
  Booking.belongsTo(models.Games, {
    foreignKey: 'game_id',
    as: 'game',
  });
  Booking.belongsTo(models.Court, {
    foreignKey: 'court_id',
    as: 'court',
  });
};

module.exports = Booking; 