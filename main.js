const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");

let tray = null;
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "public/icon.png"),
    webPreferences: {
      contextIsolation: true,
    },
    autoHideMenuBar: true, // Optional: hide menu bar until Alt is pressed
  });

  win.loadFile("dist/index.html");
}

app.whenReady().then(() => {
  // ✅ Remove default application menu
  Menu.setApplicationMenu(null);

  createWindow();

  tray = new Tray(path.join(__dirname, "public/icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    { label: "Show App", click: () => win.show() },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setToolTip("Hello World Electron");
  tray.setContextMenu(contextMenu);
});
