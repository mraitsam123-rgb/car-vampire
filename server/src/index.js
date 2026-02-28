import http from "http"
import { Server } from "socket.io"
import app from "./server.js"
import { initSocketHandlers } from "./sockets.js"
import { initCleanupJob } from "./utils/cleanup.js"

const port = process.env.PORT || 7860
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }
})
initSocketHandlers(io)
initCleanupJob()
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`)
})
