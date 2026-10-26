import React, { useEffect, useMemo, useRef, useState } from 'react';
import socket from '../socket';
import MediaPicker from './MediaPicker';
import { getConversationSuggestions } from '../utils/conversationSuggestions';
import './MessageInput.css';

function MessageInput({ disabled = false, onError, messages = [], room = '' }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const typingTimer = useRef(null);
  const inputRef = useRef(null);
  const suggestions = useMemo(() => getConversationSuggestions(messages, room), [messages, room]);

  const stopTyping = () => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = null;
    socket.emit('stopTyping');
  };

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setActivePanel(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const sendPayload = (payload, { clearText = false } = {}) => {
    if (disabled || isSending) return;
    setIsSending(true);
    socket.timeout(5000).emit('sendMessage', payload, (timeoutError, response) => {
      setIsSending(false);
      if (timeoutError || !response?.ok) {
        onError(timeoutError ? 'The message timed out. Try again.' : response?.error);
        return;
      }
      if (clearText) setMessage('');
      setActivePanel(null);
    });
    stopTyping();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = message.trim();
    if (text) sendPayload({ type: 'text', text }, { clearText: true });
  };

  const handleChange = (event) => {
    setMessage(event.target.value);
    socket.emit('typing');
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, 1200);
  };

  const insertEmoji = (emoji) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? message.length;
    const end = input?.selectionEnd ?? message.length;
    const nextMessage = `${message.slice(0, start)}${emoji}${message.slice(end)}`;
    setMessage(nextMessage);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const chooseSuggestion = (suggestion) => {
    setMessage(suggestion);
    setActivePanel(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <form className='message-form' onSubmit={handleSubmit}>
      {activePanel === 'media' && (
        <MediaPicker
          onEmoji={insertEmoji}
          onMedia={(payload) => sendPayload(payload)}
          onClose={() => setActivePanel(null)}
        />
      )}
      {activePanel === 'ideas' && (
        <section className='ideas-panel' aria-label='Conversation ideas'>
          <header><div><span>Conversation spark</span><strong>What could you talk about next?</strong></div><button type='button' onClick={() => setActivePanel(null)} aria-label='Close conversation ideas'>×</button></header>
          <div>{suggestions.map((suggestion) => <button type='button' key={suggestion} onClick={() => chooseSuggestion(suggestion)}><span>↗</span>{suggestion}</button>)}</div>
        </section>
      )}

      <div className='message-input-shell'>
        <div className='composer-tools'>
          <button type='button' data-tooltip='Emoji, stickers & memes' className={activePanel === 'media' ? 'active' : ''} onClick={() => setActivePanel((current) => current === 'media' ? null : 'media')} aria-label='Add emoji, sticker or meme' aria-expanded={activePanel === 'media'}>☺</button>
          <button type='button' data-tooltip='Conversation ideas' className={activePanel === 'ideas' ? 'active idea-tool' : 'idea-tool'} onClick={() => setActivePanel((current) => current === 'ideas' ? null : 'ideas')} aria-label='Show conversation ideas' aria-expanded={activePanel === 'ideas'}>✦</button>
        </div>
        <label className='sr-only' htmlFor='room-message'>Message</label>
        <input ref={inputRef} id='room-message' type='text' className='message-input' placeholder={disabled ? 'Connecting to chat…' : 'Write a message…'} value={message} onChange={handleChange} onBlur={stopTyping} maxLength={2000} disabled={disabled || isSending} autoComplete='off' />
        {message.length > 1800 && <span className='character-count'>{message.length}/2000</span>}
      </div>
      <button type='submit' className='send-button' disabled={disabled || isSending || !message.trim()} aria-label='Send message'>
        <span>{isSending ? 'Sending' : 'Send'}</span>
        <svg viewBox='0 0 24 24' aria-hidden='true'><path d='M3.4 20.4 21 12 3.4 3.6l.1 6.5L15 12 3.5 13.9l-.1 6.5Z' /></svg>
      </button>
    </form>
  );
}

export default MessageInput;
