import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import socket from '../socket';
import MediaPicker from './MediaPicker';
import { memeById, stickerById } from '../utils/mediaCatalog';
import './PrivateChatWindow.css';

function PrivatePayload({ message }) {
  const sticker = message.type === 'sticker' ? stickerById[message.assetId] : null;
  const meme = message.type === 'meme' ? memeById[message.assetId] : null;
  if (sticker) return <div className={`sent-sticker ${sticker.tone}`}><span>{sticker.emoji}</span><small>{sticker.label}</small></div>;
  if (meme) return <div className={`sent-meme ${meme.tone}`}><span>{meme.title}</span><b>{meme.icon}</b><strong>{meme.punchline}</strong></div>;
  return <span>{message.text}</span>;
}

function PrivateChatWindow({ targetUser, onClose, messages, onError }) {
  const [privateMessage, setPrivateMessage] = useState('');
  const [showMedia, setShowMedia] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') showMedia ? setShowMedia(false) : onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showMedia]);

  const sendPrivate = (payload, clearText = false) => {
    if (isSending) return;
    setIsSending(true);
    socket.timeout(5000).emit('privateMessage', { recipientId: targetUser.id, ...payload }, (timeoutError, response) => {
      setIsSending(false);
      if (timeoutError || !response?.ok) {
        onError(timeoutError ? 'The private message timed out.' : response?.error);
        return;
      }
      if (clearText) setPrivateMessage('');
      setShowMedia(false);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = privateMessage.trim();
    if (text) sendPrivate({ type: 'text', text }, true);
  };

  const insertEmoji = (emoji) => {
    setPrivateMessage((current) => `${current}${emoji}`);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className='private-chat-overlay' role='presentation' onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className='private-chat-window' role='dialog' aria-modal='true' aria-labelledby='private-chat-title'>
        <header className='private-chat-header'>
          <div><span>Private conversation</span><h2 id='private-chat-title'>{targetUser.username}</h2></div>
          <button className='close-button' type='button' onClick={onClose} aria-label='Close private chat'>×</button>
        </header>
        <div className='private-chat-messages' aria-live='polite'>
          {messages.length === 0 && <p>Private messages are temporary and are not saved.</p>}
          <ul>{messages.map((message) => (
            <li key={message.id} className={`${message.sender.id === socket.id ? 'my-private-message' : 'their-private-message'} ${message.type !== 'text' ? 'private-media-message' : ''}`}>
              <div className='message-content'>
                <PrivatePayload message={message} />
                <time className='private-message-timestamp' dateTime={message.timestamp}>{format(new Date(message.timestamp), 'p')}</time>
              </div>
            </li>
          ))}</ul>
          <div ref={messagesEndRef} />
        </div>
        <form className='private-chat-input' onSubmit={handleSubmit}>
          {showMedia && <MediaPicker onEmoji={insertEmoji} onMedia={(payload) => sendPrivate(payload)} onClose={() => setShowMedia(false)} />}
          <button className={`private-media-button ${showMedia ? 'active' : ''}`} type='button' onClick={() => setShowMedia((value) => !value)} aria-label='Add emoji, sticker or meme'>☺</button>
          <label className='sr-only' htmlFor='private-message'>Private message</label>
          <input ref={inputRef} id='private-message' type='text' placeholder={`Message ${targetUser.username}…`} value={privateMessage} onChange={(event) => setPrivateMessage(event.target.value)} maxLength={2000} autoComplete='off' autoFocus />
          <button className='sendBtn' type='submit' disabled={isSending || !privateMessage.trim()}>{isSending ? '…' : 'Send'}</button>
        </form>
      </section>
    </div>
  );
}

export default PrivateChatWindow;
