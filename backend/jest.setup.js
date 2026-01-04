process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/restaurant_management_test';

const mongoose = require('mongoose');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      // Drop the entire test database to clear all collections and indexes
      await mongoose.connection.db.dropDatabase();
      console.log('Test database cleaned and indexes reset');
    } catch (error) {
      console.warn('Setup warning:', error.message);
    }
  } else {
    // If already connected, clean the database
    try {
      await mongoose.connection.db.dropDatabase();
      console.log('Test database cleaned and indexes reset');
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.db.dropDatabase();
    console.log('Test database cleaned after tests');
  } catch (error) {
    console.warn('Cleanup after error:', error.message);
  }
  await mongoose.disconnect();
});

// Handle uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

