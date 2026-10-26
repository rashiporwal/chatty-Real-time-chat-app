# Chatty

Chatty is a small real-time room chat built with React, Express, Socket.IO, and MongoDB. Users choose a display name and room, exchange persistent public messages, see live presence and typing activity, and open temporary one-to-one conversations with people in the same room.

Existing deployment: [chatty-real-time-chat-app-b561.onrender.com](https://chatty-real-time-chat-app-b561.onrender.com/)

## Read this first

- This is a room-chat demo, not a production-secure messenger. There are no accounts or passwords, so usernames do not prove identity.
- With `DATABASE_URL`, public room messages are stored in MongoDB and the newest 50 are loaded when a user joins. Local development falls back to temporary memory storage when MongoDB is not configured.
- Private messages are only relayed to the two connected browser sessions. They are not stored, do not survive refreshes, and are not end-to-end encrypted.
- Presence is held in server memory. A production deployment using multiple Node processes needs a Socket.IO adapter (usually Redis) and the platform's required sticky-session configuration.
- Anyone who knows a room name can join it. The project currently has no invitations, moderation, attachments, read receipts, message editing/deletion, or per-user rate limits.
- Use Node.js 22.12 or newer. MongoDB must be reachable before the backend starts.

## Features

- Real-time public room messages with no recorded memory.
- Live room membership and reconnect-safe rejoining
- Typing indicators for multiple users
- Temporary, room-scoped private messages
- Built-in emoji, sticker, and meme picker for public and private chat
- Context-aware conversation ideas generated locally from recent messages
- Server-side validation and client-visible errors
- Refresh-safe room identity stored in `sessionStorage`
- Responsive and keyboard-accessible UI
- Health endpoint, graceful shutdown, and production SPA routing
- Server integration tests and client tests


