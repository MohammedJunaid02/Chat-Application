import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
})

export function getReceiverSocketId(userId) 
{
    return userSocketMap[userId];
}

//used to store online users 
const userSocketMap = {}; //{userID : socketID}


io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if(userId) userSocketMap[userId] = socket.id;

    //io.emit() is used to send events to all the connected clients - inshort broadcast it to all
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

export { io, app, server };