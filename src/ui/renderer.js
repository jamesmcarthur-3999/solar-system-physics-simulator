// Solar System Simulator - Main Renderer

// Access APIs exposed from preload
const THREE = window.THREE || {};
const OrbitControls = window.OrbitControls;
const TextGeometry = window.TextGeometry;
const FontLoader = window.FontLoader;

// Define placeholder classes that will be replaced later
class GravitySimulator {
  constructor() { this.objects = []; }
  update() {}
  addObject() {}
  setPaused() {}
  setTimeScale() {}
  getObjects() { return []; }
  dispose() {}
}

class SceneManager {
  constructor() { 
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = { render: () => {}, setSize: () => {}, dispose: () => {} };
  }
  handleResize() {}
  dispose() {}
}

class CameraControls {
  constructor() {}
  update() {}
  resetView() {}
  setPosition() {}
  focusOnObject() {}
  handleResize() {}
  dispose() {}
}

class GravityVisualizer {
  constructor() {}
  update() {}
  toggleVisibility() {}
  dispose() {}
}

class LagrangePointVisualizer {
  constructor() { this.visible = false; }
  calculateLagrangePoints() {}
  setVisible() {}
  update() {}
  dispose() {}
}

class Dialogs {
  constructor() {}
  dispose() {}
}

class InfoPanel {
  constructor() {}
  updateObjectInfo() {}
  dispose() {}
}

class ObjectHandlers {
  constructor() {}
  createCelestialObject() { return {}; }
  showAddObjectDialog() {}
  dispose() {}
}

class SolarSystem {
  constructor() {}
}

function getDefaultSystem() { 
  return { 
    objects: [] 
  }; 
}

class EducationalFeatures {
  constructor() {}
  dispose() {}
}

class SystemSelector {
  constructor() {}
  dispose() {}
}

class HelpSystem {
  constructor() {}
  showPanel() {}
  hidePanel() {}
  togglePanel() {}
  showTopic() {}
  showTooltip() {}
  hideAllTooltips() {}
  addContextHelp() {}
  dispose() {}
}

async function downloadAllTextures() {}

