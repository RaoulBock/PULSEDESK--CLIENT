const { app, Tray, Menu } = require("electron");
const path = require("path");
const os = require("os");
const { io } = require("socket.io-client");

let tray = null;
let socket;

function createTray() {
  tray = new Tray(path.join(__dirname, "public", "favicon.ico")); // path adjusted

  const contextMenu = Menu.buildFromTemplate([
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setToolTip("PulseDesk Client");
  tray.setContextMenu(contextMenu);
}

function startSocket() {
  socket = io("http://localhost:4000");

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
      socket.emit("heartbeat", { hostname: os.hostname() });
    }
  }, 20000);
}

app.whenReady().then(() => {
  createTray();
  startSocket();

  app.on("window-all-closed", (e) => e.preventDefault());
});
