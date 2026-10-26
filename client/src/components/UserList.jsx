import React from 'react';
import './UserList.css';

function UserList({ users, currentUserId, onUserSelect, unreadCounts = {} }) {
  return (
    <div className='user-list-container'>
      <h2>Online users <span>{users.length}</span></h2>
      <ul className='user-list'>
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          return (
            <li key={user.id} className='user-list-item'>
              <button
                className='user-button'
                type='button'
                onClick={() => onUserSelect(user)}
                disabled={isCurrentUser}
                title={isCurrentUser ? 'This is you' : `Private message ${user.username}`}
              >
                <span className='presence-dot' aria-hidden='true' />
                <span className='user-avatar' aria-hidden='true'>{user.username.charAt(0).toUpperCase()}</span>
                <span className='user-name'>{user.username}</span>
                {isCurrentUser && <span className='you-label'>you</span>}
                {!isCurrentUser && unreadCounts[user.id] > 0 && (
                  <span className='unread-badge' aria-label={`${unreadCounts[user.id]} unread private messages`}>
                    {unreadCounts[user.id] > 9 ? '9+' : unreadCounts[user.id]}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default UserList;
