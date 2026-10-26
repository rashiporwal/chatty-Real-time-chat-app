export const EMOJI_GROUPS = [
  { name: 'Popular', items: ['😀','😂','🥹','😍','🥰','😎','🤩','😭','😅','🤔','🫡','🫶'] },
  { name: 'Reactions', items: ['👍','👏','🙌','🔥','✨','💯','❤️','💜','🎉','👀','🤝','🙏'] },
  { name: 'Fun', items: ['🤣','😜','🤯','🥳','😴','🤓','😈','💀','🙈','🍿','☕','🚀'] },
];

export const STICKERS = [
  { id: 'party_blob', emoji: '🥳', label: 'Party mode!', tone: 'violet' },
  { id: 'big_laugh', emoji: '🤣', label: 'That is hilarious!', tone: 'cyan' },
  { id: 'heart_pop', emoji: '💖', label: 'Sending love', tone: 'pink' },
  { id: 'mind_blown', emoji: '🤯', label: 'Mind blown', tone: 'orange' },
  { id: 'thumbs_up', emoji: '👍', label: 'Sounds good!', tone: 'blue' },
  { id: 'coffee_time', emoji: '☕', label: 'Coffee time', tone: 'amber' },
];

export const MEMES = [
  { id: 'this_is_fine', icon: '🔥', title: 'Everything breaks', punchline: 'This is fine.', tone: 'orange' },
  { id: 'plot_twist', icon: '🎭', title: 'Nobody expected it', punchline: 'PLOT TWIST', tone: 'violet' },
  { id: 'loading_brain', icon: '🧠', title: 'Trying to understand', punchline: 'BRAIN LOADING…', tone: 'cyan' },
  { id: 'noted', icon: '📝', title: 'Very important information', punchline: 'NOTED.', tone: 'blue' },
  { id: 'same_energy', icon: '⚡', title: 'You and me right now', punchline: 'SAME ENERGY', tone: 'pink' },
  { id: 'mission_passed', icon: '🏆', title: 'We actually did it', punchline: 'MISSION PASSED', tone: 'green' },
];

export const stickerById = Object.fromEntries(STICKERS.map((item) => [item.id, item]));
export const memeById = Object.fromEntries(MEMES.map((item) => [item.id, item]));
