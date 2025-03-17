// systemSelector.js - Component for selecting different solar system configurations

/**
 * System Selector component that allows switching between different
 * predefined solar system configurations
 */
class SystemSelector {
  /**
   * Create a new SystemSelector
   * @param {Object} app - Reference to the main application
   */
  constructor(app) {
    this.app = app;
    this.createUI();
  }
  
  /**
   * Create the UI elements for the system selector
   */
  createUI() {
    // Container for buttons
    this.container = document.createElement('div');
    this.container.className = 'system-selector';
    
    // Label
    const label = document.createElement('span');
    label.className = 'system-selector-label';
    label.textContent = 'System:';
    this.container.appendChild(label);
    
    // Create buttons for each system
    this.createSystemButtons();
    
    // Add to DOM
    const controlsContainer = document.querySelector('.controls');
    if (controlsContainer) {
      controlsContainer.appendChild(this.container);
    } else {
      document.body.appendChild(this.container);
    }
    
    // Add styles
    this.addStyles();
  }
  
  /**
   * Create buttons for each predefined system
   */
  createSystemButtons() {
    const systems = [
      { id: 'default-solar-system', name: 'Full System', handler: () => this.loadSystem('default') },
      { id: 'simplified-solar-system', name: 'Simplified', handler: () => this.loadSystem('simplified') },
      { id: 'inner-solar-system', name: 'Inner Planets', handler: () => this.loadSystem('inner') },
      { id: 'earth-moon-system', name: 'Earth-Moon', handler: () => this.loadSystem('earth-moon') }
    ];
    
    // Create select element
    this.select = document.createElement('select');
    this.select.className = 'system-selector-select';
    
    // Add options
    systems.forEach(system => {
      const option = document.createElement('option');
      option.value = system.id;
      option.textContent = system.name;
      this.select.appendChild(option);
    });
    
    // Add event listener
    this.select.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const selectedSystem = systems.find(system => system.id === selectedId);
      if (selectedSystem) {
        selectedSystem.handler();
      }
    });
    
    this.container.appendChild(this.select);
  }
  
  /**
   * Add CSS styles for the system selector
   */
  addStyles() {
    // Create style element if it doesn't exist
    let styleEl = document.getElementById('system-selector-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'system-selector-styles';
      document.head.appendChild(styleEl);
    }
    
    // Add styles
    styleEl.textContent = `
      .system-selector {
        display: flex;
        align-items: center;
        margin-left: 20px;
      }
      
      .system-selector-label {
        margin-right: 8px;
        font-size: 14px;
        color: #aaa;
      }
      
      .system-selector-select {
        background-color: #2a2a3a;
        color: #fff;
        border: 1px solid #444;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
      }
      
      .system-selector-select:hover {
        background-color: #3a3a4a;
      }
      
      .system-selector-select:focus {
        outline: none;
        border-color: #3366cc;
      }
    `;
  }
  
  /**
   * Load a specific solar system configuration
   * @param {String} type - The type of system to load
   */
  loadSystem(type) {
    // Confirm with user before removing the current system
    if (this.app.objects.length > 0) {
      if (!confirm('Loading a new system will remove the current one. Continue?')) {
        // Reset select to current value
        this.select.value = this.currentSystem || 'default-solar-system';
        return;
      }
    }
    
    // Import solar system data functions
    const {
      getDefaultSystem,
      getSimplifiedSystem,
      getInnerSolarSystem,
      getEarthMoonSystem
    } = require('../data/solarSystem');
    
    // Get the system data based on type
    let systemData;
    switch (type) {
      case 'simplified':
        systemData = getSimplifiedSystem();
        break;
      case 'inner':
        systemData = getInnerSolarSystem();
        break;
      case 'earth-moon':
        systemData = getEarthMoonSystem();
        break;
      case 'default':
      default:
        systemData = getDefaultSystem();
        break;
    }
    
    // Store current system ID
    this.currentSystem = systemData.id;
    
    // Clear existing objects
    this.clearCurrentSystem();
    
    // Create new objects
    this.createNewSystem(systemData);
    
    // Update the view
    this.app.resetView();
    
    // Update UI
    this.app.updateBodyCount();
  }
  
  /**
   * Clear the current solar system
   */
  clearCurrentSystem() {
    // Remove each object
    for (const object of [...this.app.objects]) {
      if (object.mesh && object.mesh.parent) {
        object.mesh.parent.remove(object.mesh);
      }
      if (object.orbitLine && object.orbitLine.parent) {
        object.orbitLine.parent.remove(object.orbitLine);
      }
      if (object.light && object.light.parent) {
        object.light.parent.remove(object.light);
      }
      
      // Remove from physics simulator
      this.app.physics.removeObject(object.id);
      
      // Dispose of resources
      object.dispose();
    }
    
    // Clear the objects array
    this.app.objects = [];
  }
  
  /**
   * Create a new solar system from the provided data
   * @param {Object} systemData - Data for the solar system to create
   */
  createNewSystem(systemData) {
    // Load objects into scene
    for (const objectData of systemData.objects) {
      const object = this.app.objectHandlers.createCelestialObject(objectData);
      this.app.objects.push(object);
      this.app.physics.addObject(object);
      
      // Add light to scene if this is a star
      if (object.light) {
        this.app.scene.add(object.light);
      }
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove event listeners
    if (this.select) {
      this.select.removeEventListener('change', () => {});
    }
    
    // Remove from DOM
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Remove styles
    const styleEl = document.getElementById('system-selector-styles');
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
  }
}

// Export using CommonJS syntax
module.exports = {
  SystemSelector
};
