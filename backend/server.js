const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');


const inventoryRouter = require('./src/presentation_layer/routes/inventory.routes');
const suppliersRouter = require('./src/presentation_layer/routes/supplier.routes');
const dishRouter = require('./src/presentation_layer/routes/dish.routes');
const floorsRouter = require('./src/presentation_layer/routes/floors.routes');
const locationsRouter = require('./src/presentation_layer/routes/locations.routes');
const tablesRouter = require('./src/presentation_layer/routes/tables.routes');
const staffRouter = require('./src/presentation_layer/routes/staff.routes');
const customerRouter = require('./src/presentation_layer/routes/customer.routes');
const promotionRouter = require('./src/presentation_layer/routes/promotion.routes');
const invoiceRouter = require('./src/presentation_layer/routes/invoice.routes');
const invoicePromotionRouter = require('./src/presentation_layer/routes/invoice_promotion.routes');
const complaintRouter = require('./src/presentation_layer/routes/complaint.routes');
const ratingRouter = require('./src/presentation_layer/routes/rating.routes');
const violationRouter = require('./src/presentation_layer/routes/violation.routes');
const ratingReplyRouter = require('./src/presentation_layer/routes/rating_reply.routes');
const orderRouter = require('./src/presentation_layer/routes/orders.routes');
const reservationRouter = require('./src/presentation_layer/routes/reservation.routes');
const reservationDetailRouter = require('./src/presentation_layer/routes/reservationdetail.routes');

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
    message: 'Restaurant Management API Server',
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

app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/suppliers', suppliersRouter);


app.use('/api/v1/dishes', dishRouter);

app.use('/api/v1/floors', floorsRouter);
app.use('/api/v1/locations', locationsRouter);
app.use('/api/v1/tables', tablesRouter);

app.use('/api/v1/staff', staffRouter);

app.use('/api/v1/customers', customerRouter);

app.use('/api/v1/promotions', promotionRouter);

app.use('/api/v1/invoices', invoiceRouter);

app.use('/api/v1/invoice-promotions', invoicePromotionRouter);

app.use('/api/v1/complaints', complaintRouter);

app.use('/api/v1/ratings', ratingRouter);

app.use('/api/v1/violations', violationRouter);

app.use('/api/v1/rating-replies', ratingReplyRouter);

