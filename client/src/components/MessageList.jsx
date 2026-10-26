import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { memeById, stickerById } from '../utils/mediaCatalog';
import './MessageList.css';

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : format(date, 'p');
}

function MessagePayload({ message }) {
  if (message.type === 'sticker' && stickerById[message.assetId]) {
    const sticker = stickerById[message.assetId];
    return <div className={`sent-sticker ${sticker.tone}`}><span>{sticker.emoji}</span><small>{sticker.label}</small></div>;
  }
  if (message.type === 'meme' && memeById[message.assetId]) {
    const meme = memeById[message.assetId];
    return <div className={`sent-meme ${meme.tone}`}><span>{meme.title}</span><b>{meme.icon}</b><strong>{meme.punchline}</strong></div>;
  }
  const emojiOnly = message.text?.length <= 16 && !/[\p{L}\p{N}]/u.test(message.text);
  return <div className={`message-text ${emojiOnly ? 'emoji-only' : ''}`}>{message.text}</div>;
}

function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [messages]);

  return (
    <div className='message-list-container' aria-live='polite' aria-label='Room messages'>
      {messages.length === 0 && (
        <div className='empty-messages'>No messages yet. Start the conversation.</div>
      )}
      <ul className='message-list'>
        {messages.map((message, index) => {
          const mine = message.sender?.id === currentUserId;
          return (
            <li
              key={message.id || `${message.timestamp}-${index}`}
              className={`message-item ${mine ? 'my-message' : 'their-message'} ${message.system ? 'system-message' : ''} ${message.type && message.type !== 'text' ? 'media-message' : ''}`}
            >
              <article className='message-content'>
                <div className='message-author'>
                  {mine ? 'You' : message.sender?.username || message.user || 'Unknown'}
                </div>
                <MessagePayload message={message} />
                {message.timestamp && (
                  <time className='message-timestamp' dateTime={message.timestamp}>
                    {formatTime(message.timestamp)}
                  </time>
                )}
              </article>
            </li>
          );
        })}
      </ul>
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
