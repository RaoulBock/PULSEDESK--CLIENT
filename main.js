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

let tray = null;
let win;
let isLoggedIn = false;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
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

  https
    .get("https://api.ipify.org?format=json", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          systemInfo.publicIP = json.ip;

          console.log("🖥️ System Info:", systemInfo);
          new Notification({
            title: "System Info",
            body: "System details sent to UI.",
          }).show();

          win.webContents.send("system:data", systemInfo);
        } catch (e) {
          new Notification({
            title: "Error",
            body: "Failed to parse public IP.",
          }).show();
        }
      });
    })
    .on("error", () => {
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

// app.whenReady().then(() => {
//   Menu.setApplicationMenu(null);
//   createWindow();
//   const iconPath = path.resolve(
//     __dirname,
//     "public/icons8-fast-download-24.png"
//   );
//   tray = new Tray(iconPath);
//   tray.setToolTip("Corp System Info App");
//   tray.on("click", () => win.show());

//   updateTrayMenu();
// });
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
