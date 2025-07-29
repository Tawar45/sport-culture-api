const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const sequelize = require('./database/db');
const corsMiddleware = require('./middleware/cors'); // ← Import your CORS config
const cityRoutes = require('./routes/city');
const gamesRoutes = require('./routes/games');
const groundRoutes = require('./routes/ground');
const groundRequestRoutes = require('./routes/groundRequest');
const userRoutes = require('./routes/users');
const courtRoutes = require('./routes/court');
const bookingRoutes = require('./routes/booking');
const dashboardRoutes = require('./routes/dashboard');
const amenitiesRoutes = require('./routes/amenities');
const volunteerRoutes = require('./routes/volunteer');
const path = require('path');

app.use(corsMiddleware); // ← Use it before routes
app.use(express.json());
// Serve static files from the public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/city', cityRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/ground', groundRoutes);
app.use('/api/groundRequest', groundRequestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/court', courtRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/amenities',amenitiesRoutes);
app.use('/api/volunteer',volunteerRoutes);

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