// Initialize modules on window load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize constants first to ensure they're available
    await loadConstants();
    
    // Then load the rest of the modules
    await loadModules();
    
    // Create application
    window.solarSystemApp = new SolarSystemApp();
  } catch (error) {
    console.error('Error initializing application:', error);
    
    // Display error to user
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <h2>Error Loading Application</h2>
      <p>${error.message}</p>
      <p>Please check the console for more details.</p>
    `;
    document.body.appendChild(errorDiv);
  }
});

/**
 * Load constants first to ensure they're available to all modules
 */
async function loadConstants() {
  try {
    // Define constants directly if loading fails
    window.CONSTANTS = window.CONSTANTS || {
      G: 6.67430e-11,
      AU: 149597870.7,
      SECONDS_PER_DAY: 86400,
      DISTANCE_SCALE: 1 / 1000,
      SIZE_SCALE: 1 / 100,
      ORBIT_SEGMENTS: 360,
      DEFAULT_TIME_SCALE: 1,
      ORBIT_COLORS: {
        star: 0xFFFF00,
        planet: 0x3399FF,
        dwarf_planet: 0x99CCFF,
        moon: 0xCCCCCC,
        asteroid: 0x666666,
        comet: 0x00FFFF
      },
      SUN_MASS: 1.989e30,
      EARTH: {
        mass: 5.972e24,
        radius: 6371,
        semiMajorAxis: 1.0,
        orbitalPeriod: 365.256,
        rotationPeriod: 23.9344694,
      },
      TEXTURE_PATH: '../assets/textures/'
    };
    
    // Try to load constants from file
    const response = await fetch('../utils/constants.js');
    if (!response.ok) {
      throw new Error(`Failed to load constants.js: ${response.status}`);
    }
    
    // Load constants as a module script
    const constantsScript = document.createElement('script');
    constantsScript.type = 'text/javascript';
    constantsScript.text = await response.text();
    document.head.appendChild(constantsScript);
    
    console.log('Constants loaded successfully');
    return true;
  } catch (error) {
    console.warn('Error loading constants:', error);
    console.warn('Using default constants');
    return false;
  }
}

/**
 * Load all required modules
 */
async function loadModules() {
  try {
    // Define a helper to create module scripts
    async function loadModuleScript(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const scriptText = await response.text();
        
        // Create a script element for the module
        const script = document.createElement('script');
        script.type = 'text/javascript';
        
        // Convert any require() calls to window references
        const modifiedScript = scriptText
          .replace(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g, (match, path) => {
            if (path === 'three') return 'window.THREE';
            if (path.includes('three')) return 'window.THREE';
            if (path.includes('OrbitControls')) return 'window.OrbitControls';
            if (path.includes('TextGeometry')) return 'window.TextGeometry';
            if (path.includes('FontLoader')) return 'window.FontLoader';
            
            // For other modules, try to find them in window
            const parts = path.split('/');
            const moduleName = parts[parts.length - 1].replace('.js', '');
            return `window.${moduleName}`;
          });
        
        script.text = modifiedScript;
        document.head.appendChild(script);
        
        console.log(`Successfully loaded: ${url}`);
        return true;
      } catch (error) {
        console.error(`Error loading ${url}:`, error);
        throw error;
      }
    }
    
    // Load each module in order with proper error handling
    console.log('Loading modules...');
    
    // Load these modules in order of dependency
    const modules = [
      '../physics/gravitySimulator.js',
      '../renderer/scene.js',
      '../renderer/cameraControls.js',
      '../renderer/gravityVisualizer.js',
      '../renderer/LagrangePointVisualizer.js',
      './dialogs.js',
      './infoPanel.js',
      './objectHandlers.js',
      '../data/solarSystem.js',
      './educationalFeatures.js',
      './systemSelector.js',
      './HelpSystem.js',
      '../utils/downloadTextures.js'
    ];
    
    // Load modules sequentially
    for (const modulePath of modules) {
      try {
        await loadModuleScript(modulePath);
      } catch (error) {
        console.error(`Failed to load module ${modulePath}:`, error);
        throw new Error(`Failed to load module ${modulePath}: ${error.message}`);
      }
    }
    
    console.log('All modules loaded successfully');
  } catch (error) {
    console.error('Error loading modules:', error);
    throw error;
  }
}

/**
 * Main application class for Solar System Simulator
 */
class SolarSystemApp {
  constructor() {
    // Initialize state
    this.timeScale = 1; // 1 day per second
    this.paused = false;
    this.objects = [];
    this.selectedObjectId = null;
    
    // Get DOM elements
    this.sceneContainer = document.getElementById('scene-container');
    this.infoPanel = document.getElementById('info-panel');
    this.objectProperties = document.getElementById('object-properties');
    this.objectName = document.getElementById('object-name');
    this.playPauseButton = document.getElementById('play-pause');
    this.timeSlowerButton = document.getElementById('time-slower');
    this.timeFasterButton = document.getElementById('time-faster');
    this.timeDisplay = document.getElementById('time-display');
    this.resetViewButton = document.getElementById('reset-view');
    this.addObjectButton = document.getElementById('add-object');
    this.fpsCounter = document.getElementById('fps');
    this.bodyCount = document.getElementById('body-count');
    
    // Initialize managers
    this.initManagers();
    
    // Ensure textures are available
    this.ensureTextures();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Create default solar system
    this.createDefaultSystem();
    
    // Initialize Lagrange Points controls
    this.initLagrangePointsControls();
    
    // Initialize Help System button
    this.initHelpButton();
    
    // Start animation loop
    this.startAnimationLoop();
    
    // Set global reference
    window.solarSystemApp = this;
  }
  
  /**
   * Initialize all managers and controllers
   */
  initManagers() {
    try {
      // Check that required classes exist
      if (!window.SceneManager) {
        throw new Error('SceneManager class not found');
      }
      
      // Create scene manager
      this.sceneManager = new window.SceneManager(this.sceneContainer);
      this.scene = this.sceneManager.scene;
      this.renderer = this.sceneManager.renderer;
      
      // Create camera controls
      if (!window.CameraControls) {
        throw new Error('CameraControls class not found');
      }
      this.cameraControls = new window.CameraControls(
        this.sceneManager.camera,
        this.sceneContainer
      );
      
      // Create physics simulator
      if (!window.GravitySimulator) {
        throw new Error('GravitySimulator class not found');
      }
      this.physics = new window.GravitySimulator();
      
      // Create gravity visualizer
      if (!window.GravityVisualizer) {
        throw new Error('GravityVisualizer class not found');
      }
      this.gravityVisualizer = new window.GravityVisualizer(this.scene);
      
      // Create Lagrange point visualizer
      if (!window.LagrangePointVisualizer) {
        throw new Error('LagrangePointVisualizer class not found');
      }
      this.lagrangePointVisualizer = new window.LagrangePointVisualizer(this.scene);
      
      // Create dialogs manager
      if (!window.Dialogs) {
        throw new Error('Dialogs class not found');
      }
      this.dialogs = new window.Dialogs();
      
      // Create info panel
      if (!window.InfoPanel) {
        throw new Error('InfoPanel class not found');
      }
      this.infoPanelManager = new window.InfoPanel(this.objectProperties);
      
      // Create object handlers
      if (!window.ObjectHandlers) {
        throw new Error('ObjectHandlers class not found');
      }
      this.objectHandlers = new window.ObjectHandlers(this);
      
      // Create system selector
      if (!window.SystemSelector) {
        throw new Error('SystemSelector class not found');
      }
      this.systemSelector = new window.SystemSelector(this);
      
      // Create educational features
      if (!window.EducationalFeatures) {
        throw new Error('EducationalFeatures class not found');
      }
      this.educationalFeatures = new window.EducationalFeatures(this);
      
      // Create help system
      if (!window.HelpSystem) {
        throw new Error('HelpSystem class not found');
      }
      this.helpSystem = new window.HelpSystem();
    } catch (error) {
      console.error('Error initializing managers:', error);
      throw new Error(`Failed to initialize managers: ${error.message}`);
    }
  }
  
  /**
   * Ensure that textures are available
   */
  async ensureTextures() {
    try {
      // Download textures if they don't exist
      if (window.downloadAllTextures && typeof window.downloadAllTextures === 'function') {
        await window.downloadAllTextures();
      } else {
        console.warn('downloadAllTextures function not found');
      }
    } catch (error) {
      console.warn('Error ensuring textures:', error);
      // Continue with the application even if textures fail
    }
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Handle window resize
    this.resizeHandler = () => this.handleResize();
    window.addEventListener('resize', this.resizeHandler);
    
    // Handle play/pause button
    this.togglePlayPause = () => this.handlePlayPause();
    this.playPauseButton.addEventListener('click', this.togglePlayPause);
    
    // Handle time scale buttons
    this.decreaseTimeScale = () => this.handleDecreaseTimeScale();
    this.timeSlowerButton.addEventListener('click', this.decreaseTimeScale);
    
    this.increaseTimeScale = () => this.handleIncreaseTimeScale();
    this.timeFasterButton.addEventListener('click', this.increaseTimeScale);
    
    // Handle reset view button
    this.resetView = () => this.handleResetView();
    this.resetViewButton.addEventListener('click', this.resetView);
    
    // Handle add object button
    this.addNewObject = () => this.handleAddObject();
    this.addObjectButton.addEventListener('click', this.addNewObject);
    
    // Handle keyboard shortcuts
    this.keydownHandler = (e) => this.handleKeydown(e);
    window.addEventListener('keydown', this.keydownHandler);
  }
  
  /**
   * Initialize Lagrange Points controls
   */
  initLagrangePointsControls() {
    // Create control container
    const container = document.createElement('div');
    container.className = 'lagrange-points-control';
    container.id = 'lagrange-points-control';
    
    // Create label
    const label = document.createElement('span');
    label.className = 'lagrange-points-label';
    label.textContent = 'Lagrange Points:';
    
    // Create system selector
    this.lagrangeSystemSelect = document.createElement('select');
    this.lagrangeSystemSelect.className = 'lagrange-points-select';
    this.lagrangeSystemSelect.id = 'lagrange-system-select';
    
    // Default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select System';
    this.lagrangeSystemSelect.appendChild(defaultOption);
    
    // Toggle button
    this.lagrangeToggleButton = document.createElement('button');
    this.lagrangeToggleButton.className = 'lagrange-points-toggle';
    this.lagrangeToggleButton.textContent = 'Show';
    this.lagrangeToggleButton.disabled = true;
    
    // Add toggle event
    this.lagrangeToggleButton.addEventListener('click', () => {
      const isVisible = this.lagrangeToggleButton.classList.toggle('active');
      this.lagrangePointVisualizer.setVisible(isVisible);
    });
    
    // Add select event
    this.lagrangeSystemSelect.addEventListener('change', () => {
      const [primaryId, secondaryId] = this.lagrangeSystemSelect.value.split(',');
      
      if (primaryId && secondaryId) {
        const primary = this.objects.find(obj => obj.id === primaryId);
        const secondary = this.objects.find(obj => obj.id === secondaryId);
        
        if (primary && secondary) {
          this.lagrangePointVisualizer.calculateLagrangePoints(primary, secondary);
          this.lagrangeToggleButton.disabled = false;
          
          // Show the points if the toggle is active
          if (this.lagrangeToggleButton.classList.contains('active')) {
            this.lagrangePointVisualizer.setVisible(true);
          }
        }
      } else {
        // Hide the points when no system is selected
        this.lagrangePointVisualizer.setVisible(false);
        this.lagrangeToggleButton.disabled = true;
        this.lagrangeToggleButton.classList.remove('active');
      }
    });
    
    // Assemble container
    container.appendChild(label);
    container.appendChild(this.lagrangeSystemSelect);
    container.appendChild(this.lagrangeToggleButton);
    
    // Add to document
    document.body.appendChild(container);
    
    // Add help context - only if helpSystem is properly initialized
    if (this.helpSystem && typeof this.helpSystem.addContextHelp === 'function') {
      this.helpSystem.addContextHelp(
        'lagrange-points-control',
        `Lagrange points are special positions where a small object can maintain a stable position relative to two larger objects.
        <ol>
          <li>Select a two-body system (e.g., Sun-Earth)</li>
          <li>Click "Show" to display the five Lagrange points</li>
        </ol>`,
        'lagrange-points'
      );
    }
    
    // Update system options when objects change
    this.updateLagrangeSystemOptions();
  }
  
  /**
   * Update available systems for Lagrange point visualization
   */
  updateLagrangeSystemOptions() {
    if (!this.lagrangeSystemSelect) return;
    
    // Clear existing options except default
    while (this.lagrangeSystemSelect.options.length > 1) {
      this.lagrangeSystemSelect.remove(1);
    }
    
    // Find all stars
    const stars = this.objects.filter(obj => obj.type === 'star');
    
    // For each star, add options for star-planet pairs
    stars.forEach(star => {
      // Find planets orbiting this star
      const planets = this.objects.filter(obj => 
        obj.type === 'planet' && 
        obj.orbiting === star.id
      );
      
      // Add option for each star-planet pair
      planets.forEach(planet => {
        const option = document.createElement('option');
        option.value = `${star.id},${planet.id}`;
        option.textContent = `${star.name}-${planet.name}`;
        this.lagrangeSystemSelect.appendChild(option);
      });
    });
  }
  
  /**
   * Initialize help button
   */
  initHelpButton() {
    // Create help button
    const helpButton = document.createElement('button');
    helpButton.className = 'help-button';
    helpButton.innerHTML = '?';
    helpButton.setAttribute('aria-label', 'Open help');
    helpButton.title = 'Open help (H)';
    
    // Add click event
    helpButton.addEventListener('click', () => {
      if (this.helpSystem && typeof this.helpSystem.togglePanel === 'function') {
        this.helpSystem.togglePanel();
      }
    });
    
    // Add to document
    document.body.appendChild(helpButton);
  }
  
  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} e - The keyboard event
   */
  handleKeydown(e) {
    // Space bar toggles play/pause
    if (e.code === 'Space') {
      this.handlePlayPause();
      e.preventDefault();
    }
    
    // Arrow up/down adjusts time scale
    if (e.code === 'ArrowUp') {
      this.handleIncreaseTimeScale();
      e.preventDefault();
    } else if (e.code === 'ArrowDown') {
      this.handleDecreaseTimeScale();
      e.preventDefault();
    }
    
    // 'R' key resets view
    if (e.code === 'KeyR') {
      this.handleResetView();
      e.preventDefault();
    }
    
    // 'H' key toggles help panel
    if (e.code === 'KeyH') {
      if (this.helpSystem && typeof this.helpSystem.togglePanel === 'function') {
        this.helpSystem.togglePanel();
      }
      e.preventDefault();
    }
    
    // 'Escape' key closes help panel and tooltips
    if (e.code === 'Escape') {
      if (this.helpSystem) {
        if (typeof this.helpSystem.hidePanel === 'function') {
          this.helpSystem.hidePanel();
        }
        if (typeof this.helpSystem.hideAllTooltips === 'function') {
          this.helpSystem.hideAllTooltips();
        }
      }
    }
  }
  
  /**
   * Create default solar system
   */
  createDefaultSystem() {
    try {
      // Get default system data
      if (typeof window.getDefaultSystem !== 'function') {
        throw new Error('getDefaultSystem function not found');
      }
      
      const defaultSystem = window.getDefaultSystem();
      
      // Load objects into scene
      for (const objectData of defaultSystem.objects) {
        const object = this.objectHandlers.createCelestialObject(objectData);
        this.objects.push(object);
        this.physics.addObject(object);
        
        // Add light to scene if this is a star
        if (object.light) {
          this.scene.add(object.light);
        }
      }
      
      // Update body count
      this.updateBodyCount();
      
      // Update Lagrange system options
      this.updateLagrangeSystemOptions();
    } catch (error) {
      console.error('Error creating default system:', error);
      throw new Error(`Failed to create default system: ${error.message}`);
    }
  }
  
  /**
   * Start the animation loop
   */
  startAnimationLoop() {
    let lastTime = 0;
    let frameCount = 0;
    let lastFpsUpdate = 0;
    
    const animate = (time) => {
      try {
        // Calculate FPS
        frameCount++;
        if (time - lastFpsUpdate > 1000) {
          const fps = Math.round(frameCount * 1000 / (time - lastFpsUpdate));
          this.fpsCounter.textContent = `FPS: ${fps}`;
          frameCount = 0;
          lastFpsUpdate = time;
        }
        
        // Update physics
        if (!this.paused) {
          this.physics.update(time);
        }
        
        // Update object positions in scene
        for (const object of this.objects) {
          if (object.mesh) {
            object.mesh.position.copy(object.position);
          }
          
          // Update orbit lines if needed
          if (object.updateOrbitLine) {
            object.updateOrbitLine();
          }
        }
        
        // Update gravity visualizer
        this.gravityVisualizer.update(this.objects);
        
        // Update Lagrange points if they're visible
        if (this.lagrangePointVisualizer && this.lagrangePointVisualizer.visible) {
          this.lagrangePointVisualizer.update();
        }
        
        // Update camera controls
        this.cameraControls.update();
        
        // Update info panel if object is selected
        if (this.selectedObjectId) {
          this.updateSelectedObjectInfo();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.sceneManager.camera);
      } catch (error) {
        console.error('Error in animation loop:', error);
      }
      
      // Store time for next frame
      lastTime = time;
      
      // Request next frame
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    if (this.sceneManager && typeof this.sceneManager.handleResize === 'function') {
      this.sceneManager.handleResize();
    }
    
    if (this.cameraControls && typeof this.cameraControls.handleResize === 'function') {
      this.cameraControls.handleResize();
    }
  }
  
  /**
   * Handle play/pause button click
   */
  handlePlayPause() {
    this.paused = !this.paused;
    
    if (this.physics && typeof this.physics.setPaused === 'function') {
      this.physics.setPaused(this.paused);
    }
    
    if (this.playPauseButton) {
      this.playPauseButton.textContent = this.paused ? 'Play' : 'Pause';
    }
  }
  
  /**
   * Handle decrease time scale button click
   */
  handleDecreaseTimeScale() {
    if (this.timeScale <= 0.1) {
      this.timeScale = 0;
    } else if (this.timeScale <= 1) {
      this.timeScale /= 2;
    } else {
      this.timeScale--;
    }
    
    if (this.physics && typeof this.physics.setTimeScale === 'function') {
      this.physics.setTimeScale(this.timeScale);
    }
    
    this.updateTimeDisplay();
  }
  
  /**
   * Handle increase time scale button click
   */
  handleIncreaseTimeScale() {
    if (this.timeScale < 1) {
      this.timeScale *= 2;
    } else {
      this.timeScale++;
    }
    
    if (this.physics && typeof this.physics.setTimeScale === 'function') {
      this.physics.setTimeScale(this.timeScale);
    }
    
    this.updateTimeDisplay();
  }
  
  /**
   * Update time display
   */
  updateTimeDisplay() {
    if (!this.timeDisplay) return;
    
    let displayText = '';
    
    if (this.timeScale === 0) {
      displayText = 'Paused';
    } else if (this.timeScale < 1) {
      displayText = `${this.timeScale.toFixed(2)} days/sec`;
    } else {
      displayText = `${this.timeScale.toFixed(0)} days/sec`;
    }
    
    this.timeDisplay.textContent = displayText;
  }
  
  /**
   * Handle reset view button click
   */
  handleResetView() {
    if (this.cameraControls && typeof this.cameraControls.resetView === 'function') {
      this.cameraControls.resetView();
    }
  }
  
  /**
   * Handle add object button click
   */
  handleAddObject() {
    if (this.objectHandlers && typeof this.objectHandlers.showAddObjectDialog === 'function') {
      this.objectHandlers.showAddObjectDialog();
    }
  }
  
  /**
   * Set camera position
   * @param {Object} position - Position vector with x, y, z properties
   */
  setCameraPosition(position) {
    if (this.cameraControls && typeof this.cameraControls.setPosition === 'function') {
      this.cameraControls.setPosition(position);
    }
  }
  
  /**
   * Focus camera on a specific object
   * @param {String} objectId - ID of the object to focus on
   */
  focusOnObject(objectId) {
    const object = this.objects.find(obj => obj.id === objectId);
    if (object) {
      if (this.cameraControls && typeof this.cameraControls.focusOnObject === 'function') {
        this.cameraControls.focusOnObject(object);
      }
      
      this.selectedObjectId = objectId;
      
      if (this.objectName) {
        this.objectName.textContent = object.name;
      }
      
      this.updateSelectedObjectInfo();
      
      if (this.infoPanel) {
        this.infoPanel.classList.remove('hidden');
      }
    }
  }
  
  /**
   * Set simulation time scale
   * @param {Number} scale - New time scale value
   */
  setTimeScale(scale) {
    this.timeScale = scale;
    
    if (this.physics && typeof this.physics.setTimeScale === 'function') {
      this.physics.setTimeScale(scale);
    }
    
    this.updateTimeDisplay();
  }
  
  /**
   * Highlight an object in the scene
   * @param {String} objectId - ID of the object to highlight
   */
  highlightObject(objectId) {
    // This will be implemented by the TourManager
  }
  
  /**
   * Reset all highlighted objects
   */
  resetHighlights() {
    // This will be implemented by the TourManager
  }
  
  /**
   * Update selected object info in the info panel
   */
  updateSelectedObjectInfo() {
    try {
      const object = this.objects.find(obj => obj.id === this.selectedObjectId);
      
      if (object && this.infoPanelManager && typeof this.infoPanelManager.updateObjectInfo === 'function') {
        this.infoPanelManager.updateObjectInfo(object);
        
        // Update any additional info specific to renderer
        const velocityEl = document.getElementById('velocity-value');
        if (velocityEl && object.velocity) {
          const velocity = object.velocity;
          const speed = Math.sqrt(
            velocity.x * velocity.x + 
            velocity.y * velocity.y + 
            velocity.z * velocity.z
          );
          velocityEl.textContent = `${speed.toFixed(2)} km/s`;
        }
      }
    } catch (error) {
      console.error('Error updating selected object info:', error);
    }
  }
  
  /**
   * Update the body count display
   */
  updateBodyCount() {
    if (this.bodyCount) {
      this.bodyCount.textContent = `Bodies: ${this.objects.length}`;
    }
  }
  
  /**
   * Add the "Show Lagrange Points" option to the educational menu
   * @param {HTMLElement} menu - The educational menu element
   */
  addLagrangePointsMenuItem(menu) {
    if (!menu) return;
    
    const lagrangeItem = document.createElement('button');
    lagrangeItem.className = 'educational-menu-item';
    lagrangeItem.textContent = 'Show Lagrange Points';
    
    lagrangeItem.addEventListener('click', () => {
      // Focus on Lagrange controls
      if (this.lagrangeSystemSelect) {
        this.lagrangeSystemSelect.focus();
        
        // Show tooltip if no system is selected
        if (this.lagrangeSystemSelect.value === '' && 
            this.helpSystem && 
            typeof this.helpSystem.showTooltip === 'function') {
          this.helpSystem.showTooltip(
            this.lagrangeSystemSelect.id || 'lagrange-system-select',
            'Select a system first to display Lagrange points.',
            'lagrange-points'
          );
        }
      }
    });
    
    menu.appendChild(lagrangeItem);
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    try {
      // Cancel animation frame
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      // Remove event listeners
      window.removeEventListener('resize', this.resizeHandler);
      window.removeEventListener('keydown', this.keydownHandler);
      
      if (this.playPauseButton) this.playPauseButton.removeEventListener('click', this.togglePlayPause);
      if (this.timeSlowerButton) this.timeSlowerButton.removeEventListener('click', this.decreaseTimeScale);
      if (this.timeFasterButton) this.timeFasterButton.removeEventListener('click', this.increaseTimeScale);
      if (this.resetViewButton) this.resetViewButton.removeEventListener('click', this.resetView);
      if (this.addObjectButton) this.addObjectButton.removeEventListener('click', this.addNewObject);
      
      // Dispose of help system
      if (this.helpSystem && typeof this.helpSystem.dispose === 'function') {
        this.helpSystem.dispose();
      }
      
      // Dispose of Lagrange point visualizer
      if (this.lagrangePointVisualizer && typeof this.lagrangePointVisualizer.dispose === 'function') {
        this.lagrangePointVisualizer.dispose();
      }
      
      // Dispose of system selector
      if (this.systemSelector && typeof this.systemSelector.dispose === 'function') {
        this.systemSelector.dispose();
      }
      
      // Dispose educational features
      if (this.educationalFeatures && typeof this.educationalFeatures.dispose === 'function') {
        this.educationalFeatures.dispose();
      }
      
      // Dispose of gravity visualizer
      if (this.gravityVisualizer && typeof this.gravityVisualizer.dispose === 'function') {
        this.gravityVisualizer.dispose();
      }
      
      // Dispose of physics simulator
      if (this.physics && typeof this.physics.dispose === 'function') {
        this.physics.dispose();
      }
      
      // Dispose of objects
      for (const object of this.objects) {
        if (object.mesh) {
          // Remove from scene
          if (this.scene && typeof this.scene.remove === 'function') {
            this.scene.remove(object.mesh);
          }
          
          // Dispose of geometries and materials
          if (object.mesh.geometry && typeof object.mesh.geometry.dispose === 'function') {
            object.mesh.geometry.dispose();
          }
          
          if (object.mesh.material) {
            if (Array.isArray(object.mesh.material)) {
              object.mesh.material.forEach(material => {
                if (material && typeof material.dispose === 'function') {
                  material.dispose();
                }
              });
            } else if (object.mesh.material && typeof object.mesh.material.dispose === 'function') {
              object.mesh.material.dispose();
            }
          }
        }
        
        // Remove light from scene if this is a star
        if (object.light && this.scene && typeof this.scene.remove === 'function') {
          this.scene.remove(object.light);
        }
        
        // Dispose of orbit line
        if (object.orbitLine) {
          if (this.scene && typeof this.scene.remove === 'function') {
            this.scene.remove(object.orbitLine);
          }
          if (object.orbitLine.geometry && typeof object.orbitLine.geometry.dispose === 'function') {
            object.orbitLine.geometry.dispose();
          }
          if (object.orbitLine.material && typeof object.orbitLine.material.dispose === 'function') {
            object.orbitLine.material.dispose();
          }
        }
      }
      
      // Clear objects array
      this.objects = [];
      
      // Dispose of camera controls
      if (this.cameraControls && typeof this.cameraControls.dispose === 'function') {
        this.cameraControls.dispose();
      }
      
      // Dispose of scene manager
      if (this.sceneManager && typeof this.sceneManager.dispose === 'function') {
        this.sceneManager.dispose();
      }
      
      console.log('Resources disposed');
    } catch (error) {
      console.error('Error disposing resources:', error);
    }
  }
}

// Add CSS for error messages
const style = document.createElement('style');
style.textContent = `
.error-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid #f00;
  padding: 20px;
  border-radius: 5px;
  color: #f00;
  text-align: center;
  max-width: 80%;
  z-index: 9999;
}
`;
document.head.appendChild(style);

// Clean up resources on window unload
window.addEventListener('beforeunload', () => {
  if (window.solarSystemApp) {
    window.solarSystemApp.dispose();
  }
});