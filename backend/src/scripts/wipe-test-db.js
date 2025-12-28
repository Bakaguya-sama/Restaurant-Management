#!/usr/bin/env node
/**
 * Wipe Test Database
 * Clears all collections from the test MongoDB database before running tests
 */

require('dotenv').config();

const mongoose = require('mongoose');

const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management_test';

async function wipeTestDatabase() {
  try {
    // Connect to test database
    await mongoose.connect(TEST_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });

    console.log('Connected to test database');

    // Get all collections
    const collections = mongoose.connection.collections;

    // Clear each collection
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
      console.log(`✓ Cleared collection: ${key}`);
    }

    console.log('\n✓ Test database wiped successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error wiping test database:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  wipeTestDatabase();
}

module.exports = wipeTestDatabase;
