// One reason only — to enforce the 2 person limit. we have it on our side also. 

import { io } from "./server";
import { ThrowSocket } from "./types";

// socket io wont limit the number of connections to 2 automatically so we are handling it
const rooms = new Map();

// io.on('connection', (socket) => {
//    this runs ONCE per browser that connects
// })
// So if Tab 1 opens — this runs once. Socket.io creates a `socket` object representing Tab 1's connection and hands it to you.
// If Tab 2 opens — this runs again. A completely separate `socket` object for Tab 2.
// **Every browser gets its own `socket` object. That object IS that browser's connection.**

// ## What is `socket` Exactly?
// Think of `socket` as a **dedicated phone line** to one specific browser.

// Browser Tab 1  ←──── socket_A ────→  Your Server
// Browser Tab 2  ←──── socket_B ────→  Your Server

// Each socket has:
// socket.id — unique auto-generated ID for this connection
// socket.on(event, handler) — listen for messages FROM this browser
// socket.emit(event, data) — send a message TO this browser
// socket.join(roomId) — add this browser to a room
// socket.to(roomId).emit(...) — send to everyone in room EXCEPT this browser


// io — The Server Itself -  io is the entire Socket.io server. It represents all connections, all rooms, everything.
// socket — One Single Browser's Connection - is one specific browser's connection. One phone line.

io.on("connection", (socket: ThrowSocket) => {
    console.log(`socket ID - ${socket.id}`);

    // join room
    socket.on('join-room', (roomId) => {
        if(!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }

        const room = rooms.get(roomId);

        if(room.size >= 2) {
            socket.emit('room-full');
            return;
        }

        // this will create the room if it doesnt exist yet.
        socket.join(roomId);
        room.add(socket.id);
        socket.roomId = roomId;

        console.log(`[~] room ${roomId} now has ${room.size} peer(s)`)

        if(room.size == 1) {
            socket.emit('room-created', roomId)
        } else {
            // only the person who just joined hears this
            socket.emit('you-joined-the-room', roomId); 
            // only the OTHER person already in the room hears this. the person who just joined does NOT hear this
            socket.to(roomId).emit('someone-else-joined-the-room') 
        }


        // ── signaling relay ────────────────────────────────────────────────────────
        // These three are pure relay — server never reads the contents
        // Your server carried the SDP and ICE candidates between the two browsers. 
        // But the actual handshake, the actual connection — that happened inside the browsers using the WebRTC engine built into Chrome/Firefox.

        socket.on('offer', (sdp: RTCSessionDescriptionInit) => {
            socket.to(socket.roomId!).emit('offer', sdp)
        })

        socket.on('answer', (sdp: RTCSessionDescriptionInit) => {
            socket.to(socket.roomId!).emit('answer', sdp)
        })

        socket.on('ice-candidate', (candidate) => {
            socket.to(socket.roomId!).emit('ice-candidate', candidate)
        })


        socket.on('disconnect', () => {
            console.log(`[-] disconnected: ${socket.id}`)

            if (!socket.roomId) return

            const room = rooms.get(socket.roomId)
            if (room) {
            room.delete(socket.id)
            socket.to(socket.roomId).emit('peer-disconnected')

            if (room.size === 0) {
                rooms.delete(socket.roomId)
                console.log(`[~] room ${socket.roomId} deleted`)
            }
            }
        })
    })
});
