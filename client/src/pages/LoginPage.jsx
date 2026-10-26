import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveIdentity } from '../utils/session';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const identity = { username: username.trim(), room: room.trim() };

    if (!identity.username || !identity.room) {
      setError('Enter both a username and room name.');
      return;
    }

    saveIdentity(identity);
    navigate('/chat', { state: identity });
  };

  return (
    <main className='login-page'>
      <section className='login-form-container' aria-labelledby='join-heading'>
        <div className='brand-mark' aria-hidden='true'>C</div>
        <p className='eyebrow'>Real-time conversations</p>
        <h1 id='join-heading'>Join a chat room</h1>
        <p className='login-intro'>Pick a display name and enter a room shared with your friends.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className='form-group'>
            <label htmlFor='username'>Username</label>
            <input
              type='text'
              id='username'
              placeholder='e.g. Ada'
              required
              maxLength={32}
              autoComplete='nickname'
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='room'>Room</label>
            <input
              type='text'
              id='room'
              placeholder='e.g. product-team'
              required
              maxLength={64}
              autoComplete='off'
              value={room}
              onChange={(event) => setRoom(event.target.value)}
            />
          </div>
          {error && <p className='form-error' role='alert'>{error}</p>}
          <button type='submit' className='form-button'>Join room</button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
