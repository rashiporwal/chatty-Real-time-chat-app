const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { messageStore } = require('./messageStore');
const { registerSocketHandlers } = require('./socketHandlers');

function getAllowedOrigins() {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL.split(',').map((value) => value.trim()).filter(Boolean);
  }

  return process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];
}

function createChatServer({ store = messageStore, serveClient = true, storage = 'mongodb' } = {}) {
  const app = express();
  const httpServer = http.createServer(app);
  const allowedOrigins = getAllowedOrigins();

  app.disable('x-powered-by');
  app.use(cors({ origin: allowedOrigins, credentials: true }));

  app.get('/api/health', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      storage,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
    maxHttpBufferSize: 100_000,
  });

  const users = registerSocketHandlers(io, store);
  const buildPath = path.join(__dirname, '..', 'client', 'dist');

  if (serveClient && fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('/{*splat}', (_request, response) => {
      response.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    app.use((_request, response) => {
      response.status(404).json({ error: 'Not found' });
    });
  }

  return { app, httpServer, io, users };
}

module.exports = { createChatServer, getAllowedOrigins };
