import { describe, expect, it } from 'vitest';
import { getConversationSuggestions } from './conversationSuggestions';

describe('getConversationSuggestions', () => {
  it('uses recent conversation context and the room name', () => {
    const suggestions = getConversationSuggestions([{ text: 'This project is going well' }], 'design');
    expect(suggestions[0]).toMatch(/project/i);
    expect(suggestions.some((suggestion) => suggestion.includes('design'))).toBe(true);
  });
});
