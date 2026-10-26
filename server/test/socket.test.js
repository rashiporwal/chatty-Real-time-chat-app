const test = require('node:test');
const assert = require('node:assert/strict');
const { io: createClient } = require('socket.io-client');
const { createChatServer } = require('../server');

function once(socket, event) {
  return new Promise((resolve) => socket.once(event, resolve));
}

function emitWithAck(socket, event, payload) {
  return new Promise((resolve) => socket.emit(event, payload, resolve));
}

test('room messages, validation, and private-message boundaries work', async (t) => {
  const saved = [];
  const store = {
    async recent() { return []; },
    async create(data, senderId) {
      const message = {
        id: String(saved.length + 1),
        text: data.text,
        sender: { id: senderId, username: data.author },
        room: data.room,
        timestamp: new Date().toISOString(),
      };
      saved.push(message);
      return message;
    },
  };
  const { httpServer, io } = createChatServer({ store, serveClient: false });
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  const { port } = httpServer.address();
  const url = `http://127.0.0.1:${port}`;
  const alice = createClient(url, { transports: ['websocket'] });
  const bob = createClient(url, { transports: ['websocket'] });

  t.after(async () => {
    alice.disconnect();
    bob.disconnect();
    io.close();
    await new Promise((resolve) => httpServer.close(resolve));
  });

  await Promise.all([once(alice, 'connect'), once(bob, 'connect')]);
  assert.equal((await emitWithAck(alice, 'join', { username: 'Alice', room: 'General' })).ok, true);
  assert.equal((await emitWithAck(bob, 'join', { username: 'Bob', room: 'General' })).ok, true);

  const incoming = once(bob, 'newMessage');
  const sent = await emitWithAck(alice, 'sendMessage', { text: ' Hello ' });
  assert.equal(sent.ok, true);
  assert.equal((await incoming).text, 'Hello');
  assert.equal((await emitWithAck(alice, 'sendMessage', { text: ' ' })).ok, false);

  const privateIncoming = once(bob, 'newPrivateMessage');
  const privateAck = await emitWithAck(alice, 'privateMessage', {
    recipientId: bob.id,
    text: 'Secret',
  });
  assert.equal(privateAck.ok, true);
  assert.equal((await privateIncoming).text, 'Secret');
  assert.equal(
    (await emitWithAck(alice, 'privateMessage', { recipientId: alice.id, text: 'Nope' })).ok,
    false,
  );
});
