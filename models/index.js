const Ground = require('./Ground');
const Games = require('./Games');
const Court = require('./Court');
const CourtSlot = require('./CourtSlot');
const Booking = require('./Booking');

// Set up associations
Ground.belongsTo(Games, {
  foreignKey: 'games',
  targetKey: 'id',
  as: 'gameData'
});

Games.hasMany(Ground, {
  foreignKey: 'games',
  sourceKey: 'id',
  as: 'grounds'
});

// Add Court-Ground association
Court.belongsTo(Ground, {
  foreignKey: 'ground_id',
  targetKey: 'id',
  as: 'ground'
});

Ground.hasMany(Court, {
  foreignKey: 'ground_id',
  sourceKey: 'id',
  as: 'courts'
});

// Add Court-CourtSlot association
Court.hasMany(CourtSlot, {
  foreignKey: 'court_id',
  sourceKey: 'id',
  as: 'slots'
});

CourtSlot.belongsTo(Court, {
  foreignKey: 'court_id',
  targetKey: 'id',
  as: 'court'
});

// Register Booking associations
if (typeof Booking.associate === 'function') {
  Booking.associate({ Ground, Games, Court });
}

module.exports = {
  Ground,
  Games,
  Court,
  CourtSlot,
  Booking
}; 