// Import Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Import our modules
import { SceneManager } from '../renderer/scene.js';
import { GravitySimulator } from '../physics/gravitySimulator.js';
import CelestialObject from '../data/celestialObject.js';
import { solarSystemData } from '../data/solarSystem.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize application
  const app = new SolarSystemApp();
  app.init();
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
    
    // Initialize the scene manager
    this.sceneManager = new SceneManager(this.sceneContainer);
    
    // Initialize the physics engine
    this.physicsEngine = new GravitySimulator();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load the default solar system
    this.loadDefaultSolarSystem();
    
    // Start the main loop
    this.lastTime = 0;
    this.update(0);
  }
  
  // Set up all event listeners
  setupEventListeners() {
    this.playPauseButton.addEventListener('click', this.togglePlayPause);
    this.timeSlowerButton.addEventListener('click', this.decreaseTimeScale);
    this.timeFasterButton.addEventListener('click', this.increaseTimeScale);
    this.resetViewButton.addEventListener('click', this.resetView);
    this.addObjectButton.addEventListener('click', this.addNewObject);
    
    // Add event listener for object clicks
    this.sceneContainer.addEventListener('click', (event) => {
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
    });
  }
  
  // Load the default solar system
  loadDefaultSolarSystem() {
    // Create celestial objects from data
    const objects = [];
    
    // Create the sun
    const sun = new CelestialObject(solarSystemData.sun);
    objects.push(sun);
    
    // Create planets
    for (const planetKey of Object.keys(solarSystemData)) {
      if (planetKey === 'sun') continue; // Skip the sun, already added
      
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
  }
  
  // Toggle play/pause
  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    this.playPauseButton.textContent = this.isPlaying ? 'Pause' : 'Play';
    this.physicsEngine.setPaused(!this.isPlaying);
  }
  
  // Decrease time scale
  decreaseTimeScale() {
    if (this.timeScale > 0.1) {
      this.timeScale /= 2;
      this.updateTimeDisplay();
      this.physicsEngine.setTimeScale(this.timeScale);
    }
  }
  
  // Increase time scale
  increaseTimeScale() {
    if (this.timeScale < 1024) {
      this.timeScale *= 2;
      this.updateTimeDisplay();
      this.physicsEngine.setTimeScale(this.timeScale);
    }
  }
  
  // Reset camera view
  resetView() {
    this.sceneManager.resetView();
  }
  
  // Add a new celestial object (placeholder)
  addNewObject() {
    // TODO: Open a dialog to create a new celestial object
    console.log('Add object button clicked - functionality not yet implemented');
    
    // For now, add a random asteroid
    this.addRandomAsteroid();
  }
  
  // Add a random asteroid (temporary function for testing)
  addRandomAsteroid() {
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
  }
  
  // Handle object click - show info in panel
  handleObjectClick(objectId) {
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
    }
  }
  
  // Update time display
  updateTimeDisplay() {
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
  }
  
  // Main update loop
  update(time) {
    // Request the next frame
    requestAnimationFrame(this.update);
    
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
  }
}
