require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./db');
const { messageStore } = require('./messageStore');
const { createMemoryMessageStore } = require('./memoryMessageStore');
const { createChatServer } = require('./server');

const port = Number(process.env.PORT) || 5000;

async function start() {
  let store = messageStore;
  let storage = 'mongodb';

  if (process.env.DATABASE_URL) {
    try {
      await connectDB();
    } catch (error) {
      if (process.env.NODE_ENV === 'production') throw error;
      console.warn(`MongoDB is unavailable (${error.message}). Using temporary in-memory history.`);
      store = createMemoryMessageStore();
      storage = 'memory';
    }
  } else if (process.env.NODE_ENV === 'production' && process.env.ALLOW_IN_MEMORY !== 'true') {
    throw new Error('DATABASE_URL is required in production.');
  } else {
    console.warn('DATABASE_URL is not set. Using temporary in-memory history.');
    store = createMemoryMessageStore();
    storage = 'memory';
  }

  const { httpServer, io } = createChatServer({ store, storage });
  await new Promise((resolve) => httpServer.listen(port, resolve));
  console.log(`Chat server listening on port ${port} (${storage} storage)`);

  const shutdown = async (signal) => {
    console.log(`${signal} received; shutting down gracefully.`);
    io.close();
    await new Promise((resolve) => httpServer.close(resolve));
    await mongoose.disconnect();
    process.exit(0);
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Unable to start the server:', error.message);
  process.exit(1);
});
