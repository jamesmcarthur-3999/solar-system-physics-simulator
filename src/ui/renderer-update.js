// Import save/load functionality
const { saveSolarSystem, loadSolarSystem, setupSaveLoadListeners } = require('./saveLoad');

// Add these functions to your SolarSystemApp class
class SolarSystemApp {
  constructor() {
    // ... existing code ...
    
    // Initialize save/load buttons
    this.initSaveLoadButtons();
  }
  
  initSaveLoadButtons() {
    try {
      // Get buttons
      const saveButton = document.getElementById('save-system');
      const loadButton = document.getElementById('load-system');
      
      // Set up save button
      if (saveButton) {
        saveButton.addEventListener('click', () => {
          saveSolarSystem(this);
        });
      }
      
      // Set up load button
      if (loadButton) {
        loadButton.addEventListener('click', () => {
          loadSolarSystem(this);
        });
      }
      
      // Set up IPC listeners
      setupSaveLoadListeners(this);
    } catch (error) {
      console.error('Error initializing save/load buttons:', error);
    }
  }
  
  // Methods to support save/load operations
  saveCurrentSystem() {
    saveSolarSystem(this);
  }
  
  loadSystemFromFile() {
    loadSolarSystem(this);
  }
  
  // ... rest of your class ...
}