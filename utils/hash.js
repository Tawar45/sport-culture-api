const bcrypt = require('bcryptjs');

async function generateHash(password) {
  if (!password) throw new Error('Password is required');
  return await bcrypt.hash(password, 10);
}

module.exports = { generateHash }; 