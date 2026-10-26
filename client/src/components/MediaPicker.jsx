import React, { useMemo, useState } from 'react';
import { EMOJI_GROUPS, MEMES, STICKERS } from '../utils/mediaCatalog';
import './MediaPicker.css';

function MediaPicker({ onEmoji, onMedia, onClose }) {
  const [tab, setTab] = useState('emoji');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const stickers = useMemo(() => STICKERS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [query]);
  const memes = useMemo(() => MEMES.filter((item) => `${item.title} ${item.punchline}`.toLowerCase().includes(query.toLowerCase())), [query]);

  const selectTab = (nextTab) => {
    setTab(nextTab);
    setSelected(null);
    setQuery('');
  };

  return (
    <section className='media-picker' aria-label='Emoji, sticker and meme picker'>
      <header className='picker-header'>
        <div className='picker-tabs' role='tablist'>
          {['emoji','sticker','meme'].map((item) => (
            <button key={item} type='button' role='tab' aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => selectTab(item)}>
              {item === 'emoji' ? '😊 Emoji' : item === 'sticker' ? '✨ Stickers' : '🎭 Memes'}
            </button>
          ))}
        </div>
        <button type='button' className='picker-close' onClick={onClose} aria-label='Close media picker'>×</button>
      </header>

      {tab !== 'emoji' && (
        <input className='picker-search' value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${tab}s…`} aria-label={`Search ${tab}s`} />
      )}

      <div className='picker-content'>
        {tab === 'emoji' && EMOJI_GROUPS.map((group) => (
          <div className='emoji-group' key={group.name}>
            <span>{group.name}</span>
            <div className='emoji-grid'>{group.items.map((emoji) => <button key={emoji} type='button' onClick={() => onEmoji(emoji)}>{emoji}</button>)}</div>
          </div>
        ))}
        {tab === 'sticker' && <div className='sticker-grid'>{stickers.map((item) => (
          <button key={item.id} type='button' className={`sticker-option ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => setSelected({ type: 'sticker', ...item })}>
            <span className={`sticker-art ${item.tone}`}>{item.emoji}</span><span>{item.label}</span>
          </button>
        ))}</div>}
        {tab === 'meme' && <div className='meme-grid'>{memes.map((item) => (
          <button key={item.id} type='button' className={`meme-option ${item.tone} ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => setSelected({ type: 'meme', ...item })}>
            <span>{item.title}</span><b>{item.icon}</b><strong>{item.punchline}</strong>
          </button>
        ))}</div>}
      </div>

      {selected && (
        <footer className='picker-preview'>
          <span>Selected: {selected.label || selected.punchline}</span>
          <button type='button' onClick={() => onMedia({ type: selected.type, assetId: selected.id })}>Send</button>
        </footer>
      )}
    </section>
  );
}

export default MediaPicker;
