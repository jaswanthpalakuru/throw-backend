import express, { Application } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// 1. Express CORS
app.use(cors({
  origin: [
    'https://throw-frontend.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true,
}));

// 2. Socket.io CORS
export const io = new Server(httpServer, {
  cors: {
    origin: [
      'https://throw-frontend.vercel.app',
      'http://localhost:5173',
    ],
    credentials: true,
  }
});

import './connections';

httpServer.listen(3001, () => {
  console.log('throw signaling server running on http://localhost:3001')
});