require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./db');
const { createChatServer } = require('./server');
const { initializeStorage } = require('./storage');

const port = Number(process.env.PORT) || 5000;

async function start() {
  const { store, storage } = await initializeStorage({ connect: connectDB });

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
