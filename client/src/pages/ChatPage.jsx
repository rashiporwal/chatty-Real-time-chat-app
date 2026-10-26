import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import socket from '../socket';
import UserList from '../components/UserList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import PrivateChatWindow from '../components/PrivateChatWindow';
import { clearIdentity, readIdentity } from '../utils/session';
import { mergeMessages } from '../utils/messages';
import './ChatPage.css';

function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const identity = useMemo(() => {
    const candidate = location.state || readIdentity();
    return candidate?.username && candidate?.room ? candidate : null;
  }, [location.state]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [privateMessages, setPrivateMessages] = useState({});
  const [privateUnread, setPrivateUnread] = useState({});
  const [privateChatTarget, setPrivateChatTarget] = useState(null);
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState('');
  const typingTimers = useRef(new Map());
  const privateTargetRef = useRef(null);

  useEffect(() => {
    privateTargetRef.current = privateChatTarget;
  }, [privateChatTarget]);

  useEffect(() => {
    if (!identity) return undefined;

    const addMessages = (incoming) => {
      const list = Array.isArray(incoming) ? incoming : [incoming];
      setMessages((current) => mergeMessages(current, list));
    };

    const joinRoom = () => {
      setStatus('joining');
      socket.timeout(5000).emit('join', identity, (timeoutError, response) => {
        if (timeoutError) {
          setStatus('error');
          setError('The server did not respond. Check that it is running.');
          return;
        }
        if (!response?.ok) {
          setStatus('error');
          setError(response?.error || 'Unable to join the room.');
          return;
        }
        setStatus('connected');
        setError('');
      });
    };

    const handleRoomData = (data) => {
      setUsers(data.users || []);
      setPrivateChatTarget((target) =>
        target && !data.users?.some((user) => user.id === target.id) ? null : target,
      );
    };

    const handleTyping = ({ id, username }) => {
      const existingTimer = typingTimers.current.get(id);
      if (existingTimer) clearTimeout(existingTimer);
      setTypingUsers((current) => ({ ...current, [id]: username }));
      typingTimers.current.set(id, setTimeout(() => {
        setTypingUsers((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
        typingTimers.current.delete(id);
      }, 2500));
    };

    const handleStoppedTyping = ({ id }) => {
      const timer = typingTimers.current.get(id);
      if (timer) clearTimeout(timer);
      typingTimers.current.delete(id);
      setTypingUsers((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    };

    const handlePrivateMessage = (message) => {
      const otherUserId = message.sender.id === socket.id
        ? message.recipient.id
        : message.sender.id;
      setPrivateMessages((current) => ({
        ...current,
        [otherUserId]: [...(current[otherUserId] || []), message],
      }));
      if (message.sender.id !== socket.id && privateTargetRef.current?.id !== otherUserId) {
        setPrivateUnread((current) => ({
          ...current,
          [otherUserId]: (current[otherUserId] || 0) + 1,
        }));
      }
    };

    const handleDisconnect = () => {
      setStatus('disconnected');
      setUsers([]);
      setTypingUsers({});
    };

    socket.on('connect', joinRoom);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', () => {
      setStatus('error');
      setError('Cannot connect to the chat server. Retrying…');
    });
    socket.on('message', addMessages);
    socket.on('newMessage', addMessages);
    socket.on('chatHistory', addMessages);
    socket.on('roomData', handleRoomData);
    socket.on('userTyping', handleTyping);
    socket.on('userStoppedTyping', handleStoppedTyping);
    socket.on('newPrivateMessage', handlePrivateMessage);
    socket.on('errorMessage', setError);

    if (socket.connected) joinRoom();
    else socket.connect();

    return () => {
      if (socket.connected) socket.emit('leave');
      socket.off('connect', joinRoom);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error');
      socket.off('message', addMessages);
      socket.off('newMessage', addMessages);
      socket.off('chatHistory', addMessages);
      socket.off('roomData', handleRoomData);
      socket.off('userTyping', handleTyping);
      socket.off('userStoppedTyping', handleStoppedTyping);
      socket.off('newPrivateMessage', handlePrivateMessage);
      socket.off('errorMessage', setError);
      typingTimers.current.forEach(clearTimeout);
      typingTimers.current.clear();
      socket.disconnect();
    };
  }, [identity]);

  if (!identity) return <Navigate to='/' replace />;

  const handleLeave = () => {
    clearIdentity();
    navigate('/', { replace: true });
  };
  const handleUserSelect = (user) => {
    setPrivateChatTarget(user);
    setPrivateUnread((current) => ({ ...current, [user.id]: 0 }));
  };
  const typingNames = Object.values(typingUsers);
  const typingText = typingNames.length > 1
    ? `${typingNames.slice(0, 2).join(' and ')} are typing…`
    : typingNames.length === 1 ? `${typingNames[0]} is typing…` : '';

  return (
    <main className='chat-page'>
      <section className='chat-container' aria-label={`Chat room ${identity.room}`}>
        <aside className='sidebar'>
          <div className='app-brand'>
            <span className='app-logo' aria-hidden='true'>C</span>
            <span>Chatty</span>
          </div>
          <div className='room-heading'>
            <span className='room-label'>Room</span>
            <h1>{identity.room}</h1>
            <span className={`connection-status ${status}`}>{status}</span>
          </div>
          <UserList
            users={users}
            currentUserId={socket.id}
            onUserSelect={handleUserSelect}
            unreadCounts={privateUnread}
          />
          <button className='leave-button' type='button' onClick={handleLeave}>Leave room</button>
        </aside>
        <div className='chat-main'>
          <header className='chat-header'>
            <div className='profile-summary'>
              <span className='profile-avatar' aria-hidden='true'>{identity.username.charAt(0).toUpperCase()}</span>
              <div>
                <span className='room-label'>Signed in as</span>
                <h2>{identity.username}</h2>
              </div>
            </div>
            <span className='online-summary'><i aria-hidden='true' />{users.length} online</span>
          </header>
          {error && <div className='chat-error' role='alert'>{error}</div>}
          <MessageList messages={messages} currentUserId={socket.id} />
          {typingText && <div className='typing-indicator' aria-live='polite'>{typingText}</div>}
          <MessageInput disabled={status !== 'connected'} onError={setError} messages={messages} room={identity.room} />
        </div>
      </section>

      {privateChatTarget && (
        <PrivateChatWindow
          targetUser={privateChatTarget}
          onClose={() => setPrivateChatTarget(null)}
          messages={privateMessages[privateChatTarget.id] || []}
          onError={setError}
        />
      )}
    </main>
  );
}

export default ChatPage;
