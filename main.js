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

  win.loadFile("dist/index.html");

  win.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
  });
}

// Fetch Data Example
function fetchData() {
  https
    .get("https://api.chucknorris.io/jokes/random", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const result = JSON.parse(data);
        new Notification({
          title: "Fetched Data",
          body: result.value || "No data received.",
        }).show();
      });
    })
    .on("error", () => {
      new Notification({
        title: "Error",
        body: "Failed to fetch data.",
      }).show();
    });
}

// Tray Menu Based on Login State
function updateTrayMenu() {
  const loggedOutMenu = Menu.buildFromTemplate([
    {
      label: "Login",
      click: () => {
        win.show();
      },
    },
    {
      label: "Exit",
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  const loggedInMenu = Menu.buildFromTemplate([
    {
      label: "Fetch Data",
      click: fetchData,
    },
    {
      label: "Show App",
      click: () => {
        win.show();
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

  const menu = isLoggedIn ? loggedInMenu : loggedOutMenu;
  tray.setContextMenu(menu);
}

// Handle login from renderer
ipcMain.on("user:login", () => {
  isLoggedIn = true;
  updateTrayMenu();
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  tray = new Tray(path.join(__dirname, "public", "favicon.ico"));
  tray.setToolTip("Taskbar Tray App");
  tray.on("click", () => win.show());

  updateTrayMenu();
});

// For macOS support
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
