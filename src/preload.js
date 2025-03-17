// All Node.js APIs are available in the preload process
// It has the same sandbox as a Chrome extension
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const THREE = require('three');
const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls.js');
const { TextGeometry } = require('three/examples/jsm/geometries/TextGeometry.js');
const { FontLoader } = require('three/examples/jsm/loaders/FontLoader.js');

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
  three: () => THREE,
  threeOrbitControls: () => OrbitControls,
  threeTextGeometry: () => TextGeometry,
  threeFontLoader: () => FontLoader,
  path: () => path,
  fs: fs.promises
});

// Expose THREE directly for convenience in the renderer
contextBridge.exposeInMainWorld('THREE', THREE);

// Make a global require function to support module imports in the renderer
contextBridge.exposeInMainWorld('require', (moduleName) => {
  // Whitelist of allowed modules
  const allowedModules = {
    'three': THREE,
    'three/examples/jsm/controls/OrbitControls.js': { OrbitControls },
    'three/examples/jsm/geometries/TextGeometry.js': { TextGeometry },
    'three/examples/jsm/loaders/FontLoader.js': { FontLoader },
    'path': path,
    'fs': fs.promises
  };
  
  // Only allow importing specific modules
  if (allowedModules[moduleName]) {
    return allowedModules[moduleName];
  }
  
  // For local module imports, indicate they should be handled by the ESM system
  if (moduleName.startsWith('./') || moduleName.startsWith('../')) {
    console.log(`Local module '${moduleName}' should be imported using ES module syntax`);
    return {}; // Return empty object to prevent errors
  }
  
  // Disallow other imports
  throw new Error(`Module not allowed: ${moduleName}`);
});
