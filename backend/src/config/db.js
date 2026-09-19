const mongoose = require('mongoose');
const env = require('./env');

let memoryServer = null;

async function connectDB() {
  try {
    // First try connecting to specified MONGODB_URI with 2s timeout
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[DB] Connected to MongoDB at: ${env.MONGODB_URI}`);
  } catch (err) {
    console.warn(`[DB] Could not connect to external MongoDB (${err.message}). Starting in-memory MongoDB server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const uri = memoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`[DB] In-memory MongoDB started and connected at: ${uri}`);
    } catch (memErr) {
      console.error('[DB] Fatal: Failed to initialize in-memory MongoDB:', memErr);
      process.exit(1);
    }
  }
}

async function closeDB() {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('[DB] MongoDB connection closed.');
  } catch (err) {
    console.error('[DB] Error during DB disconnect:', err);
  }
}

module.exports = { connectDB, closeDB };