app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/reservations', reservationRouter);
app.use('/api/v1/reservation-details', reservationDetailRouter);

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
let timestamp = new Date().toLocaleString();

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
║  FLOOR & LOCATION MANAGEMENT:                      ║
║  • GET    /api/v1/floors                              ║
║  • POST   /api/v1/floors                              ║
║  • GET    /api/v1/floors/:id                          ║
║  • PUT    /api/v1/floors/:id                          ║
║  • DELETE /api/v1/floors/:id                          ║
║                                                    ║
║  LOCATION MANAGEMENT:                              ║
║  • GET    /api/v1/locations                           ║
║  • POST   /api/v1/locations                           ║
║  • GET    /api/v1/locations/:id                       ║
║  • GET    /api/v1/locations/floor/:floorId            ║
║  • PUT    /api/v1/locations/:id                       ║
║  • DELETE /api/v1/locations/:id                       ║
║                                                    ║
║  TABLE MANAGEMENT:                                 ║
║  • GET    /api/v1/tables                              ║
║  • POST   /api/v1/tables                              ║
║  • GET    /api/v1/tables/:id                          ║
║  • GET    /api/v1/tables/location/:locationId         ║
║  • GET    /api/v1/tables/status/:status               ║
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
║                                                    ║
║  DISH MANAGEMENT:                                  ║
║  • GET    /api/v1/dishes                              ║
║  • POST   /api/v1/dishes                              ║
║  • GET    /api/v1/dishes/:id                          ║
║  • PUT    /api/v1/dishes/:id                          ║
║  • PATCH  /api/v1/dishes/:id/availability            ║
║  • DELETE /api/v1/dishes/:id                          ║
║  • GET    /api/v1/dishes/:id/ingredients              ║
║  • POST   /api/v1/dishes/:id/ingredients              ║
║  • PUT    /api/v1/dishes/:id/ingredients/:ingredientId║
║  • DELETE /api/v1/dishes/:id/ingredients/:ingredientId║
║                                                    ║
║  SUPPLIERS:                                        ║
║  • GET    /api/v1/suppliers                          ║
║  • POST   /api/v1/suppliers                          ║
║                                                    ║
║  PROMOTION MANAGEMENT:                             ║
║  • GET    /api/v1/promotions/statistics               ║
║  • POST   /api/v1/promotions/validate                 ║
║  • GET    /api/v1/promotions/code/:code               ║
║  • GET    /api/v1/promotions                          ║
║  • GET    /api/v1/promotions/:id                      ║
║  • POST   /api/v1/promotions                          ║
║  • PUT    /api/v1/promotions/:id                      ║
║  • DELETE /api/v1/promotions/:id                      ║
║                                                    ║
║  INVOICE MANAGEMENT:                               ║
║  • GET    /api/v1/invoices/statistics                 ║
║  • GET    /api/v1/invoices                            ║
║  • GET    /api/v1/invoices/:id                        ║
║  • POST   /api/v1/invoices                            ║
║  • PUT    /api/v1/invoices/:id                        ║
║  • DELETE /api/v1/invoices/:id                        ║
║                                                    ║
║  INVOICE PROMOTIONS:                               ║
║  • GET    /api/v1/invoice-promotions/statistics      ║
║  • GET    /api/v1/invoice-promotions                 ║
║  • GET    /api/v1/invoice-promotions/:id             ║
║  • GET    /api/v1/invoice-promotions/invoice/:invoiceId ║
║  • GET    /api/v1/invoice-promotions/promotion/:promotionId ║
║  • POST   /api/v1/invoice-promotions                 ║
║  • DELETE /api/v1/invoice-promotions/:id             ║
║                                                    ║
║  COMPLAINTS:                                       ║
║  • GET    /api/v1/complaints/statistics              ║
║  • GET    /api/v1/complaints                         ║
║  • GET    /api/v1/complaints/:id                     ║
║  • POST   /api/v1/complaints                         ║
║  • PUT    /api/v1/complaints/:id                     ║
║  • DELETE /api/v1/complaints/:id                     ║
║  • PATCH  /api/v1/complaints/:id/status              ║
║  • PATCH  /api/v1/complaints/:id/assign              ║
║  • PATCH  /api/v1/complaints/:id/resolve             ║
║                                                    ║
║  RATINGS:                                          ║
║  • GET    /api/v1/ratings/statistics                 ║
║  • GET    /api/v1/ratings                            ║
║  • GET    /api/v1/ratings/:id                        ║
║  • GET    /api/v1/ratings/:id/replies                ║
║  • POST   /api/v1/ratings                            ║
║  • POST   /api/v1/ratings/:id/reply                  ║
║  • PUT    /api/v1/ratings/:id                        ║
║  • PUT    /api/v1/ratings/replies/:replyId           ║
║  • DELETE /api/v1/ratings/:id                        ║
║  • DELETE /api/v1/ratings/replies/:replyId           ║
║                                                    ║
║  VIOLATIONS:                                       ║
║  • GET    /api/v1/violations/statistics              ║
║  • GET    /api/v1/violations/statistics/top-violators ║
║  • GET    /api/v1/violations                         ║
║  • GET    /api/v1/violations/:id                     ║
║  • GET    /api/v1/violations/customer/:customerId    ║
║  • POST   /api/v1/violations                         ║
║  • PUT    /api/v1/violations/:id                     ║
║  • DELETE /api/v1/violations/:id                     ║
║                                                    ║
║  RATING REPLIES:                                   ║
║  • GET    /api/v1/rating-replies/statistics          ║
║  • GET    /api/v1/rating-replies/statistics/top-staff ║
║  • GET    /api/v1/rating-replies                     ║
║  • GET    /api/v1/rating-replies/:id                 ║
║  • GET    /api/v1/rating-replies/rating/:ratingId    ║
║  • GET    /api/v1/rating-replies/staff/:staffId      ║
║  • POST   /api/v1/rating-replies                     ║
║  • PUT    /api/v1/rating-replies/:id                 ║
║  • DELETE /api/v1/rating-replies/:id                 ║
║  • DELETE /api/v1/rating-replies/rating/:ratingId    ║
║                                                    ║
║  ORDER MANAGEMENT:                                 ║
║  • GET    /api/v1/orders                              ║
║  • POST   /api/v1/orders                              ║
║  • GET    /api/v1/orders/statistics                   ║
║  • GET    /api/v1/orders/:id                          ║
║  • GET    /api/v1/orders/table/:tableId               ║
║  • GET    /api/v1/orders/customer/:customerId         ║
║  • PUT    /api/v1/orders/:id                          ║
║  • DELETE /api/v1/orders/:id                          ║
║  • POST   /api/v1/orders/:id/calculate                ║
║  • GET    /api/v1/orders/:orderId/details             ║
║  • POST   /api/v1/orders/:orderId/details             ║
║  • PUT    /api/v1/orders/:orderId/details/:detailId   ║
║  • DELETE /api/v1/orders/:orderId/details/:detailId   ║
╚═════════════════════════════════════════════════════╝
Server is up at ${timestamp}
`);
  });
}

module.exports = app;
