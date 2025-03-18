/**
 * Solar System Simulator - Preload Script
 * Handles secure bridging between Node.js and the renderer process.
 */

// All Node.js APIs are available in the preload process
// It has the same sandbox as a Chrome extension
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

// Import three.js - this can use require since it's not an ES module
let THREE;
try {
  THREE = require('three');
  console.log("THREE.js loaded successfully via require");
} catch (error) {
  console.error("Failed to load THREE.js via require:", error);
  THREE = null;
}

// Use dynamic import for ES modules
(async () => {
  try {
    // Properly expose THREE first - add all members to the window.THREE object
    if (THREE) {
      // Create a deep copy of all THREE properties to ensure proper exposure
      const threeExports = {};
      for (const key in THREE) {
        if (Object.prototype.hasOwnProperty.call(THREE, key)) {
          threeExports[key] = THREE[key];
        }
      }
      contextBridge.exposeInMainWorld('THREE', threeExports);
      console.log('THREE.js main module exposed to window.THREE');
    } else {
      console.error('THREE.js main module could not be loaded');
    }
    
    // Use dynamic imports for ES modules and expose them immediately when loaded
    try {
      const orbitControlsModule = await import('three/examples/jsm/controls/OrbitControls.js');
      if (orbitControlsModule && orbitControlsModule.OrbitControls) {
        contextBridge.exposeInMainWorld('OrbitControls', orbitControlsModule.OrbitControls);
        console.log('OrbitControls loaded and exposed successfully');
      } else {
        throw new Error('OrbitControls not found in module');
      }
    } catch (err) {
      console.error('Failed to load OrbitControls:', err);
    }
    
    try {
      const textGeometryModule = await import('three/examples/jsm/geometries/TextGeometry.js');
      if (textGeometryModule && textGeometryModule.TextGeometry) {
        contextBridge.exposeInMainWorld('TextGeometry', textGeometryModule.TextGeometry);
        console.log('TextGeometry loaded and exposed successfully');
      } else {
        throw new Error('TextGeometry not found in module');
      }
    } catch (err) {
      console.error('Failed to load TextGeometry:', err);
    }
    
    try {
      const fontLoaderModule = await import('three/examples/jsm/loaders/FontLoader.js');
      if (fontLoaderModule && fontLoaderModule.FontLoader) {
        contextBridge.exposeInMainWorld('FontLoader', fontLoaderModule.FontLoader);
        console.log('FontLoader loaded and exposed successfully');
      } else {
        throw new Error('FontLoader not found in module');
      }
    } catch (err) {
      console.error('Failed to load FontLoader:', err);
    }
    
    console.log('All Three.js modules loaded and exposed successfully');
  } catch (error) {
    console.error('Error loading modules in preload:', error);
  }
})();

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
  assetsPath: path.join(__dirname, '../assets').replace(/\\\\/g, '/'),
  // Also provide the application root path for more flexibility
  rootPath: path.join(__dirname, '..').replace(/\\\\/g, '/')
});

// Expose file system functions
contextBridge.exposeInMainWorld('fs', {
  readFile: (filePath, options) => fs.promises.readFile(filePath, options),
  writeFile: (filePath, data, options) => fs.promises.writeFile(filePath, data, options),
  readdir: (dirPath, options) => fs.promises.readdir(dirPath, options),
  exists: (path) => fs.existsSync(path),
  existsSync: (path) => fs.existsSync(path) // Making sure this function is available
});

// Expose path module functions
contextBridge.exposeInMainWorld('path', {
  join: (...args) => path.join(...args),
  resolve: (...args) => path.resolve(...args),
  dirname: (p) => path.dirname(p),
  basename: (p, ext) => path.basename(p, ext),
  extname: (p) => path.extname(p)
});

// Log at the end of preload to confirm it loaded completely
console.log('Preload script completed successfully');