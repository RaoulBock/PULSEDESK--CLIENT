const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");

let tray = null;
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
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

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  // ✅ Use .ico format here
  tray = new Tray(path.join(__dirname, "public", "favicon.ico"));
  const contextMenu = Menu.buildFromTemplate([
    { label: "Show App", click: () => win.show() },
    {
      label: "Quit",
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Hello World Electron");
  tray.setContextMenu(contextMenu);
});
