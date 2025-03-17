// Import Three.js using CommonJS
const THREE = require('three');
const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls.js');

// Scene manager class
class SceneManager {
  constructor(container) {
    this.container = container;
    this.objects = new Map();
    this.init();
  }

  init() {
    try {
      // Create scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x000000);

      // Create camera
      this.setupCamera();
      
      // Create renderer
      this.setupRenderer();
      
      // Add lights
      this.setupLights();
      
      // Add controls
      this.setupControls();
      
      // Add stars background
      this.addStarsBackground();
      
      // Set up resize handler
      this.onWindowResize = this.onWindowResize.bind(this);
      window.addEventListener('resize', this.onWindowResize);
      
      // Start animation loop
      this.animate = this.animate.bind(this);
      this.animate();
    } catch (error) {
      console.error('Error initializing scene:', error);
    }
  }

  setupCamera() {
    try {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
      this.camera.position.set(0, 100, 200);
      this.camera.lookAt(0, 0, 0);
    } catch (error) {
      console.error('Error setting up camera:', error);
      // Create fallback camera
      this.camera = new THREE.PerspectiveCamera();
    }
  }

  setupRenderer() {
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.container.appendChild(this.renderer.domElement);
    } catch (error) {
      console.error('Error setting up renderer:', error);
    }
  }

  setupLights() {
    try {
      // Ambient light for general illumination
      const ambientLight = new THREE.AmbientLight(0x333333);
      this.scene.add(ambientLight);
      
      // Point light at the center (sun)
      const sunLight = new THREE.PointLight(0xffffff, 1.5);
      sunLight.position.set(0, 0, 0);
      this.scene.add(sunLight);
    } catch (error) {
      console.error('Error setting up lights:', error);
    }
  }

  setupControls() {
    try {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.rotateSpeed = 0.5;
      this.controls.minDistance = 20;
      this.controls.maxDistance = 5000;
    } catch (error) {
      console.error('Error setting up controls:', error);
    }
  }

  addStarsBackground() {
    try {
      const geometry = new THREE.BufferGeometry();
      const count = 10000;
      
      // Create random positions for stars
      const positions = new Float32Array(count * 3);
      
      for (let i = 0; i < positions.length; i += 3) {
        // Random positions on a sphere with large radius
        const radius = 5000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: true
      });
      
      this.stars = new THREE.Points(geometry, material);
      this.scene.add(this.stars);
    } catch (error) {
      console.error('Error creating star background:', error);
    }
  }

  onWindowResize() {
    try {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    } catch (error) {
      console.error('Error handling window resize:', error);
    }
  }

  animate() {
    try {
      requestAnimationFrame(this.animate);
      
      // Update controls
      if (this.controls) {
        this.controls.update();
      }
      
      // Update celestial objects (will be implemented later)
      this.updateObjects();
      
      // Render scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    } catch (error) {
      console.error('Error in animation loop:', error);
      // Don't stop the animation loop
    }
  }

  updateObjects() {
    // This will be implemented later to update positions based on physics
  }

  // Public methods for object management
  addObject(object) {
    try {
      if (object && object.mesh) {
        this.objects.set(object.id, object);
        this.scene.add(object.mesh);
      }
    } catch (error) {
      console.error(`Error adding object ${object?.id}:`, error);
    }
  }

  removeObject(id) {
    try {
      const object = this.objects.get(id);
      if (object && object.mesh) {
        this.scene.remove(object.mesh);
        
        // Dispose of resources
        if (typeof object.dispose === 'function') {
          object.dispose();
        }
        
        this.objects.delete(id);
      }
    } catch (error) {
      console.error(`Error removing object ${id}:`, error);
    }
  }

  resetView() {
    try {
      this.camera.position.set(0, 100, 200);
      this.camera.lookAt(0, 0, 0);
      if (this.controls) {
        this.controls.reset();
      }
    } catch (error) {
      console.error('Error resetting view:', error);
    }
  }
  
  // Clean up resources
  dispose() {
    try {
      // Remove event listeners
      window.removeEventListener('resize', this.onWindowResize);
      
      // Dispose of all objects
      this.objects.forEach((object, id) => {
        this.removeObject(id);
      });
      
      // Dispose of stars
      if (this.stars) {
        if (this.stars.geometry) this.stars.geometry.dispose();
        if (this.stars.material) this.stars.material.dispose();
        this.scene.remove(this.stars);
      }
      
      // Dispose of renderer
      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
      
      // Clear references
      this.objects.clear();
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.controls = null;
      this.stars = null;
    } catch (error) {
      console.error('Error disposing scene:', error);
    }
  }
}

// Export using CommonJS syntax
module.exports = { SceneManager };