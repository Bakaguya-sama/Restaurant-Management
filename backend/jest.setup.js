process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/restaurant_management_test';

const mongoose = require('mongoose');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const { Floor } = require('./src/models');
      await Floor.collection.dropIndex('floor_number_1').catch(() => {});
      await Floor.deleteMany({});
    } catch (error) {
      console.warn('Setup warning:', error.message);
    }
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

// Handle uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

