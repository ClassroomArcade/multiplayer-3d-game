const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

// Firebase Admin setup
// Render/VPS hosting: you will set FIREBASE_SERVICE_ACCOUNT in env vars
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin initialized from env.");
} else {
  console.log("WARNING: FIREBASE_SERVICE_ACCOUNT env var not found.");
}

// Game rooms
let rooms = {
  main: {}
};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinGame", async ({ token }) => {
    try {
      if (!token) return;

      // Verify Firebase token
      const decoded = await admin.auth().verifyIdToken(token);

      const userId = decoded.uid;
      const email = decoded.email || "unknown";

      console.log("Authenticated user:", userId, email);

      // Join room
      socket.join("main");

      rooms.main[socket.id] = {
        id: socket.id,
        uid: userId,
        email,
        x: Math.random() * 10 - 5,
        y: 0,
        z: Math.random() * 10 - 5,
        rotY: 0
      };

      socket.emit("joined", {
        id: socket.id,
        uid: userId,
        email,
        players: rooms.main
      });

      socket.to("main").emit("playerJoined", rooms.main[socket.id]);

    } catch (err) {
      console.log("Auth failed:", err.message);
      socket.emit("authError", "Authentication failed.");
    }
  });

  socket.on("playerMove", (data) => {
    if (!rooms.main[socket.id]) return;

    rooms.main[socket.id].x = data.x;
    rooms.main[socket.id].y = data.y;
    rooms.main[socket.id].z = data.z;
    rooms.main[socket.id].rotY = data.rotY;

    socket.to("main").emit("playerMoved", rooms.main[socket.id]);
  });

  socket.on("disconnect", () => {
    if (rooms.main[socket.id]) {
      console.log("Player disconnected:", socket.id);
      delete rooms.main[socket.id];
      io.to("main").emit("playerLeft", socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
