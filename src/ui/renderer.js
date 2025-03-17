// Import Three.js
const THREE = require('three');
const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls.js');

// Import our modules
const { SceneManager } = require('../renderer/scene.js');
const { GravitySimulator } = require('../physics/gravitySimulator.js');
const CelestialObject = require('../data/celestialObject.js');
const { solarSystemData } = require('../data/solarSystem.js');

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize application
  try {
    const app = new SolarSystemApp();
    app.init();
  } catch (error) {
    console.error('Error initializing application:', error);
    // Display error message to user
    const errorMessage = document.createElement('div');
    errorMessage.style.position = 'absolute';
    errorMessage.style.top = '50%';
    errorMessage.style.left = '50%';
    errorMessage.style.transform = 'translate(-50%, -50%)';
    errorMessage.style.padding = '20px';
    errorMessage.style.backgroundColor = 'rgba(0,0,0,0.8)';
    errorMessage.style.color = 'red';
    errorMessage.style.borderRadius = '5px';
    errorMessage.textContent = 'Failed to initialize the Solar System Simulation. Please check the console for details.';
    document.body.appendChild(errorMessage);
  }
});

// Main application class
class SolarSystemApp {
  constructor() {
    // DOM Elements
    this.sceneContainer = document.getElementById('scene-container');
    this.playPauseButton = document.getElementById('play-pause');
    this.timeSlowerButton = document.getElementById('time-slower');
    this.timeFasterButton = document.getElementById('time-faster');
    this.timeDisplay = document.getElementById('time-display');
    this.addObjectButton = document.getElementById('add-object');
    this.resetViewButton = document.getElementById('reset-view');
    this.infoPanel = document.getElementById('info-panel');
    this.objectName = document.getElementById('object-name');
    this.objectProperties = document.getElementById('object-properties');
    this.fpsDisplay = document.getElementById('fps');
    this.bodyCountDisplay = document.getElementById('body-count');
    
    // State
    this.isPlaying = true;
    this.timeScale = 1; // 1 day per second
    this.selectedObject = null;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    
    // Bind methods
    this.togglePlayPause = this.togglePlayPause.bind(this);
    this.decreaseTimeScale = this.decreaseTimeScale.bind(this);
    this.increaseTimeScale = this.increaseTimeScale.bind(this);
    this.resetView = this.resetView.bind(this);
    this.addNewObject = this.addNewObject.bind(this);
    this.update = this.update.bind(this);
    this.handleObjectClick = this.handleObjectClick.bind(this);
  }
  
  // Initialize the application
  init() {
    console.log('Solar System Simulator initializing...');
    
    try {
      // Initialize the scene manager
      this.sceneManager = new SceneManager(this.sceneContainer);
      
      // Initialize the physics engine
      this.physicsEngine = new GravitySimulator();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load the default solar system
      this.loadDefaultSolarSystem();
      
      // Assign updateObjects method to scene manager
      this.sceneManager.updateObjects = this.updateObjects.bind(this);
      
      // Start the main loop
      this.lastTime = 0;
      this.update(0);
      
      console.log('Solar System Simulator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error; // Re-throw to be caught by the main try-catch
    }
  }
  
  // Set up all event listeners
  setupEventListeners() {
    try {
      this.playPauseButton.addEventListener('click', this.togglePlayPause);
      this.timeSlowerButton.addEventListener('click', this.decreaseTimeScale);
      this.timeFasterButton.addEventListener('click', this.increaseTimeScale);
      this.resetViewButton.addEventListener('click', this.resetView);
      this.addObjectButton.addEventListener('click', this.addNewObject);
      
      // Add event listener for object clicks
      this.sceneContainer.addEventListener('click', (event) => {
        try {
          // Calculate mouse position in normalized device coordinates (-1 to +1)
          const rect = this.sceneContainer.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / this.sceneContainer.clientWidth) * 2 - 1;
          const y = -((event.clientY - rect.top) / this.sceneContainer.clientHeight) * 2 + 1;
          
          // Create a raycaster
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(x, y), this.sceneManager.camera);
          
          // Find all intersected objects
          const intersects = raycaster.intersectObjects(this.sceneManager.scene.children, true);
          
          if (intersects.length > 0) {
            // Find the first intersected object that has a celestial object ID
            for (const intersect of intersects) {
              if (intersect.object.userData && intersect.object.userData.objectId) {
                this.handleObjectClick(intersect.object.userData.objectId);
                break;
              }
            }
          }
        } catch (error) {
          console.error('Error handling object click:', error);
        }
      });
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }
  
