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

function fetchData() {
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

  https
    .get("https://api.ipify.org?format=json", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const publicIP = json.ip;

          console.log("Hostname:", hostname);
          console.log("Private IP(s):", privateIPs.join(", "));
          console.log("Public IP:", publicIP);

          new Notification({
            title: "Network Info",
            body: "Logged network info to console.",
          }).show();
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
    { label: "Fetch Data", click: fetchData },
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

ipcMain.on("user:login", () => {
  isLoggedIn = true;
  updateTrayMenu();
});

ipcMain.on("user:logout", () => {
  isLoggedIn = false;
  updateTrayMenu();
  win.webContents.send("user:logout");
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  tray = new Tray(path.join(__dirname, "public", "favicon.ico"));
  tray.setToolTip("Electron React App");
  tray.on("click", () => win.show());

  updateTrayMenu();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
