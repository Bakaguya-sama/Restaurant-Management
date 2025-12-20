process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/restaurant_management_test';

// Ensure clean shutdown
const mongoose = require('mongoose');

afterAll(async () => {
  // Close all mongoose connections
  await mongoose.disconnect();
});

// Handle uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

