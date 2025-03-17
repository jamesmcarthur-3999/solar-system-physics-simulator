// Solar System Simulator - Main Renderer

// Access the THREE API from the preload-exposed global variable
const THREE = window.THREE;

// Initialize dummy references to avoid errors
let GravitySimulator = {};
let SceneManager = {};
let CameraControls = {};
let GravityVisualizer = {};
let LagrangePointVisualizer = {};
let Dialogs = {};
let InfoPanel = {};
let ObjectHandlers = {};
let SolarSystem = {};
let getDefaultSystem = () => ({});
let EducationalFeatures = {};
let SystemSelector = {};
let HelpSystem = {};
let downloadAllTextures = async () => {};

// Override these with proper implementations once loaded
try {
  // Initialize modules on window load
  window.addEventListener('DOMContentLoaded', async () => {
    // Load modules dynamically (this would be done with dynamic imports in a proper ES modules setup)
    // But we'll use script tags since that's more reliable with Electron security restrictions
    await loadModules();

    // Start the application
    window.solarSystemApp = new SolarSystemApp();
  });

  async function loadModules() {
    try {
      // Use fetch to load JS files as text
      async function loadScript(url) {
        const response = await fetch(url);
        const scriptText = await response.text();
        // Execute in the current scope using eval
        // This is normally not recommended, but it's a workaround for the module loading issues
        eval(scriptText);
      }
      
      // Load the required modules
      // Note: Order matters! Load dependencies first
      await loadScript('../utils/constants.js');
      await loadScript('../physics/gravitySimulator.js');
      await loadScript('../renderer/scene.js');
      await loadScript('../renderer/cameraControls.js');
      await loadScript('../renderer/gravityVisualizer.js');
      await loadScript('../renderer/LagrangePointVisualizer.js');
      await loadScript('./dialogs.js');
      await loadScript('./infoPanel.js');
      await loadScript('./objectHandlers.js');
      await loadScript('../data/solarSystem.js');
      await loadScript('./educationalFeatures.js');
      await loadScript('./systemSelector.js');
      await loadScript('./HelpSystem.js');
      await loadScript('../utils/downloadTextures.js');
      
      console.log("All modules loaded successfully");
    } catch (error) {
      console.error("Error loading modules:", error);
    }
  }
} catch (e) {
  console.error("Error in module initialization:", e);
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
    // Create scene manager
    this.sceneManager = new SceneManager(this.sceneContainer);
    this.scene = this.sceneManager.scene;
    this.renderer = this.sceneManager.renderer;
    
    // Create camera controls
    this.cameraControls = new CameraControls(
      this.sceneManager.camera,
      this.sceneContainer
    );
    
    // Create physics simulator
    this.physics = new GravitySimulator();
    
    // Create gravity visualizer
    this.gravityVisualizer = new GravityVisualizer(this.scene);
    
    // Create Lagrange point visualizer
    this.lagrangePointVisualizer = new LagrangePointVisualizer(this.scene);
    
    // Create dialogs manager
    this.dialogs = new Dialogs();
    
    // Create info panel
    this.infoPanelManager = new InfoPanel(this.objectProperties);
    
    // Create object handlers
    this.objectHandlers = new ObjectHandlers(this);
    
    // Create system selector
    this.systemSelector = new SystemSelector(this);
    
    // Create educational features
    this.educationalFeatures = new EducationalFeatures(this);
    
    // Create help system
    this.helpSystem = new HelpSystem();
  }
  
  /**
   * Ensure that textures are available
   */
  async ensureTextures() {
    try {
      // Download textures if they don't exist
      await downloadAllTextures();
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
    
    // Create label
    const label = document.createElement('span');
    label.className = 'lagrange-points-label';
    label.textContent = 'Lagrange Points:';
    
    // Create system selector
    this.lagrangeSystemSelect = document.createElement('select');
    this.lagrangeSystemSelect.className = 'lagrange-points-select';
    
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
    
    // Add help context
    this.helpSystem.addContextHelp(
      container.id || Math.random().toString(36).substr(2, 9),
      `Lagrange points are special positions where a small object can maintain a stable position relative to two larger objects.
      <ol>
        <li>Select a two-body system (e.g., Sun-Earth)</li>
        <li>Click "Show" to display the five Lagrange points</li>
      </ol>`,
      'lagrange-points'
    );
    
    // Update system options when objects change
    this.updateLagrangeSystemOptions();
  }
  
  /**
   * Update available systems for Lagrange point visualization
   */
  updateLagrangeSystemOptions() {
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
      this.helpSystem.togglePanel();
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
      this.helpSystem.togglePanel();
      e.preventDefault();
    }
    
    // 'Escape' key closes help panel and tooltips
    if (e.code === 'Escape') {
      this.helpSystem.hidePanel();
      this.helpSystem.hideAllTooltips();
    }
  }
  
  /**
   * Create default solar system
   */
  createDefaultSystem() {
    // Get default system data
    const defaultSystem = getDefaultSystem();
    
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
  }
  
  /**
   * Start the animation loop
   */
  startAnimationLoop() {
    let lastTime = 0;
    let frameCount = 0;
    let lastFpsUpdate = 0;
    
    const animate = (time) => {
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
      if (this.lagrangePointVisualizer.visible) {
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
    this.sceneManager.handleResize();
    this.cameraControls.handleResize();
  }
  
  /**
   * Handle play/pause button click
   */
  handlePlayPause() {
    this.paused = !this.paused;
    this.physics.setPaused(this.paused);
    this.playPauseButton.textContent = this.paused ? 'Play' : 'Pause';
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
    
    this.physics.setTimeScale(this.timeScale);
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
    
    this.physics.setTimeScale(this.timeScale);
    this.updateTimeDisplay();
  }
  
  /**
   * Update time display
   */
  updateTimeDisplay() {
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
    this.cameraControls.resetView();
  }
  
  /**
   * Handle add object button click
   */
  handleAddObject() {
    this.objectHandlers.showAddObjectDialog();
  }
  
  /**
   * Set camera position
   * @param {Object} position - Position vector with x, y, z properties
   */
  setCameraPosition(position) {
    this.cameraControls.setPosition(position);
  }
  
  /**
   * Focus camera on a specific object
   * @param {String} objectId - ID of the object to focus on
   */
  focusOnObject(objectId) {
    const object = this.objects.find(obj => obj.id === objectId);
    if (object) {
      this.cameraControls.focusOnObject(object);
      this.selectedObjectId = objectId;
      this.objectName.textContent = object.name;
      this.updateSelectedObjectInfo();
      this.infoPanel.classList.remove('hidden');
    }
  }
  
  /**
   * Set simulation time scale
   * @param {Number} scale - New time scale value
   */
  setTimeScale(scale) {
    this.timeScale = scale;
    this.physics.setTimeScale(scale);
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
      
      if (object) {
        this.infoPanelManager.updateObjectInfo(object);
        
        // Update any additional info specific to renderer
        const velocityEl = document.getElementById('velocity-value');
        if (velocityEl) {
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
    this.bodyCount.textContent = `Bodies: ${this.objects.length}`;
  }
  
  /**
   * Add the "Show Lagrange Points" option to the educational menu
   * @param {HTMLElement} menu - The educational menu element
   */
  addLagrangePointsMenuItem(menu) {
    const lagrangeItem = document.createElement('button');
    lagrangeItem.className = 'educational-menu-item';
    lagrangeItem.textContent = 'Show Lagrange Points';
    
    lagrangeItem.addEventListener('click', () => {
      // Focus on Lagrange controls
      this.lagrangeSystemSelect.focus();
      
      // Show tooltip if no system is selected
      if (this.lagrangeSystemSelect.value === '') {
        this.helpSystem.showTooltip(
          this.lagrangeSystemSelect.id || Math.random().toString(36).substr(2, 9),
          'Select a system first to display Lagrange points.',
          'lagrange-points'
        );
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
      if (this.helpSystem) {
        this.helpSystem.dispose();
      }
      
      // Dispose of Lagrange point visualizer
      if (this.lagrangePointVisualizer) {
        this.lagrangePointVisualizer.dispose();
      }
      
      // Dispose of system selector
      if (this.systemSelector) {
        this.systemSelector.dispose();
      }
      
      // Dispose educational features
      if (this.educationalFeatures) {
        this.educationalFeatures.dispose();
      }
      
      // Dispose of gravity visualizer
      if (this.gravityVisualizer) {
        this.gravityVisualizer.dispose();
      }
      
      // Dispose of physics simulator
      if (this.physics) {
        this.physics.dispose();
      }
      
      // Dispose of objects
      for (const object of this.objects) {
        if (object.mesh) {
          // Remove from scene
          this.scene.remove(object.mesh);
          
          // Dispose of geometries and materials
          if (object.mesh.geometry) {
            object.mesh.geometry.dispose();
          }
          
          if (object.mesh.material) {
            if (Array.isArray(object.mesh.material)) {
              object.mesh.material.forEach(material => material.dispose());
            } else {
              object.mesh.material.dispose();
            }
          }
        }
        
        // Remove light from scene if this is a star
        if (object.light) {
          this.scene.remove(object.light);
        }
        
        // Dispose of orbit line
        if (object.orbitLine) {
          this.scene.remove(object.orbitLine);
          if (object.orbitLine.geometry) object.orbitLine.geometry.dispose();
          if (object.orbitLine.material) object.orbitLine.material.dispose();
        }
      }
      
      // Clear objects array
      this.objects = [];
      
      // Dispose of camera controls
      if (this.cameraControls) {
        this.cameraControls.dispose();
      }
      
      // Dispose of scene manager
      if (this.sceneManager) {
        this.sceneManager.dispose();
      }
      
      console.log('Resources disposed');
    } catch (error) {
      console.error('Error disposing resources:', error);
    }
  }
}