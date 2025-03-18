// Scene Manager - Handles THREE.js scene setup and rendering

/**
 * SceneManager class
 * Handles THREE.js scene setup, rendering, and cleanup
 */
class SceneManager {
  /**
   * Create a new scene manager
   * @param {HTMLElement} container - DOM element to append renderer to
   */
  constructor(container) {
    this.container = container;
    
    try {
      // Get THREE safely
      const THREE = window.THREE;
      if (!THREE) {
        throw new Error('THREE.js not available');
      }
      
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
      
      console.log("Scene manager initialized successfully");
    } catch (error) {
      console.error('Error initializing SceneManager:', error);
      // Create fallback objects
      this.scene = { add: () => {}, remove: () => {} };
      this.camera = { 
        aspect: 1, 
        updateProjectionMatrix: () => {}, 
        position: { set: () => {}, copy: () => {} },
        lookAt: () => {}
      };
      this.renderer = { 
        setSize: () => {}, 
        render: () => {}, 
        shadowMap: { enabled: false },
        domElement: document.createElement('div')
      };
    }
  }
  
  /**
   * Set up the camera
   */
  setupCamera() {
    try {
      const THREE = window.THREE;
      
      const width = this.container ? this.container.clientWidth : window.innerWidth;
      const height = this.container ? this.container.clientHeight : window.innerHeight;
      
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
      this.camera.position.set(0, 5, 15);
      this.camera.lookAt(0, 0, 0);
    } catch (error) {
      console.error('Error setting up camera:', error);
      // Create a fallback camera
      this.camera = {
        aspect: 1, 
        updateProjectionMatrix: () => {}, 
        position: { set: () => {}, copy: () => {} },
        lookAt: () => {}
      };
    }
  }
  
  /**
   * Set up the renderer
   */
  setupRenderer() {
    try {
      const THREE = window.THREE;
      
      // Configure renderer options based on hardware capabilities
      const rendererOptions = {
        antialias: false, // Disable antialiasing for better performance
        alpha: false,
        precision: 'lowp', // Use lower precision to improve performance
        powerPreference: 'low-power'
      };
      
      // Create renderer with options
      this.renderer = new THREE.WebGLRenderer(rendererOptions);
      
      // Set renderer properties
      this.renderer.setPixelRatio(1); // Use low pixel ratio for better performance
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      
      // Disable shadow maps to improve performance
      this.renderer.shadowMap.enabled = false;
      
      // Set other performance settings
      this.renderer.logarithmicDepthBuffer = false;
      this.renderer.physicallyCorrectLights = false;
      
      // Add renderer to container
      if (this.container) {
        this.container.appendChild(this.renderer.domElement);
      } else {
        document.body.appendChild(this.renderer.domElement);
      }
      
      console.log("THREE.js renderer initialized successfully");
    } catch (error) {
      console.error('Error setting up renderer:', error);
      
      // Try a software renderer as fallback
      try {
        const THREE = window.THREE;
        console.warn("Attempting to use software renderer as fallback");
        
        // Create a very basic renderer
        this.renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: false,
          precision: 'lowp',
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: false
        });
        
        // Set minimal settings
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        
        // Add renderer to container
        if (this.container) {
          this.container.appendChild(this.renderer.domElement);
        }
      } catch (fallbackError) {
        console.error("Software renderer also failed:", fallbackError);
        
        // Create a fallback renderer object that does nothing
        this.renderer = { 
          setSize: () => {}, 
          render: () => {}, 
          shadowMap: { enabled: false },
          domElement: document.createElement('div')
        };
      }
    }
  }
  
  /**
   * Add lights to the scene
   */
  addLights() {
    try {
      const THREE = window.THREE;
      
      // Ambient light
      const ambient = new THREE.AmbientLight(0x404040);
      this.scene.add(ambient);
      
      // Directional light (from the Sun's direction)
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
      sunLight.position.set(0, 0, 0);
      this.scene.add(sunLight);
    } catch (error) {
      console.error('Error adding lights:', error);
    }
  }
  
  /**
   * Add a starfield background
   */
  addStarfield() {
    try {
      const THREE = window.THREE;
      
      // Use fewer stars if we're in software rendering mode
      const starsCount = window.USE_SOFTWARE_RENDERING ? 500 : 2000;
      
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: false
      });
      
      // Generate random stars
      const positions = new Float32Array(starsCount * 3);
      
      for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        // Place stars in a large sphere around the scene
        const radius = 500;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
      }
      
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      this.starField = new THREE.Points(starsGeometry, starsMaterial);
      this.scene.add(this.starField);
    } catch (error) {
      console.error('Error creating starfield:', error);
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    try {
      if (!this.container || !this.camera || !this.renderer) return;
      
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      
      this.renderer.setSize(width, height);
    } catch (error) {
      console.error('Error handling resize:', error);
    }
  }
  
  /**
   * Render the scene
   */
  render() {
    try {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    } catch (error) {
      console.error('Error rendering scene:', error);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    try {
      if (this.renderer) {
        this.renderer.dispose();
        
        if (this.container && this.renderer.domElement) {
          this.container.removeChild(this.renderer.domElement);
        }
      }
      
      // Dispose of starfield geometry and material
      if (this.starField) {
        if (this.starField.geometry) {
          this.starField.geometry.dispose();
        }
        
        if (this.starField.material) {
          this.starField.material.dispose();
        }
        
        this.scene.remove(this.starField);
      }
    } catch (error) {
      console.error('Error disposing scene manager:', error);
    }
  }
}

// Make available to the window context
window.SceneManager = SceneManager;

// Export using CommonJS syntax for compatibility
module.exports = SceneManager;