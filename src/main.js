// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  });

  // and load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
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

// Handle save solar system configuration
ipcMain.on('save-system', async (event, data) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save Solar System Configuration',
      defaultPath: path.join(app.getPath('documents'), 'solar-system-config.json'),
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (!canceled && filePath) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      event.reply('system-saved', { success: true, filePath });
    }
  } catch (error) {
    console.error('Error saving system configuration:', error);
    event.reply('error', { message: 'Failed to save system configuration' });
  }
});

// Handle load solar system configuration
ipcMain.on('load-system', async (event) => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Load Solar System Configuration',
      defaultPath: app.getPath('documents'),
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (!canceled && filePaths.length > 0) {
      const configData = JSON.parse(fs.readFileSync(filePaths[0], 'utf8'));
      event.reply('system-loaded', { success: true, data: configData });
    }
  } catch (error) {
    console.error('Error loading system configuration:', error);
    event.reply('error', { message: 'Failed to load system configuration' });
  }
});