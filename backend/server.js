const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Import routes
const floorsRouter = require('./src/routes/floors');
const locationsRouter = require('./src/routes/locations');
const tablesRouter = require('./src/routes/tables');
const staffRouter = require('./src/presentation_layer/routes/staff.routes');
const customerRouter = require('./src/presentation_layer/routes/customer.routes');

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
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'Connected',
    uptime: process.uptime()
  });
});

// Table Management Routes
app.use('/api/v1/floors', floorsRouter);
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/tables', tablesRouter);

// Staff Routes
app.use('/api/v1/staff', staffRouter);

// Customer Routes
app.use('/api/v1/customers', customerRouter);

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

// Only listen if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
╔═════════════════════════════════════════════════════╗
║       RESTAURANT MANAGEMENT API SERVER             ║
║       Port: ${PORT}                                       ║
║       Environment: ${process.env.NODE_ENV || 'development'}                    ║
╠═════════════════════════════════════════════════════╣
║       Available Routes:                            ║
║  • GET    /                                        ║
║  • GET    /api/v1/health                              ║
║                                                    ║
║  STAFF MANAGEMENT:                                 ║
║  • POST   /api/v1/staff/login                         ║
║  • GET    /api/v1/staff/statistics                    ║
║  • GET    /api/v1/staff                               ║
║  • GET    /api/v1/staff/:id                           ║
║  • POST   /api/v1/staff                               ║
║  • PUT    /api/v1/staff/:id                           ║
║  • DELETE /api/v1/staff/:id                           ║
║  • PATCH  /api/v1/staff/:id/activate                  ║
║  • PATCH  /api/v1/staff/:id/deactivate                ║
║                                                    ║
║  CUSTOMER MANAGEMENT:                              ║
║  • POST   /api/v1/customers/login                     ║
║  • GET    /api/v1/customers/statistics                ║
║  • GET    /api/v1/customers/top                       ║
║  • GET    /api/v1/customers                           ║
║  • GET    /api/v1/customers/:id                       ║
║  • POST   /api/v1/customers                           ║
║  • PUT    /api/v1/customers/:id                       ║
║  • DELETE /api/v1/customers/:id                       ║
║  • PATCH  /api/v1/customers/:id/ban                   ║
║  • PATCH  /api/v1/customers/:id/unban                 ║
║  • PATCH  /api/v1/customers/:id/points                ║
║  • PATCH  /api/v1/customers/:id/spending              ║
║                                                    ║
║  TABLE MANAGEMENT:                                 ║
║  • GET    /api/v1/floors                              ║
║  • POST   /api/v1/floors                              ║
║  • GET    /api/v1/floors/:id                          ║
║  • PUT    /api/v1/floors/:id                          ║
║  • DELETE /api/v1/floors/:id                          ║
║                                                    ║
║  • GET    /api/v1/locations                           ║
║  • POST   /api/v1/locations                           ║
║  • GET    /api/v1/locations/:id                       ║
║  • GET    /api/v1/locations/floor/:floorId            ║
║  • PUT    /api/v1/locations/:id                       ║
║  • DELETE /api/v1/locations/:id                       ║
║                                                    ║
║  • GET    /api/v1/tables                              ║
║  • POST   /api/v1/tables                              ║
║  • GET    /api/v1/tables/:id                          ║
║  • GET    /api/v1/tables/location/:locationId         ║
║  • GET    /api/v1/tables/status/available             ║
║  • GET    /api/v1/tables/status/summary               ║
║  • PUT    /api/v1/tables/:id                          ║
║  • PATCH  /api/v1/tables/:id/status                   ║
║  • DELETE /api/v1/tables/:id                          ║
╚═════════════════════════════════════════════════════╝
`);
  });
}

module.exports = app;
