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
      this.resizeHandler = this.onWindowResize.bind(this);
      window.addEventListener('resize', this.resizeHandler);
      
      // Start animation loop
      this.animate = this.animate.bind(this);
      this.animationFrameId = requestAnimationFrame(this.animate);
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
      // Create a fallback camera
      this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
      this.camera.position.set(0, 0, 100);
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
      if (this.renderer && this.camera) {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 5000;
      }
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
      console.error('Error creating stars background:', error);
    }
  }

  onWindowResize() {
    try {
      if (!this.container || !this.camera || !this.renderer) return;
      
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
      this.animationFrameId = requestAnimationFrame(this.animate);
      
      // Update controls
      if (this.controls) {
        this.controls.update();
      }
      
      // Update celestial objects (implemented by SolarSystemApp)
      this.updateObjects();
      
      // Render scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    } catch (error) {
      console.error('Error in animation loop:', error);
      // Continue animation even if there's an error
    }
  }

  updateObjects() {
    // This is implemented by the SolarSystemApp class
  }

  // Public methods for object management
  addObject(object) {
    try {
      if (object && object.id && object.mesh) {
        this.objects.set(object.id, object);
        this.scene.add(object.mesh);
      }
    } catch (error) {
      console.error(`Error adding object ${object?.name}:`, error);
    }
  }

  removeObject(id) {
    try {
      const object = this.objects.get(id);
      if (object) {
        if (object.mesh) {
          this.scene.remove(object.mesh);
        }
        if (object.orbitLine) {
          this.scene.remove(object.orbitLine);
        }
        this.objects.delete(id);
      }
    } catch (error) {
      console.error(`Error removing object with id ${id}:`, error);
    }
  }

  resetView() {
    try {
      if (this.camera && this.controls) {
        this.camera.position.set(0, 100, 200);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
      }
    } catch (error) {
      console.error('Error resetting view:', error);
    }
  }
  
  // Clean up resources
  dispose() {
    try {
      // Cancel animation frame
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      // Remove event listeners
      window.removeEventListener('resize', this.resizeHandler);
      
      // Dispose of all objects
      this.objects.forEach((object) => {
        if (object && typeof object.dispose === 'function') {
          object.dispose();
        }
      });
      
      // Clear objects map
      this.objects.clear();
      
      // Dispose of THREE.js resources
      if (this.scene) {
        this.scene.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => {
                if (material.map) material.map.dispose();
                material.dispose();
              });
            } else {
              if (object.material.map) object.material.map.dispose();
              object.material.dispose();
            }
          }
        });
      }
      
      // Dispose of renderer
      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
      
      // Clear controls
      if (this.controls) {
        this.controls.dispose();
      }
    } catch (error) {
      console.error('Error disposing scene:', error);
    }
  }
}

// Export using CommonJS syntax
module.exports = {
  SceneManager
};