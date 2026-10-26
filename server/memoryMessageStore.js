const { randomUUID } = require('crypto');

function createMemoryMessageStore() {
  const messages = [];

  return {
    async recent(room, limit = 50) {
      return messages.filter((message) => message.room === room).slice(-limit);
    },

    async create({ author, room, text, type = 'text', assetId = null }, senderId) {
      const message = {
        id: randomUUID(),
        text,
        type,
        assetId,
        sender: { id: senderId, username: author },
        room,
        timestamp: new Date().toISOString(),
      };
      messages.push(message);
      return message;
    },
  };
}

module.exports = { createMemoryMessageStore };
