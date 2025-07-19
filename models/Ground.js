const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');

const Ground = sequelize.define('Ground', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: '',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  openTime: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  closeTime: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON, // Store array of image paths
    allowNull: true,
    defaultValue: [],
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  games_ids: {
    type: DataTypes.JSON, // MySQL 5.7+ supports JSON
    allowNull: true,
  },
  amenities_ids: {
    type: DataTypes.JSON, // MySQL 5.7+ supports JSON
    allowNull: true,
  },
}, {
  tableName: 'Grounds',
});

// // Define association with Games model
// Ground.associate = (models) => {
//   Ground.belongsTo(models.Games, {
//     foreignKey: 'games',
//     targetKey: 'id',
//     as: 'gameData'
//   });
// };

module.exports = Ground; 