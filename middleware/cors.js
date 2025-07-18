const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000','http://31.97.205.126:3000'], // React app URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  credentials: true,
};

module.exports = cors(corsOptions);
