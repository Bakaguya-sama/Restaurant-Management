const mongoose = require('mongoose');

async function connectTestDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_management';
  await mongoose.connect(uri);
}

async function disconnectTestDB() {
  await mongoose.connection.close();
}

async function clearCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const name of collections) {
    const collection = mongoose.connection.collections[name];
    try {
      await collection.deleteMany({});
    } catch (_) {}
  }
}

module.exports = { connectTestDB, disconnectTestDB, clearCollections };