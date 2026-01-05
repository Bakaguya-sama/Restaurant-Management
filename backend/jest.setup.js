process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/restaurant_management_test';

const mongoose = require('mongoose');

const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString() || '';
  const isExpectedError = [
    'ValidationError',
    'CastError',
    'MongoServerError',
    'Error',
    'failed',
    'invalid'
  ].some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  
  if (!isExpectedError) {
    originalConsoleError(...args);
  }
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
        console.log('Test database cleaned and indexes reset');
      }
    } catch (error) {
      console.warn('Setup warning:', error.message);
    }
  } else {
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
        console.log('Test database cleaned and indexes reset');
      }
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      console.log('Test database cleaned after tests');
    }
  } catch (error) {
    console.warn('Cleanup after error:', error.message);
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

// Handle uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

