// Solar System Simulator - Main Renderer
const THREE = require('three');
const { GravitySimulator } = require('../physics/gravitySimulator');
const { SceneManager } = require('../renderer/scene');
const { CameraControls } = require('../renderer/cameraControls');
const { GravityVisualizer } = require('../renderer/gravityVisualizer');
const { Dialogs } = require('./dialogs');
const { InfoPanel } = require('./infoPanel');
const { ObjectHandlers } = require('./objectHandlers');
const { SolarSystem, getDefaultSystem } = require('../data/solarSystem');
const { EducationalFeatures } = require('./educationalFeatures');

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
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Create default solar system
    this.createDefaultSystem();
    
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
    
    // Create dialogs manager
    this.dialogs = new Dialogs();
    
    // Create info panel
    this.infoPanel = new InfoPanel(this.objectProperties);
    
    // Create object handlers
    this.objectHandlers = new ObjectHandlers(this);
    
    // Create educational features
    this.educationalFeatures = new EducationalFeatures(this);
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
    }
    
    // Update body count
    this.updateBodyCount();
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
        this.infoPanel.updateObjectInfo(object);
        
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
      
      if (this.playPauseButton) this.playPauseButton.removeEventListener('click', this.togglePlayPause);
      if (this.timeSlowerButton) this.timeSlowerButton.removeEventListener('click', this.decreaseTimeScale);
      if (this.timeFasterButton) this.timeFasterButton.removeEventListener('click', this.increaseTimeScale);
      if (this.resetViewButton) this.resetViewButton.removeEventListener('click', this.resetView);
      if (this.addObjectButton) this.addObjectButton.removeEventListener('click', this.addNewObject);
      
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

// Create application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SolarSystemApp();
});

// Clean up resources on window unload
window.addEventListener('beforeunload', () => {
  if (window.solarSystemApp) {
    window.solarSystemApp.dispose();
  }
});
