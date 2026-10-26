import { describe, expect, it } from 'vitest';
import { mergeMessages } from './messages';

describe('mergeMessages', () => {
  it('deduplicates persisted messages by id', () => {
    const first = { id: '1', text: 'hello', timestamp: '2026-01-01T00:00:00.000Z' };
    expect(mergeMessages([first], [first])).toEqual([first]);
  });

  it('sorts messages chronologically', () => {
    const later = { id: '2', text: 'later', timestamp: '2026-01-02T00:00:00.000Z' };
    const earlier = { id: '1', text: 'earlier', timestamp: '2026-01-01T00:00:00.000Z' };
    expect(mergeMessages([later], [earlier]).map((message) => message.id)).toEqual(['1', '2']);
  });
});
