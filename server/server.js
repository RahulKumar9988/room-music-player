const io = require("socket.io")(process.env.PORT || 3001, {
  cors: {
    // origin: "http://localhost:3000",  
    origin: "https://room-music-player-servcer.vercel.app",
  },
});

let roomVideoState = {}; // Store the current video state per room
let roomMessages = {}; // Store messages per room
let userNames = {}; // Store user names per socket ID

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining a room
  socket.on("join-room", (roomId, userName) => {
    socket.join(roomId);

    // Store the user's name mapped to their socket ID
    userNames[socket.id] = { roomId, userName };

    console.log(`User ${userName} joined room ${roomId}`);

    io.to(roomId).emit("room-users", getUsersInRoom(roomId));

    // Send current video state to the new user
    if (roomVideoState[roomId]) {
      const { videoId, isPlaying } = roomVideoState[roomId];
      socket.emit("play-video", videoId);
      socket.emit("video-state", isPlaying);
    }

    // Send previous messages to the new user
    if (roomMessages[roomId]) {
      socket.emit("receive-message", roomMessages[roomId]);
    }
  });

  socket.on("leaveGroup", ({ userId }) => {
    console.log(`User ${userId} has left the group`);
    
    // Broadcast to all users that this user has left
    socket.broadcast.emit("userLeft", { userId });

    // Disconnect the socket (optional)
    socket.disconnect();
  });

  // Handle video play event
  socket.on("play-video", (roomId, videoId, videoTitle) => {
    if (!videoId) {
        console.error("Received undefined videoId in play-video event");
        return;
    }
    
    console.log("play-video:", roomId, videoId, videoTitle);
    
    roomVideoState[roomId] = { videoId, videoTitle, isPlaying: true };  
    
    // Broadcast to all clients in the room
    io.to(roomId).emit("play-video", videoId, videoTitle);
    io.to(roomId).emit("video-state", true);
});

  // Handle video pause event
  socket.on("pause-video", (roomId) => {
    if (!roomVideoState[roomId]) {
      console.error(`Room ${roomId} video state not found`);
      return;
    }

    roomVideoState[roomId].isPlaying = false;
    io.to(roomId).emit("pause-video");
    io.to(roomId).emit("video-state", false);
  });

  // Handle message sending
  socket.on("send-message", (data) => {
    const { roomId, message, senderId, type, content, replyTo } = data;

    // Get userName from the stored data
    const userName = userNames[socket.id]?.userName || "Anonymous";
    
    console.log("Received message:", { ...data, userName });

    if (!roomMessages[roomId]) {
        roomMessages[roomId] = [];
    }

    // Store the message with all data including replyTo
    roomMessages[roomId].push({ type, message, senderId, content, userName, replyTo });

    // Broadcast the message to everyone in the room with replyTo data
    io.to(roomId).emit("receive-message", { 
        type, 
        message, 
        senderId, 
        content, 
        userName, 
        replyTo 
    });
});

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove the user from the tracking list
    const userInfo = userNames[socket.id];
    if (userInfo) {
      const { roomId, userName } = userInfo;
      delete userNames[socket.id];
      console.log(`User ${userName} left room ${roomId}`);
      io.to(roomId).emit("room-users", getUsersInRoom(roomId));
    }
  });
});

// Helper function to get users in a room
function getUsersInRoom(roomId) {
  const clients = io.sockets.adapter.rooms.get(roomId);
  return clients
    ? Array.from(clients).map((socketId) => userNames[socketId]?.userName || "Unknown")
    : [];
}