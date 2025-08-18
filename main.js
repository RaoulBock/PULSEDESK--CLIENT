const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  Notification,
} = require("electron");
const path = require("path");
const https = require("https");
const os = require("os");
const axios = require("axios");
const { io } = require("socket.io-client");

let tray = null;
let win;
let isLoggedIn = false;
const socket = io("http://localhost:4000"); // backend server

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "public/speedometer-256x256.png"),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    autoHideMenuBar: true,
  });

  win.loadFile(path.join(__dirname, "dist/index.html"));

  win.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
  });
}

function fetchSystemData() {
  win.webContents.send("system:fetching");

  const hostname = os.hostname();
  const interfaces = os.networkInterfaces();
  const privateIPs = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        privateIPs.push(iface.address);
      }
    }
  }

  const systemInfo = {
    hostname,
    platform: os.platform(),
    osType: os.type(),
    osRelease: os.release(),
    architecture: os.arch(),
    uptime: os.uptime(),
    totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    cpus: os.cpus().map((cpu) => cpu.model),
    cpuCount: os.cpus().length,
    privateIPs,
    publicIP: null,
  };

  axios
    .get("https://api.ipify.org?format=json", {
      headers: { "User-Agent": "PulseDesk/1.0" },
    })
    .then((response) => {
      systemInfo.publicIP = response.data.ip;
      new Notification({
        title: "System Info",
        body: "System details sent to UI.",
      }).show();
      win.webContents.send("system:data", systemInfo); // send back to the UI
      socket.emit("register", systemInfo); // send back to server

      // ✅ Start heartbeat (every 30s)
      setInterval(() => {
        socket.emit("heartbeat", { hostname: systemInfo.hostname });
      }, 30000);
    })
    .catch((error) => {
      console.error("Failed to fetch public IP:", error.message);
      new Notification({
        title: "Error",
        body: "Failed to fetch public IP.",
      }).show();
    });
}

function updateTrayMenu() {
  const loggedOutMenu = Menu.buildFromTemplate([
    { label: "Login", click: () => win.show() },
    {
      label: "Exit",
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  const loggedInMenu = Menu.buildFromTemplate([
    { label: "Fetch Data", click: fetchSystemData },
    { label: "Show App", click: () => win.show() },
    {
      label: "Logout",
      click: () => {
        isLoggedIn = false;
        updateTrayMenu();
        win.webContents.send("user:logout");
      },
    },
    {
      label: "Quit",
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(isLoggedIn ? loggedInMenu : loggedOutMenu);
}

ipcMain.on("user:login", (event, credentials) => {
  const { username, password } = credentials;

  if (username === "admin" && password === "admin") {
    isLoggedIn = true;
    updateTrayMenu();
    win.webContents.send("user:login:success");
    fetchSystemData(); // auto-fetch on login
  } else {
    win.webContents.send("user:login:failed");
  }
});

ipcMain.on("user:logout", () => {
  isLoggedIn = false;
  updateTrayMenu();
  win.webContents.send("user:logout");
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  let iconPath;

  if (process.platform === "win32") {
    iconPath = path.resolve(__dirname, "public/favicon.ico"); // Windows icon
  } else {
    iconPath = path.resolve(__dirname, "public/icons8-fast-download-24.png"); // Linux/macOS icon
  }

  tray = new Tray(iconPath);
  tray.setToolTip("Corp System Info App");
  tray.on("click", () => win.show());

  updateTrayMenu();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
