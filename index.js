const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const sequelize = require('./database/db');
const corsMiddleware = require('./middleware/cors'); // ← Import your CORS config
const cityRoutes = require('./routes/city');
  
app.use(corsMiddleware); // ← Use it before routes
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/city', cityRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to MySQL (Sport cluture Service)');
    return sequelize.sync(); // optional: { force: true } or { alter: true }
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Sport cluture running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MySQL connection error:', err);
  });