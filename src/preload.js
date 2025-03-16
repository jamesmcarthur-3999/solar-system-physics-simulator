// All Node.js APIs are available in the preload process
// It has the same sandbox as a Chrome extension
const { contextBridge, ipcRenderer } = require('electron');

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