// Modules to control application life and create native browser window
const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow;

function createWindow() {
  // Set up protocol for loading local files more reliably
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substr(6);
    callback({ path: path.normalize(`${__dirname}/${url}`) });
  });

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      // Allow loading files from local filesystem
      webSecurity: false,
      // Allow ES modules in the renderer process
      worldSafeExecuteJavaScript: true,
      // Important: This allows the preload script to work with imported modules
      sandbox: false
    },
    show: false
  });

  // and load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

  // Open the DevTools in development mode
  mainWindow.webContents.openDevTools();

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
  
  // Handle webContents creation for security
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Only allow navigation to local files
    if (!url.startsWith('file://')) {
      event.preventDefault();
    }
  });
}

// Allow loading local ES modules in the renderer process
app.commandLine.appendSwitch('allow-insecure-localhost');
app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');
// Set NODE_ENV to development to enable debugging features
process.env.NODE_ENV = 'development';

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Register our custom protocol
  protocol.registerFileProtocol('solar-app', (request, callback) => {
    const url = request.url.replace('solar-app://', '');
    try {
      return callback(path.join(__dirname, url));
    } catch (error) {
      console.error(error);
      return callback(404);
    }
  });
  
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
