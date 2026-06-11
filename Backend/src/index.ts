import http from "http";
import { Server } from "socket.io";

import app from "./app.js";

const PORT = process.env.PORT || 5000;

/**
 * HTTP SERVER
 */
const server = http.createServer(app);

/**
 * SOCKET.IO
 */
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

/**
 * SOCKET CONNECTION
 */
io.on("connection", socket => {
  console.log("[Socket] Connected:", socket.id);

  /**
   * JOIN BRANCH ROOM
   * Used by: managers, kitchen staff, waiters, inventory
   */
  socket.on("join_branch", (branchId) => {
    const room = `branch_${branchId}`;
    socket.join(room);
    console.log(`[Socket] ${socket.id} joined ${room}`);
  });

  /**
   * LEAVE BRANCH ROOM
   */
  socket.on("leave_branch", (branchId) => {
    const room = `branch_${branchId}`;
    socket.leave(room);
    console.log(`[Socket] ${socket.id} left ${room}`);
  });

  /**
   * JOIN CUSTOMER ROOM
   * Used by: customers to receive live order status updates
   */
  socket.on("join_customer", (customerId: string) => {
    const room = `customer_${customerId}`;
    socket.join(room);
    console.log(`[Socket] ${socket.id} joined ${room}`);
  });

  /**
   * JOIN GLOBAL ANALYTICS ROOM
   * Used by: HQ managers
   */
  socket.on("join_global", () => {
    socket.join("global_analytics");
    console.log(`[Socket] ${socket.id} joined global_analytics`);
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected:", socket.id);
  });
});

/**
 * START SERVER
 */
server.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});