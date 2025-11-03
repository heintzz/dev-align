const jwt = require("jsonwebtoken");
// configs/socket.js
const setupSocket = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // Verify JWT token here
    if (token) {
      // Attach user info to socket
      // console.log(token);
      const secretKey = process.env.JWT_SECRET || "secret_key";
      const decoded = jwt.verify(token, secretKey);
      // console.log(decoded);
      socket.userId = decoded.id;
      next();
    } else {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    // console.log("User connected:", socket.id);

    // ✅ Join project room
    socket.on("join:project", (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`User ${socket.userId} joined project ${projectId}`);
    });

    // ✅ Leave project room
    socket.on("leave:project", (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`User ${socket.userId} left project ${projectId}`);
    });

    // Task events
    socket.on("task:create", (data) => {
      const { boardId, task } = data;
      // Broadcast to all users in the board except sender
      socket.to(`board:${boardId}`).emit("task:created", task);
    });

    socket.on("task:update", (data) => {
      const { boardId, taskId, updates } = data;
      socket.to(`board:${boardId}`).emit("task:updated", { taskId, updates });
    });

    socket.on("task:move", (data) => {
      const { boardId, taskId, fromColumn, toColumn, newIndex } = data;
      socket.to(`board:${boardId}`).emit("task:moved", {
        taskId,
        fromColumn,
        toColumn,
        newIndex,
      });
    });

    socket.on("task:delete", (data) => {
      const { boardId, taskId } = data;
      socket.to(`board:${boardId}`).emit("task:deleted", { taskId });
    });

    // Column events
    socket.on("column:create", (data) => {
      const { boardId, column } = data;
      socket.to(`board:${boardId}`).emit("column:created", column);
    });

    socket.on("column:update", (data) => {
      const { boardId, columnId, updates } = data;
      socket
        .to(`board:${boardId}`)
        .emit("column:updated", { columnId, updates });
    });

    socket.on("column:delete", (data) => {
      const { boardId, columnId } = data;
      socket.to(`board:${boardId}`).emit("column:deleted", { columnId });
    });

    // User is typing indicator
    socket.on("task:typing", (data) => {
      const { boardId, taskId, userName } = data;
      socket.to(`board:${boardId}`).emit("task:typing", { taskId, userName });
    });

    // User cursor position (for collaborative editing)
    socket.on("cursor:move", (data) => {
      const { boardId, position } = data;
      socket.to(`board:${boardId}`).emit("cursor:moved", {
        userId: socket.userId,
        position,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = setupSocket;
