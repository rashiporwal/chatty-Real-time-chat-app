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

- Real-time public room messages with MongoDB history
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

## Project structure

```text
client/                 React + Vite browser application
  src/components/       Chat UI components
  src/pages/            Login and room screens
  src/utils/            Session and message helpers
server/                 Express + Socket.IO application
  models/Message.js     MongoDB public-message schema
  socketHandlers.js     Real-time event contract
  messageStore.js       MongoDB persistence adapter
  server.js             HTTP, CORS, health, and static hosting
  test/                 Node unit and socket integration tests
```

## Local setup

Prerequisites:

- Node.js 22.12+
- npm
- MongoDB locally or a MongoDB Atlas connection string if you want persistent history

Install dependencies:

```bash
cd server
npm install
cd ../client
npm install
```

For persistent message history, create the backend environment file:

```bash
cd server
copy .env.example .env
```

On macOS/Linux use `cp .env.example .env`. Set `DATABASE_URL` in `server/.env` to your MongoDB connection string. You can skip this during development; the server will use in-memory history that resets whenever it restarts.

Start the complete application from `client/`:

```bash
cd client
npm run dev
```

This starts both the backend and Vite. Open `http://localhost:5173`; the client connects to `http://localhost:5000` by default. To run them separately, use `npm run dev` in `server/` and `npm run client` in `client/`.

## Environment variables

### Server

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Production only | In-memory storage in development | MongoDB connection string |
| `PORT` | No | `5000` | HTTP and Socket.IO port |
| `CLIENT_URL` | No | Local Vite origins in development | Comma-separated allowed client origins when hosted separately |
| `NODE_ENV` | No | — | Set to `production` in production |
| `ALLOW_IN_MEMORY` | No | `false` in production | Allows production startup without MongoDB; history resets on restart |

### Client

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_SOCKET_URL` | No | `http://localhost:5000` in development; current origin in production | Socket server URL |

Environment values prefixed with `VITE_` are embedded in the browser build and must never contain secrets.

## Commands

From `client/`:

```bash
npm run dev       # backend and Vite together
npm run client    # Vite only
npm run build     # production build in client/dist
npm run preview   # preview the production bundle
npm test          # Vitest test suite
```

From `server/`:

```bash
npm run dev       # restart server on changes
npm start         # production server
npm test          # validation and Socket.IO integration tests
```

Health check: `GET /api/health` returns process uptime and MongoDB connection state.

## Production deployment

The Node server serves `client/dist` when that directory exists. A typical single-service build is:

```bash
cd client && npm ci && npm run build
cd ../server && npm ci --omit=dev && npm start
```

Set `NODE_ENV=production` and `DATABASE_URL`. If the client is hosted on another origin, also set `CLIENT_URL` and build the client with `VITE_SOCKET_URL` pointing at the server. If both are served by this Node process, leave `VITE_SOCKET_URL` unset so the browser uses the current origin.

For Render, the repository includes `render.yaml`. It builds both applications, starts the Node service, configures `/api/health`, and permits temporary in-memory storage until a `DATABASE_URL` secret is supplied. Add `DATABASE_URL` in the Render dashboard for persistent public-room history.

## Socket event contract

Client to server:

- `join({ username, room }, acknowledgement)`
- `sendMessage({ type, text?, assetId? }, acknowledgement)`
- `typing()` / `stopTyping()`
- `privateMessage({ recipientId, type, text?, assetId? }, acknowledgement)`
- `leave()`

Server to client:

- `chatHistory(messages)` and `newMessage(message)`
- `message(systemMessage)`
- `roomData({ room, users })`
- `userTyping(user)` / `userStoppedTyping(user)`
- `newPrivateMessage(message)`
- `errorMessage(text)`

Acknowledgements use `{ ok: true, value }` or `{ ok: false, error }`.

Supported message types are `text`, `sticker`, and `meme`. Sticker and meme identifiers are validated against the server catalog. Conversation suggestions run entirely in the browser; recent chat text is not sent to an AI or third-party recommendation service.

## Verification

Before releasing:

```bash
cd server && npm test && npm audit
cd ../client && npm test && npm run build && npm audit
```

Then open two browser windows, join the same room with different names, and verify public messages, timestamps, typing, presence, private messages, refresh/reconnect, leaving, and the mobile layout.

## Troubleshooting

- **`DATABASE_URL is required in production`**: create `server/.env` from `.env.example`. It is optional in development.
- **MongoDB connection timeout**: check the URI, Atlas IP allowlist, database user, firewall, and network.
- **Client remains disconnected**: start the server, verify port 5000, and check `VITE_SOCKET_URL`/`CLIENT_URL`.
- **CORS error in production**: set `CLIENT_URL` to the exact browser origin, including `https://` and without a path.
- **Direct routes return 404**: deploy the built `client/dist` with the Node server or configure the static host with an SPA fallback to `index.html`.
