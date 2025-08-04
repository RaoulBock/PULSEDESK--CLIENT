// main.js (PulseDesk client)
const { io } = require("socket.io-client");
const os = require("os");

const socket = io("http://localhost:4000");

const deviceInfo = {
  hostname: os.hostname(),
  platform: os.platform(),
  osType: os.type(),
  osRelease: os.release(),
  architecture: os.arch(),
  cpuCount: os.cpus().length,
};

socket.on("connect", () => {
  socket.emit("register", deviceInfo);
  console.log("Registered PulseDesk client with server");
});

setInterval(() => {
  if (socket.connected) {
    // Send hostname as an object with heartbeat
    socket.emit("heartbeat", { hostname: os.hostname() });
  }
}, 20000);
