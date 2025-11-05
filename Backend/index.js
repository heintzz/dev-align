const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const setupSocket = require("./configs/socket");

const connectDB = require("./configs/db.conn");
const hrRoutes = require("./routes/hr.routes");
const authRoutes = require("./routes/auth.routes");
const skillRoutes = require("./routes/skill.routes");
const swaggerSpecs = require("./configs/swagger");
const menuRoutes = require("./routes/menu.routes");
const positionRoutes = require("./routes/position.routes");
const projectRoutes = require("./routes/project.routes");
const projectAssignmentRoutes = require("./routes/project-assignment.routes");
const taskRoutes = require("./routes/task.routes");

const notificationRoutes = require("./routes/notification.routes");
const borrowRequestRoutes = require("./routes/borrow-request.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const swaggerUi = require("swagger-ui-express");

// Import email worker
const { startEmailWorker } = require("./workers/email.worker");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = { 
  origin: "*",
  credentials: true 
};

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Make io accessible to routes
app.set("io", io);
setupSocket(io);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/hr", hrRoutes);
app.use("/auth", authRoutes);
app.use("/skill", skillRoutes);
app.use("/position", positionRoutes);
app.use("/menu", menuRoutes);
app.use("/project", projectRoutes);
app.use("/project-assignment", projectAssignmentRoutes);
app.use("/notification", notificationRoutes);
app.use("/borrow-request", borrowRequestRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/task", taskRoutes);

// Change app.listen to server.listen
server.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Socket.IO ready`);

  // Start email worker for background job processing
  try {
    await startEmailWorker();
    console.log('Email worker started - ready to process queued emails');
  } catch (error) {
    console.error('Failed to start email worker:', error);
    console.log('Server will continue without email worker');
  }
});
