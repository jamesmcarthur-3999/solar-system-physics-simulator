// Scene Manager - Handles THREE.js scene setup and rendering

class SceneManager {
  constructor(container) {
    this.container = container;
    
    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    
    // Initialize camera
    this.setupCamera();
    
    // Initialize renderer
    this.setupRenderer();
    
    // Add ambient light
    this.addLights();
    
    // Add starfield background
    this.addStarfield();
    
    // Handle initial sizing
    this.handleResize();
  }
  
  /**
   * Set up the camera
   */
  setupCamera() {
    const width = this.container.