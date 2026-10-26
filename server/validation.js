const LIMITS = Object.freeze({
  username: 32,
  room: 64,
  message: 2000,
});
const { STICKERS, MEMES } = require('./mediaCatalog');

function cleanString(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function validateJoin(payload = {}) {
  const username = cleanString(payload.username, LIMITS.username);
  const room = cleanString(payload.room, LIMITS.room);

  if (!username || !room) {
    return { ok: false, error: 'Username and room are required.' };
  }

  return { ok: true, value: { username, room } };
}

function validateMessage(payload = {}) {
  const type = payload.type || 'text';
  if (!['text', 'sticker', 'meme'].includes(type)) {
    return { ok: false, error: 'Unsupported message type.' };
  }

  if (type === 'sticker' || type === 'meme') {
    const catalog = type === 'sticker' ? STICKERS : MEMES;
    if (typeof payload.assetId !== 'string' || !catalog[payload.assetId]) {
      return { ok: false, error: `Unknown ${type}.` };
    }
    return {
      ok: true,
      value: { type, assetId: payload.assetId, text: catalog[payload.assetId] },
    };
  }

  const rawText = typeof payload.text === 'string' ? payload.text.trim() : '';

  if (!rawText) return { ok: false, error: 'Message cannot be empty.' };
  if (rawText.length > LIMITS.message) {
    return { ok: false, error: `Message cannot exceed ${LIMITS.message} characters.` };
  }

  return { ok: true, value: { type: 'text', text: rawText } };
}

module.exports = { LIMITS, cleanString, validateJoin, validateMessage };
