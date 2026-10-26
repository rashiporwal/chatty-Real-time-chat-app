const Message = require('./models/Message');

function serializeMessage(message, senderId) {
  return {
    id: String(message._id),
    text: message.text,
    type: message.type || 'text',
    assetId: message.assetId || null,
    sender: {
      ...(senderId ? { id: senderId } : {}),
      username: message.author,
    },
    room: message.room,
    timestamp: message.createdAt,
  };
}

const messageStore = {
  async recent(room, limit = 50) {
    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return messages.reverse().map((message) => serializeMessage(message));
  },

  async create({ author, room, text, type = 'text', assetId = null }, senderId) {
    const message = await Message.create({ author, room, text, type, assetId });
    return serializeMessage(message, senderId);
  },
};

module.exports = { messageStore, serializeMessage };
