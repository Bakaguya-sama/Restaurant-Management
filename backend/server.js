const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Import routes
const inventoryRouter = require('./src/presentation_layer/routes/inventory.routes');
const suppliersRouter = require('./src/presentation_layer/routes/supplier.routes');
const menuRouter = require('./src/presentation_layer/routes/menu.routes');

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

// Inventory & Suppliers
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/suppliers', suppliersRouter);

// Menu management
app.use('/api/v1/menu', menuRouter);

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

// Only start listening when not running tests to allow supertest to use the app
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
║  TABLE MANAGEMENT:                                 ║
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
║                                                    ║
║  INVENTORY MANAGEMENT:                             ║
║  • GET    /api/v1/inventory                          ║
║  • POST   /api/v1/inventory/import                   ║
║  • POST   /api/v1/inventory/export                   ║
║  • PUT    /api/v1/inventory/:id                      ║
║                                                    ║
║  MENU MANAGEMENT:                                  ║
║  • GET    /api/v1/menu                              ║
║  • POST   /api/v1/menu                              ║
║  • PUT    /api/v1/menu/:id                          ║
║  • PATCH  /api/v1/menu/:id/availability             ║
║  • DELETE /api/v1/menu/:id                          ║
║                                                    ║
║  SUPPLIERS:                                        ║
║  • GET    /api/v1/suppliers                          ║
║  • POST   /api/v1/suppliers                          ║
╚═════════════════════════════════════════════════════╝
`);
  });
}

module.exports = app;
