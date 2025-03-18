// Modules to control application life and create native browser window
const { app, BrowserWindow, protocol, crashReporter } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable crash reporter to avoid "not connected" errors
app.commandLine.appendSwitch('disable-crash-reporter');
crashReporter.start({ uploadToServer: false });

// Disable hardware acceleration
app.disableHardwareAcceleration();

// Add specific flags to help with rendering issues
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-vsync');

// Handle uncaught exceptions that might be related to crashpad
process.on('uncaughtException', (error) => {
  // Log all errors during development
  console.error('Uncaught Exception:', error);
});

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
  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'))
    .then(() => {
      console.log('Main window loaded successfully');
    })
    .catch(err => {
      console.error('Error loading main window:', err);
    });

  // Open the DevTools in development mode
  mainWindow.webContents.openDevTools();

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
  });

  // Log renderer process errors
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process gone:', details.reason);
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

// Add better logging for app startup
app.whenReady().then(() => {
  console.log('App is ready');

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
  
  console.log('Creating window...');
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

// Log any app errors
app.on('render-process-gone', (event, webContents, details) => {
  console.error('Render process gone:', details.reason);
});

app.on('gpu-process-gone', (event, details) => {
  console.error('GPU process gone:', details.reason);
});

app.on('child-process-gone', (event, details) => {
  console.error('Child process gone:', details.processType, details.reason);
});
