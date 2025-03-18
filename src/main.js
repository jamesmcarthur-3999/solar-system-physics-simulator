// Modules to control application life and create native browser window
const { app, BrowserWindow, protocol, crashReporter } = require('electron');
const path = require('path');
const fs = require('fs');

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Disable crash reporter to avoid "not connected" errors
app.commandLine.appendSwitch('disable-crash-reporter');
crashReporter.start({ uploadToServer: false });

// Disable hardware acceleration
app.disableHardwareAcceleration();

// Add specific flags to help with rendering issues
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('no-sandbox');

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow;

function createWindow() {
  // Set up protocol for loading local files more reliably
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substr(6);
    callback({ path: path.normalize(`${__dirname}/${url}`) });
  });

  console.log("Creating main window...");

  // Create the browser window with minimal options first
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Need to disable sandbox for proper preload
      webSecurity: false, // Allow loading local resources
      enableRemoteModule: false,
      preload: path.join(__dirname, 'minimal-preload.js') // Use a minimal preload
    }
  });

  // Check if index.html exists
  const indexPath = path.join(__dirname, 'ui', 'index.html');
  console.log(`Index file exists at: ${indexPath}`);
  if (!fs.existsSync(indexPath)) {
    console.error(`Error: index.html file not found at ${indexPath}`);
    app.quit();
    return;
  }

  // Create a minimal preload script if it doesn't exist
  const minimalPreloadPath = path.join(__dirname, 'minimal-preload.js');
  if (!fs.existsSync(minimalPreloadPath)) {
    console.log('Creating minimal preload script...');
    const minimalPreloadContent = `
      // Minimal preload script that only exposes console functions
      const { contextBridge } = require('electron');
      
      // Expose a minimal API to the renderer
      contextBridge.exposeInMainWorld('electronAPI', {
        // Add minimal functionality here
        log: (message) => console.log(message),
        error: (message) => console.error(message)
      });
      
      console.log('Minimal preload script loaded');
    `;
    
    fs.writeFileSync(minimalPreloadPath, minimalPreloadContent);
  }

  // Create a very basic HTML file for testing
  const testHtmlPath = path.join(__dirname, 'test.html');
  if (!fs.existsSync(testHtmlPath)) {
    console.log('Creating test HTML file...');
    const testHtmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Page</title>
        <style>
          body { 
            background: #000; 
            color: #fff; 
            font-family: sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .content {
            text-align: center;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="content">
          <h1>Test Page</h1>
          <p>If you can see this, Electron is working correctly.</p>
          <p>This is a minimal test page without any scripts or complex elements.</p>
        </div>
      </body>
      </html>
    `;
    
    fs.writeFileSync(testHtmlPath, testHtmlContent);
  }

  // Try loading the test HTML file first
  const fileUrl = `file://${testHtmlPath.replace(/\\/g, '/')}`;
  console.log(`Loading test URL: ${fileUrl}`);
  
  mainWindow.loadURL(fileUrl)
    .then(() => {
      console.log('Test page loaded successfully');
      // After successful load, show the window and try to navigate to the real page
      mainWindow.show();
      
      // After a short delay, try loading the actual page
      setTimeout(() => {
        const indexUrl = `file://${indexPath.replace(/\\/g, '/')}`;
        console.log(`Now trying to load index URL: ${indexUrl}`);
        mainWindow.loadURL(indexUrl)
          .then(() => {
            console.log('Main index page loaded successfully');
          })
          .catch(err => {
            console.error('Error loading main index page:', err);
          });
      }, 3000);
    })
    .catch(err => {
      console.error('Error loading test page:', err);
    });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
  });

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  // Log renderer process errors
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process gone:', details.reason);
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}

// Allow loading local files
app.commandLine.appendSwitch('allow-file-access-from-files');
app.commandLine.appendSwitch('allow-insecure-localhost');

// Set NODE_ENV to development for debugging
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
  console.error('Renderer process gone:', details.reason);
});

app.on('gpu-process-gone', (event, details) => {
  console.error('GPU process gone:', details.reason);
});

app.on('child-process-gone', (event, details) => {
  console.error('Child process gone:', details.processType, details.reason);
});
