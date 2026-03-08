import express, { Application } from 'express';
import  { createServer, Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: { origin: '*' }
});


httpServer.listen(3001, () => {
  console.log('throw signaling server running on http://localhost:3001')
})