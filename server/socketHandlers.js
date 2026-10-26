const { validateJoin, validateMessage } = require('./validation');

function acknowledge(callback, payload) {
  if (typeof callback === 'function') callback(payload);
}

function systemMessage(text) {
  return {
    id: `system-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    user: 'Admin',
    text,
    timestamp: new Date().toISOString(),
    system: true,
  };
}

function registerSocketHandlers(io, store, users = new Map()) {
  const usersInRoom = (room) =>
    [...users.entries()]
      .filter(([, user]) => user.room === room)
      .map(([id, user]) => ({ id, username: user.username }));

  const emitRoomData = (room) => {
    io.to(room).emit('roomData', { room, users: usersInRoom(room) });
  };

  io.on('connection', (socket) => {
    const leaveCurrentRoom = ({ announce = true } = {}) => {
      const user = users.get(socket.id);
      if (!user) return;

      users.delete(socket.id);
      socket.leave(user.room);

      if (announce) {
        socket.broadcast
          .to(user.room)
          .emit('message', systemMessage(`${user.username} has left the chat.`));
      }
      emitRoomData(user.room);
    };

    socket.on('join', async (payload, callback) => {
      const result = validateJoin(payload);
      if (!result.ok) return acknowledge(callback, result);

      const { username, room } = result.value;
      const previousUser = users.get(socket.id);
      if (previousUser) {
        leaveCurrentRoom({
          announce: previousUser.room !== room || previousUser.username !== username,
        });
      }

      socket.join(room);
      users.set(socket.id, { username, room });

      try {
        socket.emit('chatHistory', await store.recent(room, 50));
      } catch (error) {
        console.error('Unable to fetch chat history:', error.message);
        socket.emit('errorMessage', 'Chat history is temporarily unavailable.');
      }

      socket.emit('message', systemMessage(`Welcome to ${room}, ${username}!`));
      socket.broadcast
        .to(room)
        .emit('message', systemMessage(`${username} has joined the chat!`));
      emitRoomData(room);
      acknowledge(callback, { ok: true, value: { username, room } });
    });

    socket.on('sendMessage', async (payload, callback) => {
      const user = users.get(socket.id);
      if (!user) {
        return acknowledge(callback, { ok: false, error: 'Join a room before sending messages.' });
      }

      const result = validateMessage(payload);
      if (!result.ok) return acknowledge(callback, result);

      try {
        const message = await store.create(
          { author: user.username, room: user.room, ...result.value },
          socket.id,
        );
        io.to(user.room).emit('newMessage', message);
        acknowledge(callback, { ok: true, value: message });
      } catch (error) {
        console.error('Unable to save message:', error.message);
        acknowledge(callback, { ok: false, error: 'Message could not be sent.' });
      }
    });

    socket.on('typing', () => {
      const user = users.get(socket.id);
      if (user) {
        socket.broadcast.to(user.room).emit('userTyping', {
          id: socket.id,
          username: user.username,
        });
      }
    });

    socket.on('stopTyping', () => {
      const user = users.get(socket.id);
      if (user) {
        socket.broadcast.to(user.room).emit('userStoppedTyping', {
          id: socket.id,
          username: user.username,
        });
      }
    });

    socket.on('privateMessage', (payload = {}, callback) => {
      const sender = users.get(socket.id);
      const recipient = users.get(payload.recipientId);
      const result = validateMessage(payload);

      if (!sender) {
        return acknowledge(callback, { ok: false, error: 'Join a room before sending messages.' });
      }
      if (!result.ok) return acknowledge(callback, result);
      if (!recipient || recipient.room !== sender.room) {
        return acknowledge(callback, { ok: false, error: 'That user is no longer in this room.' });
      }
      if (payload.recipientId === socket.id) {
        return acknowledge(callback, { ok: false, error: 'Choose another user for a private chat.' });
      }

      const message = {
        id: `private-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: result.value.text,
        type: result.value.type,
        assetId: result.value.assetId || null,
        sender: { id: socket.id, username: sender.username },
        recipient: { id: payload.recipientId, username: recipient.username },
        timestamp: new Date().toISOString(),
      };

      io.to(payload.recipientId).emit('newPrivateMessage', message);
      socket.emit('newPrivateMessage', message);
      acknowledge(callback, { ok: true, value: message });
    });

    socket.on('leave', () => leaveCurrentRoom());
    socket.on('disconnect', () => leaveCurrentRoom());
  });

  return users;
}

module.exports = { registerSocketHandlers, systemMessage };