  // Load the default solar system
  loadDefaultSolarSystem() {
    try {
      // Create celestial objects from data
      const objects = [];
      
      // Create the sun
      const sun = new CelestialObject(solarSystemData.sun);
      objects.push(sun);
      
      // Create planets
      for (const planetKey of Object.keys(solarSystemData)) {
        if (planetKey === 'sun') continue; // Skip the sun, already added
        if (typeof solarSystemData[planetKey] !== 'object') continue; // Skip non-object properties
        
        const planet = new CelestialObject(solarSystemData[planetKey]);
        objects.push(planet);
      }
      
      // Add objects to scene and physics engine
      for (const object of objects) {
        this.sceneManager.addObject(object);
        this.physicsEngine.addObject(object);
        
        // Create orbit line for planets
        if (!object.isStar) {
          object.createOrbitLine(this.sceneManager.scene);
        }
      }
      
      // Update the body count
      this.bodyCountDisplay.textContent = `Bodies: ${objects.length}`;
      
      console.log(`Loaded ${objects.length} celestial objects`);
    } catch (error) {
      console.error('Error loading default solar system:', error);
    }
  }
  
  // Toggle play/pause
  togglePlayPause() {
    try {
      this.isPlaying = !this.isPlaying;
      this.playPauseButton.textContent = this.isPlaying ? 'Pause' : 'Play';
      this.physicsEngine.setPaused(!this.isPlaying);
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }
  
  // Decrease time scale
  decreaseTimeScale() {
    try {
      if (this.timeScale > 0.1) {
        this.timeScale /= 2;
        this.updateTimeDisplay();
        this.physicsEngine.setTimeScale(this.timeScale);
      }
    } catch (error) {
      console.error('Error decreasing time scale:', error);
    }
  }
  
  // Increase time scale
  increaseTimeScale() {
    try {
      if (this.timeScale < 1024) {
        this.timeScale *= 2;
        this.updateTimeDisplay();
        this.physicsEngine.setTimeScale(this.timeScale);
      }
    } catch (error) {
      console.error('Error increasing time scale:', error);
    }
  }
  
  // Reset camera view
  resetView() {
    try {
      this.sceneManager.resetView();
    } catch (error) {
      console.error('Error resetting view:', error);
    }
  }
  
  // Add a new celestial object
  addNewObject() {
    try {
      // TODO: Open a dialog to create a new celestial object
      console.log('Add object button clicked - functionality not yet implemented');
      
      // For now, add a random asteroid
      this.addRandomAsteroid();
    } catch (error) {
      console.error('Error adding new object:', error);
    }
  }
  
  // Add a random asteroid (temporary function for testing)
  addRandomAsteroid() {
    try {
      // Create a random position between Mars and Jupiter
      const distance = 2.5 + Math.random() * 1.5; // 2.5 - 4 AU
      const angle = Math.random() * Math.PI * 2;
      
      const x = distance * Math.cos(angle);
      const z = distance * Math.sin(angle);
      
      // Calculate orbital velocity (perpendicular to radius)
      const orbitalSpeed = 20 / Math.sqrt(distance); // Approximation
      const vx = -orbitalSpeed * Math.sin(angle);
      const vz = orbitalSpeed * Math.cos(angle);
      
      // Create a new asteroid
      const asteroid = new CelestialObject({
        name: `Asteroid ${Math.floor(Math.random() * 1000)}`,
        mass: 1e17 + Math.random() * 1e19,
        radius: 5 + Math.random() * 50,
        position: [x, (Math.random() - 0.5) * 0.1, z],
        velocity: [vx, (Math.random() - 0.5) * 0.5, vz],
        color: 0x888888 + Math.floor(Math.random() * 0x777777)
      });
      
      // Add to scene and physics
      this.sceneManager.addObject(asteroid);
      this.physicsEngine.addObject(asteroid);
      
      // Create orbit line
      asteroid.createOrbitLine(this.sceneManager.scene);
      
      // Update body count
      const count = this.physicsEngine.objects.length;
      this.bodyCountDisplay.textContent = `Bodies: ${count}`;
      
      console.log(`Added random asteroid at distance ${distance.toFixed(2)} AU`);
    } catch (error) {
      console.error('Error adding random asteroid:', error);
    }
  }
  
  // Handle object click - show info in panel
  handleObjectClick(objectId) {
    try {
      // Find the clicked object
      const clickedObject = this.physicsEngine.objects.find(obj => obj.id === objectId);
      
      if (clickedObject) {
        // Update selected object
        this.selectedObject = clickedObject;
        
        // Show object information
        this.objectName.textContent = clickedObject.name;
        
        // Get object properties
        const info = clickedObject.getInfo();
        
        // Display properties
        this.objectProperties.innerHTML = '';
        for (const [key, value] of Object.entries(info)) {
          if (key === 'name') continue; // Skip name (already shown in title)
          
          const propDiv = document.createElement('div');
          propDiv.className = 'property';
          propDiv.innerHTML = `<span class="property-name">${key}:</span> <span class="property-value">${value}</span>`;
          this.objectProperties.appendChild(propDiv);
        }
        
        // Show the panel
        this.infoPanel.classList.remove('hidden');
        
        console.log(`Selected object: ${clickedObject.name}`);
      }
    } catch (error) {
      console.error('Error handling object click:', error);
    }
  }
  
  // Update time display
  updateTimeDisplay() {
    try {
      let displayText = '';
      if (this.timeScale < 1) {
        displayText = `${this.timeScale * 24} hours/sec`;
      } else if (this.timeScale === 1) {
        displayText = '1 day/sec';
      } else if (this.timeScale < 30) {
        displayText = `${this.timeScale} days/sec`;
      } else if (this.timeScale < 365) {
        displayText = `${(this.timeScale / 30).toFixed(1)} months/sec`;
      } else {
        displayText = `${(this.timeScale / 365).toFixed(1)} years/sec`;
      }
      this.timeDisplay.textContent = displayText;
    } catch (error) {
      console.error('Error updating time display:', error);
    }
  }
  
  // Update objects method called by SceneManager
  updateObjects() {
    // This method is empty as we update objects in the main update loop
  }
  
  // Main update loop
  update(time) {
    // Request the next frame
    requestAnimationFrame(this.update);
    
    try {
      // Calculate delta time
      const deltaTime = (this.lastTime === 0) ? 0 : (time - this.lastTime) / 1000;
      this.lastTime = time;
      
      // Skip first frame
      if (deltaTime === 0) return;
      
      // Update FPS counter
      this.frameCount++;
      if (time - this.lastFpsUpdate > 1000) { // Update FPS display every second
        this.fpsDisplay.textContent = `FPS: ${this.frameCount}`;
        this.frameCount = 0;
        this.lastFpsUpdate = time;
      }
      
      // Update physics
      this.physicsEngine.update(time);
      
      // Update orbit lines for all objects
      for (const object of this.physicsEngine.objects) {
        if (!object.isStar && object.orbitPoints.length > 0) {
          object.createOrbitLine(this.sceneManager.scene);
        }
      }
      
      // Update selected object information if any
      if (this.selectedObject) {
        const info = this.selectedObject.getInfo();
        
        // Update position and velocity which change
        const positionEl = this.objectProperties.querySelector('.property:nth-child(3) .property-value');
        const velocityEl = this.objectProperties.querySelector('.property:nth-child(4) .property-value');
        
        if (positionEl) positionEl.textContent = info.position;
        if (velocityEl) velocityEl.textContent = info.velocity;
      }
    } catch (error) {
      console.error('Error in update loop:', error);
    }
  }
  
  // Clean up resources
  dispose() {
    try {
      // Clean up event listeners
      if (this.playPauseButton) this.playPauseButton.removeEventListener('click', this.togglePlayPause);
      if (this.timeSlowerButton) this.timeSlowerButton.removeEventListener('click', this.decreaseTimeScale);
      if (this.timeFasterButton) this.timeFasterButton.removeEventListener('click', this.increaseTimeScale);
      if (this.resetViewButton) this.resetViewButton.removeEventListener('click', this.resetView);
      if (this.addObjectButton) this.addObjectButton.removeEventListener('click', this.addNewObject);
      
      // Dispose physics engine
      if (this.physicsEngine) {
        this.physicsEngine.dispose();
      }
      
      // Dispose scene manager
      if (this.sceneManager) {
        this.sceneManager.dispose();
      }
      
      console.log('Application resources disposed');
    } catch (error) {
      console.error('Error disposing application resources:', error);
    }
  }
}

// Need to expose window.unload handler to clean up resources
window.addEventListener('beforeunload', () => {
  if (window.solarSystemApp) {
    window.solarSystemApp.dispose();
  }
});
