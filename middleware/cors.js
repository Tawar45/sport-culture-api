const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:3000', // React app URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  credentials: true,
};

module.exports = cors(corsOptions);
