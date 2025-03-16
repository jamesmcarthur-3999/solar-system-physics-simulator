// Import Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene manager class
export class SceneManager {
  constructor(container) {
    this.container = container;
    this.objects = new Map();
    this.init();
  }

  init() {
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
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Start animation loop
    this.animate();
  }

  setupCamera() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    this.camera.position.set(0, 100, 200);
    this.camera.lookAt(0, 0, 0);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
  }

  setupLights() {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x333333);
    this.scene.add(ambientLight);
    
    // Point light at the center (sun)
    const sunLight = new THREE.PointLight(0xffffff, 1.5);
    sunLight.position.set(0, 0, 0);
    this.scene.add(sunLight);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 5000;
  }

  addStarsBackground() {
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
    
    const stars = new THREE.Points(geometry, material);
    this.scene.add(stars);
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Update controls
    this.controls.update();
    
    // Update celestial objects (will be implemented later)
    this.updateObjects();
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  updateObjects() {
    // This will be implemented later to update positions based on physics
  }

  // Public methods for object management
  addObject(object) {
    this.objects.set(object.id, object);
    this.scene.add(object.mesh);
  }

  removeObject(id) {
    const object = this.objects.get(id);
    if (object) {
      this.scene.remove(object.mesh);
      this.objects.delete(id);
    }
  }

  resetView() {
    this.camera.position.set(0, 100, 200);
    this.camera.lookAt(0, 0, 0);
    this.controls.reset();
  }
}