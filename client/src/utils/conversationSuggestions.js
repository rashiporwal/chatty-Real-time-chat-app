const TOPICS = [
  'What made you smile today?',
  'What are you looking forward to this week?',
  'Share an unpopular opinion—keep it friendly 😄',
  'If you could travel anywhere tomorrow, where would you go?',
  'What song have you had on repeat lately?',
  'What is the best thing you watched recently?',
];

const contextualGroups = [
  { words: ['work','project','office','job'], ideas: ['What part of the project are you enjoying most?', 'What would make work easier this week?'] },
  { words: ['movie','show','series','watch'], ideas: ['Would you recommend it—and why?', 'Which character did you relate to most?'] },
  { words: ['food','eat','dinner','lunch'], ideas: ['What is your ultimate comfort food?', 'What dish should everyone try once?'] },
  { words: ['travel','trip','vacation'], ideas: ['Mountains, beaches, or a new city?', 'What is your most memorable travel moment?'] },
  { words: ['music','song','album'], ideas: ['Which song instantly improves your mood?', 'Who is an underrated artist you love?'] },
  { words: ['game','gaming','play'], ideas: ['What game could you replay forever?', 'Co-op or competitive games—which do you prefer?'] },
];

export function getConversationSuggestions(messages = [], room = '') {
  const recentText = messages.slice(-6).map((message) => message.text || '').join(' ').toLowerCase();
  const contextual = contextualGroups.find((group) => group.words.some((word) => recentText.includes(word)))?.ideas || [];
  const roomIdea = room ? `What brought everyone to “${room}” today?` : null;
  return [...contextual, roomIdea, ...TOPICS].filter(Boolean).slice(0, 5);
}
