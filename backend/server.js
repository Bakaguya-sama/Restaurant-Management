const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Import routes
const floorsRouter = require('./src/routes/floors');
const locationsRouter = require('./src/routes/locations');
const tablesRouter = require('./src/routes/tables');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: '🍽️ Restaurant Management API Server',
    status: 'Running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'Connected',
    uptime: process.uptime()
  });
});

// Table Management Routes
app.use('/api/floors', floorsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/tables', tablesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════════╗
║       RESTAURANT MANAGEMENT API SERVER             ║
║       Port: ${PORT}                                       ║
║       Environment: ${process.env.NODE_ENV || 'development'}                    ║
╠═════════════════════════════════════════════════════╣
║       Available Routes:                            ║
║  • GET    /                                        ║
║  • GET    /api/health                              ║
║                                                    ║
║  TABLE MANAGEMENT:                                 ║
║  • GET    /api/floors                              ║
║  • POST   /api/floors                              ║
║  • GET    /api/floors/:id                          ║
║  • PUT    /api/floors/:id                          ║
║  • DELETE /api/floors/:id                          ║
║                                                    ║
║  • GET    /api/locations                           ║
║  • POST   /api/locations                           ║
║  • GET    /api/locations/:id                       ║
║  • GET    /api/locations/floor/:floorId            ║
║  • PUT    /api/locations/:id                       ║
║  • DELETE /api/locations/:id                       ║
║                                                    ║
║  • GET    /api/tables                              ║
║  • POST   /api/tables                              ║
║  • GET    /api/tables/:id                          ║
║  • GET    /api/tables/location/:locationId         ║
║  • GET    /api/tables/status/available             ║
║  • GET    /api/tables/status/summary               ║
║  • PUT    /api/tables/:id                          ║
║  • PATCH  /api/tables/:id/status                   ║
║  • DELETE /api/tables/:id                          ║
╚═════════════════════════════════════════════════════╝
`);
});

module.exports = app;
