const test = require('node:test');
const assert = require('node:assert/strict');
const { createMemoryMessageStore } = require('../memoryMessageStore');

test('memory store keeps room history separate and respects its limit', async () => {
  const store = createMemoryMessageStore();
  await store.create({ author: 'Ada', room: 'one', text: 'first' }, 'socket-1');
  await store.create({ author: 'Grace', room: 'two', text: 'other room' }, 'socket-2');
  await store.create({ author: 'Ada', room: 'one', text: 'latest' }, 'socket-1');

  const history = await store.recent('one', 1);
  assert.equal(history.length, 1);
  assert.equal(history[0].text, 'latest');
  assert.equal(history[0].sender.username, 'Ada');
});
