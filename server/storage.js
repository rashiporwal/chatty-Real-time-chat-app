const { messageStore } = require('./messageStore');
const { createMemoryMessageStore } = require('./memoryMessageStore');

async function initializeStorage({
  connect,
  databaseStore = messageStore,
  createMemoryStore = createMemoryMessageStore,
  databaseUrl = process.env.DATABASE_URL,
  allowInMemory = process.env.ALLOW_IN_MEMORY !== 'false',
  isProduction = process.env.NODE_ENV === 'production',
  logger = console,
} = {}) {
  if (databaseUrl) {
    try {
      await connect();
      return { store: databaseStore, storage: 'mongodb' };
    } catch (error) {
      if (isProduction && !allowInMemory) throw error;

      logger.warn(`MongoDB is unavailable (${error.message}). Using temporary in-memory history.`);
      return { store: createMemoryStore(), storage: 'memory' };
    }
  }

  if (isProduction && !allowInMemory) {
    throw new Error('DATABASE_URL is required in production.');
  }

  logger.warn('DATABASE_URL is not set. Using temporary in-memory history.');
  return { store: createMemoryStore(), storage: 'memory' };
}

module.exports = { initializeStorage };
