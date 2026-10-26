const assert = require('node:assert/strict');
const test = require('node:test');

const { initializeStorage } = require('../storage');

const logger = { warn() {} };

test('uses MongoDB when the connection succeeds', async () => {
  const databaseStore = { name: 'database' };
  const result = await initializeStorage({
    connect: async () => {},
    databaseStore,
    databaseUrl: 'mongodb://example.test/chatty',
    allowInMemory: true,
    isProduction: true,
    logger,
  });

  assert.equal(result.storage, 'mongodb');
  assert.equal(result.store, databaseStore);
});

test('falls back to memory in production when explicitly allowed', async () => {
  const memoryStore = { name: 'memory' };
  const result = await initializeStorage({
    connect: async () => {
      throw new Error('connection timed out');
    },
    createMemoryStore: () => memoryStore,
    databaseUrl: 'mongodb://unreachable.test/chatty',
    allowInMemory: true,
    isProduction: true,
    logger,
  });

  assert.equal(result.storage, 'memory');
  assert.equal(result.store, memoryStore);
});

test('fails closed in production when memory storage is not allowed', async () => {
  await assert.rejects(
    initializeStorage({
      connect: async () => {
        throw new Error('connection timed out');
      },
      databaseUrl: 'mongodb://unreachable.test/chatty',
      allowInMemory: false,
      isProduction: true,
      logger,
    }),
    /connection timed out/,
  );
});
