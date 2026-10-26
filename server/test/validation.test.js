const test = require('node:test');
const assert = require('node:assert/strict');
const { LIMITS, validateJoin, validateMessage } = require('../validation');

test('join validation trims and normalizes names', () => {
  assert.deepEqual(validateJoin({ username: '  Ada   Lovelace ', room: ' general ' }), {
    ok: true,
    value: { username: 'Ada Lovelace', room: 'general' },
  });
});

test('join validation rejects missing values', () => {
  assert.equal(validateJoin({ username: 'Ada', room: ' ' }).ok, false);
});

test('message validation rejects blank and oversized messages', () => {
  assert.equal(validateMessage({ text: '  ' }).ok, false);
  assert.equal(validateMessage({ text: 'x'.repeat(LIMITS.message + 1) }).ok, false);
});

test('message validation preserves internal spacing and trims edges', () => {
  assert.deepEqual(validateMessage({ text: '  hello   world  ' }), {
    ok: true,
    value: { type: 'text', text: 'hello   world' },
  });
});

test('media validation accepts catalog items and rejects unknown assets', () => {
  assert.deepEqual(validateMessage({ type: 'sticker', assetId: 'party_blob' }), {
    ok: true,
    value: { type: 'sticker', assetId: 'party_blob', text: 'Party mode!' },
  });
  assert.equal(validateMessage({ type: 'meme', assetId: 'not-real' }).ok, false);
});
