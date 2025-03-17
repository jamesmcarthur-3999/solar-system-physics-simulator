// All Node.js APIs are available in the preload process
// It has the same sandbox as a Chrome extension
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Send messages to main process
  send: (channel, data) => {
    // List of allowed channels
    const validChannels = ['save-system', 'load-system'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Receive messages from main process
  receive: (channel, callback) => {
    const validChannels = ['system-saved', 'system-loaded', 'error'];
    if (validChannels.includes(channel)) {
      // Remove the event listener to avoid memory leaks
      ipcRenderer.removeAllListeners(channel);
      // Add a new listener
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  }
});

// Expose application paths to the renderer process
contextBridge.exposeInMainWorld('appPath', {
  // Provide asset path to allow proper texture loading
  assetsPath: path.join(__dirname, '../assets').replace(/\\/g, '/'),
  // Also provide the application root path for more flexibility
  rootPath: path.join(__dirname, '..').replace(/\\/g, '/')
});

// Expose a limited require function for specific modules
contextBridge.exposeInMainWorld('nodeRequire', {
  three: () => require('three'),
  threeOrbitControls: () => require('three/examples/jsm/controls/OrbitControls.js')
});
