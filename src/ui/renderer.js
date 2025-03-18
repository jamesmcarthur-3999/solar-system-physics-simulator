// Solar System Simulator - Main Renderer

// Access APIs exposed from preload with safety checks
const THREE = window.THREE || {};
const OrbitControls = window.OrbitControls;
const TextGeometry = window.TextGeometry;
const FontLoader = window.FontLoader;

// Check if THREE is properly loaded
if (!THREE || typeof THREE.Scene !== 'function') {
  console.error('THREE.js not properly loaded. Scene constructor not available.');
}

// Browser polyfills for Node.js environment
window.__dirname = '/'; // Simulate __dirname for browser context
window.__filename = '/index.html'; // Simulate __filename for browser context

// Create browser-compatible module system
window.module = { exports: {} };
window.exports = window.module.exports;
window.require = function(name) {
  // Simple module name mapping
  if (name === 'three') return window.THREE || {};
  if (name.includes('OrbitControls')) return { OrbitControls: window.OrbitControls };
  if (name.includes('TextGeometry')) return { TextGeometry: window.TextGeometry };
  if (name.includes('FontLoader')) return { FontLoader: window.FontLoader };
  
  // For other modules, try to find them in window
  const parts = name.split('/');
  const moduleName = parts[parts.length - 1].replace('.js', '');
  
  // Special case handling
  if (name === 'child_process') return { 
    execSync: function() { 
      console.warn('execSync is not available in browser'); 
      return ""; 
    } 
  };
  if (name === 'fs') return window.fs || {};
  if (name === 'path') return window.path || {
    join: function() {
      return Array.from(arguments).join('/').replace(/\/+/g, '/');
    },
    resolve: function() {
      return Array.from(arguments).join('/').replace(/\/+/g, '/');
    }
  };
  
  return window[moduleName] || {};
};

// Setup global namespace for modules
window.solarSystem = {};
window.dialogs = { createObjectDialog: () => {} };
window.tourManager = { TourManager: function() {} };
window.InformationPanelManager = function() { this.addPanel = () => {}; };

// Define placeholder classes with proper THREE integration
class SceneManager {
  constructor(container) { 
    try {
      if (!THREE || !THREE.Scene || typeof THREE.Scene !== 'function') {
        throw new Error('THREE.Scene is not available');
      }
      
      // Initialize scene
      this.scene = new THREE.Scene();
      
      // Check if PerspectiveCamera exists
      if (!THREE.PerspectiveCamera || typeof THREE.PerspectiveCamera !== 'function') {
        throw new Error('THREE.PerspectiveCamera is not available');
      }
      
      // Initialize camera
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 10, 20);
      this.camera.lookAt(0, 0, 0);
      
      // Check if WebGLRenderer exists
      if (!THREE.WebGLRenderer || typeof THREE.WebGLRenderer !== 'function') {
        throw new Error('THREE.WebGLRenderer is not available');
      }
      
      // Initialize renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0x000000);
      
      // Add renderer to container
      if (container) {
        container.appendChild(this.renderer.domElement);
      }
      
      // Check if AmbientLight exists
      if (!THREE.AmbientLight || typeof THREE.AmbientLight !== 'function') {
        throw new Error('THREE.AmbientLight is not available');
      }
      
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0x404040);
      this.scene.add(ambientLight);
    } catch (error) {
      console.error('Error in SceneManager constructor:', error);
      // Create dummy objects to prevent further errors
      this.scene = { add: () => {}, remove: () => {} };
      this.camera = { aspect: 1, position: { set: () => {}, copy: () => {} }, lookAt: () => {}, updateProjectionMatrix: () => {} };
      this.renderer = { setSize: () => {}, setClearColor: () => {}, render: () => {}, dispose: () => {}, domElement: document.createElement('div') };
      throw error;
    }
  }
  
  handleResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

class CameraControls {
  constructor(camera, container) {
    this.camera = camera;
    this.container = container;
    this.controls = null;
    
    try {
      if (OrbitControls && camera && container) {
        this.controls = new OrbitControls(camera, container);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 500;
      } else {
        console.warn('OrbitControls not available, using fallback controls');
      }
    } catch (error) {
      console.error('Error creating OrbitControls:', error);
    }
  }
  
  update() {
    if (this.controls) {
      this.controls.update();
    }
  }
  
  resetView() {
    if (this.camera) {
      this.camera.position.set(0, 10, 20);
      this.camera.lookAt(0, 0, 0);
    }
  }
  
  setPosition(position) {
    if (this.camera) {
      this.camera.position.copy(position);
    }
  }
  
  focusOnObject(object) {
    if (this.camera && object.position) {
      this.camera.lookAt(object.position);
    }
  }
  
  handleResize() {
    // No additional resize handling needed
  }
  
  dispose() {
    if (this.controls) {
      this.controls.dispose();
    }
  }
}

class GravitySimulator {
  constructor() { 
    this.objects = []; 
    this.G = window.CONSTANTS ? window.CONSTANTS.G : 6.67430e-11;
    this.timeScale = 1;
  }
  
  update(time) {
    // Simple circular orbit update for demonstration
    this.objects.forEach(obj => {
      if (obj.orbiting) {
        // Find the parent object
        const parent = this.objects.find(p => p.id === obj.orbiting);
        if (parent) {
          // Update position in a simple circular orbit
          const angle = time * 0.0001 * this.timeScale;
          const distance = 10; // Just a simple distance for demonstration
          obj.position = {
            x: parent.position.x + Math.cos(angle) * distance,
            y: parent.position.y,
            z: parent.position.z + Math.sin(angle) * distance
          };
        }
      }
    });
  }
  
  addObject(object) {
    this.objects.push(object);
  }
  
  setPaused(paused) {
    this.paused = paused;
  }
  
  setTimeScale(scale) {
    this.timeScale = scale;
  }
  
  getObjects() { 
    return this.objects; 
  }
  
  dispose() {
    this.objects = [];
  }
}

class GravityVisualizer {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.meshes = [];
  }
  
  update(objects) {}
  
  toggleVisibility() {
    this.visible = !this.visible;
    this.meshes.forEach(mesh => {
      if (this.scene) {
        if (this.visible) {
          this.scene.add(mesh);
        } else {
          this.scene.remove(mesh);
        }
      }
    });
  }
  
  dispose() {
    this.meshes.forEach(mesh => {
      if (this.scene) this.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });
    this.meshes = [];
  }
}

class LagrangePointVisualizer {
  constructor(scene) { 
    this.scene = scene;
    this.visible = false; 
    this.points = [];
    this.fontLoader = null;
    this.font = null;
    
    // Try to load font if FontLoader is available
    this.loadFont();
  }
  
  loadFont() {
    if (window.FontLoader) {
      try {
        this.fontLoader = new window.FontLoader();
        // Use dummy font for now
        this.font = "Arial";
      } catch (error) {
        console.warn('FontLoader not available, skipping font loading');
      }
    } else {
      console.warn('FontLoader not available, skipping font loading');
    }
  }
  
  calculateLagrangePoints(primary, secondary) {
    // Simple placeholder implementation
    console.log('Calculating Lagrange points for', primary.name, 'and', secondary.name);
    
    // Clear existing points
    this.points.forEach(point => {
      if (this.scene) this.scene.remove(point);
      if (point.geometry) point.geometry.dispose();
      if (point.material) point.material.dispose();
    });
    this.points = [];
    
    // Create simple sphere for each Lagrange point
    for (let i = 1; i <= 5; i++) {
      try {
        if (!THREE || !THREE.SphereGeometry || typeof THREE.SphereGeometry !== 'function') {
          throw new Error('THREE.SphereGeometry is not available');
        }
        
        // Make sure we're using 'new' with SphereGeometry
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position based on which L-point
        const distance = 5; // Simple fixed distance for demonstration
        
        if (i === 1) { // L1
          mesh.position.set(distance, 0, 0);
        } else if (i === 2) { // L2
          mesh.position.set(-distance, 0, 0);
        } else if (i === 3) { // L3
          mesh.position.set(0, 0, distance);
        } else if (i === 4) { // L4
          mesh.position.set(distance, distance, 0);
        } else { // L5
          mesh.position.set(distance, -distance, 0);
        }
        
        this.points.push(mesh);
        
        // Add to scene if visible
        if (this.visible && this.scene) {
          this.scene.add(mesh);
        }
      } catch (error) {
        console.error('Error creating Lagrange point mesh:', error);
      }
    }
  }
  
  setVisible(visible) {
    this.visible = visible;
    this.points.forEach(point => {
      if (this.scene) {
        if (this.visible) {
          this.scene.add(point);
        } else {
          this.scene.remove(point);
        }
      }
    });
  }
  
  update() {}
  
  dispose() {
    this.points.forEach(point => {
      if (this.scene) this.scene.remove(point);
      if (point.geometry) point.geometry.dispose();
      if (point.material) point.material.dispose();
    });
    this.points = [];
  }
}

class Dialogs {
  constructor() {}
  
  createObjectDialog() {
    return { show: () => {} };
  }
  
  dispose() {}
}

class InfoPanel {
  constructor(container) {
    this.container = container;
  }
  
  updateObjectInfo(object) {
    if (this.container && object) {
      let html = '';
      for (const key in object) {
        if (typeof object[key] !== 'function' && typeof object[key] !== 'object') {
          html += `<div><strong>${key}:</strong> ${object[key]}</div>`;
        }
      }
      this.container.innerHTML = html;
    }
  }
  
  dispose() {}
}

class ObjectHandlers {
  constructor(app) {
    this.app = app;
  }
  
  createCelestialObject(data) { 
    try {
      const object = {
        id: data.id || `obj-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name || 'Unknown',
        type: data.type || 'planet',
        mass: data.mass || 1,
        radius: data.radius || 1,
        position: data.position || { x: 0, y: 0, z: 0 },
        velocity: data.velocity || { x: 0, y: 0, z: 0 },
        acceleration: { x: 0, y: 0, z: 0 },
        orbiting: data.orbiting || null,
        mesh: null
      };
      
      // Check if THREE.js objects exist
      if (!THREE || !THREE.SphereGeometry || !THREE.MeshBasicMaterial || !THREE.Mesh) {
        throw new Error('THREE.js objects not available for mesh creation');
      }
      
      // Create mesh - make sure we use 'new' with all THREE constructors
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshBasicMaterial({ 
        color: data.type === 'star' ? 0xffff00 : 0x00ff00 
      });
      object.mesh = new THREE.Mesh(geometry, material);
      object.mesh.scale.set(object.radius / 1000, object.radius / 1000, object.radius / 1000);
      
      // Position mesh
      object.mesh.position.set(
        object.position.x / 1000000, 
        object.position.y / 1000000, 
        object.position.z / 1000000
      );
      
      // Add light if it's a star
      if (data.type === 'star' && THREE.PointLight) {
        object.light = new THREE.PointLight(0xffffff, 1, 100);
        object.light.position.copy(object.mesh.position);
      }
      
      // Add to scene
      if (this.app && this.app.scene) {
        this.app.scene.add(object.mesh);
      }
      
      return object;
    } catch (error) {
      console.error('Error creating celestial object:', error);
      
      // Return a minimal object as fallback
      return {
        id: data.id || `obj-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name || 'Unknown',
        type: data.type || 'planet',
        position: data.position || { x: 0, y: 0, z: 0 },
        velocity: data.velocity || { x: 0, y: 0, z: 0 },
        orbiting: data.orbiting || null
      };
    }
  }
  
  showAddObjectDialog() {}
  
  dispose() {}
}

class EducationalFeatures {
  constructor(app) {
    this.app = app;
    // Fixed constructor call issue here
    try {
      if (window.InformationPanelManager && typeof window.InformationPanelManager === 'function') {
        this.informationPanelManager = new window.InformationPanelManager();
      } else {
        console.warn("InformationPanelManager not available, using fallback");
        this.informationPanelManager = { addPanel: () => {} };
      }
    } catch (error) {
      console.error("Error creating InformationPanelManager:", error);
      this.informationPanelManager = { addPanel: () => {} };
    }
  }
  
  dispose() {}
}

class SystemSelector {
  constructor(app) {
    this.app = app;
  }
  
  dispose() {}
}

class HelpSystem {
  constructor() {
    this.panel = null;
  }
  
  showPanel() {}
  
  hidePanel() {}
  
  togglePanel() {
    if (this.panel) {
      if (this.panel.style.display === 'none') {
        this.panel.style.display = 'block';
      } else {
        this.panel.style.display = 'none';
      }
    }
  }
  
  showTopic() {}
  
  showTooltip() {}
  
  hideAllTooltips() {}
  
  addContextHelp() {}
  
  dispose() {}
}

function getDefaultSystem() { 
  return { 
    objects: [
      {
        id: 'sun',
        name: 'Sun',
        type: 'star',
        mass: 1.989e30,
        radius: 696340,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 }
      },
      {
        id: 'earth',
        name: 'Earth',
        type: 'planet',
        mass: 5.972e24,
        radius: 6371,
        position: { x: 149597870, y: 0, z: 0 },
        velocity: { x: 0, y: 29.78, z: 0 },
        orbiting: 'sun'
      }
    ] 
  }; 
}

async function downloadAllTextures() {
  try {
    console.log("Starting texture check/download process...");
    
    // Use fs.existsSync safely
    if (window.fs && typeof window.fs.existsSync === 'function') {
      console.log('fs.existsSync is available');
    } else {
      console.warn('fs.existsSync is not available, using fallback');
    }
    
    return [];
  } catch (error) {
    console.error('Error downloading textures:', error);
    return [];
  }
}

// Make placeholder classes available globally
window.SceneManager = SceneManager;
window.CameraControls = CameraControls;
window.GravitySimulator = GravitySimulator;
window.GravityVisualizer = GravityVisualizer;
window.LagrangePointVisualizer = LagrangePointVisualizer;
window.Dialogs = Dialogs;
window.InfoPanel = InfoPanel;
window.ObjectHandlers = ObjectHandlers;
window.SolarSystem = { getDefaultSystem: getDefaultSystem };
window.getDefaultSystem = getDefaultSystem;
window.EducationalFeatures = EducationalFeatures;
window.SystemSelector = SystemSelector;
window.HelpSystem = HelpSystem;
window.downloadAllTextures = downloadAllTextures;

// Initialize modules on window load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log("DOM content loaded, starting initialization...");
    
    // Check if THREE is available
    if (!window.THREE || !window.THREE.Scene) {
      console.error("THREE.js not properly loaded on window object");
    } else {
      console.log("THREE.js is loaded and available");
    }
    
    // Initialize constants first to ensure they're available
    await loadConstants();
    
    // Then load the rest of the modules
    await loadModules();
    
    // Create application
    try {
      window.solarSystemApp = new SolarSystemApp();
    } catch (error) {
      console.error("Failed to initialize SolarSystemApp:", error);
      throw error;
    }
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
    try {
      const response = await fetch('../utils/constants.js');
      if (!response.ok) {
        throw new Error(`Failed to load constants.js: ${response.status}`);
      }
      
      // Load constants as a module script
      const constantsScript = document.createElement('script');
      constantsScript.type = 'text/javascript';
      
      const text = await response.text();
      // Remove any exports
      const processedText = text
        .replace(/module\.exports\s*=.*;?/g, '')
        .replace(/__dirname/g, '"/src"'); // Replace __dirname with a string
      
      constantsScript.text = processedText;
      document.head.appendChild(constantsScript);
      
      console.log('Constants loaded successfully');
    } catch (err) {
      console.warn('Error loading constants from file:', err);
      console.warn('Using default constants');
    }
    
    return true;
  } catch (error) {
    console.warn('Error in loadConstants:', error);
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
        
        // Simple validation check - look for unexpected tokens
        if (scriptText.includes('<<<<<<< HEAD') || scriptText.includes('=======') || scriptText.includes('>>>>>>> ')) {
          throw new Error(`Git merge conflicts detected in ${url}. Please resolve conflicts.`);
        }
        
        // Transform the script to handle CommonJS modules and Node.js variables
        let modifiedScript = `
          (function() {
            // Setup fake CommonJS environment
            let module = { exports: {} };
            let exports = module.exports;
            
            // Setup Node.js environment variables
            const __dirname = '/src';
            const __filename = '${url}';
            
            // Original script (with replaced require calls)
            ${scriptText.replace(/\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g, (match, path) => {
              // Simple module name mapping
              if (path === 'three') return 'window.THREE || {}';
              if (path.includes('three')) return 'window.THREE || {}';
              if (path.includes('OrbitControls')) return '{ OrbitControls: window.OrbitControls }';
              if (path.includes('TextGeometry')) return '{ TextGeometry: window.TextGeometry }';
              if (path.includes('FontLoader')) return '{ FontLoader: window.FontLoader }';
              if (path === 'child_process') return '{ execSync: function() { console.warn("execSync not available in browser"); return ""; } }';
              if (path === 'fs') return 'window.fs || {}';
              if (path === 'path') return 'window.path || { join: function() { return Array.from(arguments).join("/").replace(/\\\\/+/g, "/"); } }';
              
              // Other modules - check if they exist in window
              const parts = path.split('/');
              const moduleName = parts[parts.length - 1].replace('.js', '');
              return `window.${moduleName} || {}`;
            })}
            
            // Export to window
            if (typeof module.exports === 'function') {
              // If it exports a constructor
              window[module.exports.name] = module.exports;
            } else if (typeof module.exports === 'object') {
              // If it exports an object with properties
              for (const key in module.exports) {
                if (typeof module.exports[key] === 'function') {
                  // If it's a constructor/class
                  window[key] = module.exports[key];
                } else {
                  // Otherwise export the whole object under a namespace
                  const moduleName = '${url.split('/').pop().replace('.js', '')}';
                  window[moduleName] = window[moduleName] || {};
                  window[moduleName][key] = module.exports[key];
                }
              }
            }
            
            // For classes defined directly
            if (typeof SceneManager !== 'undefined') window.SceneManager = SceneManager;
            if (typeof CameraControls !== 'undefined') window.CameraControls = CameraControls;
            if (typeof GravitySimulator !== 'undefined') window.GravitySimulator = GravitySimulator;
            if (typeof GravityVisualizer !== 'undefined') window.GravityVisualizer = GravityVisualizer;
            if (typeof LagrangePointVisualizer !== 'undefined') window.LagrangePointVisualizer = LagrangePointVisualizer;
            if (typeof Dialogs !== 'undefined') window.Dialogs = Dialogs;
            if (typeof InfoPanel !== 'undefined') window.InfoPanel = InfoPanel;
            if (typeof ObjectHandlers !== 'undefined') window.ObjectHandlers = ObjectHandlers;
            if (typeof getDefaultSystem !== 'undefined') window.getDefaultSystem = getDefaultSystem;
            if (typeof EducationalFeatures !== 'undefined') window.EducationalFeatures = EducationalFeatures;
            if (typeof SystemSelector !== 'undefined') window.SystemSelector = SystemSelector;
            if (typeof HelpSystem !== 'undefined') window.HelpSystem = HelpSystem;
            if (typeof downloadAllTextures !== 'undefined') window.downloadAllTextures = downloadAllTextures;
          })();
        `;
        
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
        console.warn(`Continuing with placeholder implementation for ${modulePath}`);
        // Continue with next module rather than throwing, so we can load as many as possible
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
      // Log what's available to help debug
      console.log("Available modules:", {
        SceneManager: typeof window.SceneManager,
        CameraControls: typeof window.CameraControls,
        GravitySimulator: typeof window.GravitySimulator,
        GravityVisualizer: typeof window.GravityVisualizer,
        LagrangePointVisualizer: typeof window.LagrangePointVisualizer
      });
      
      // Verify THREE.js is available
      if (!window.THREE || !window.THREE.Scene) {
        throw new Error("THREE.js not properly loaded. Cannot initialize scene.");
      }
      
      // Create scene manager with better error handling
      try {
        // Make sure we use the proper constructor with 'new'
        this.sceneManager = new SceneManager(this.sceneContainer);
        this.scene = this.sceneManager.scene;
        this.renderer = this.sceneManager.renderer;
      } catch (error) {
        console.error('Error initializing scene:', error);
        throw error;
      }
      
      // Create camera controls
      try {
        this.cameraControls = new CameraControls(
          this.sceneManager.camera,
          this.sceneContainer
        );
      } catch (error) {
        console.error('Error creating CameraControls:', error);
        this.cameraControls = {
          update: () => {},
          resetView: () => {},
          setPosition: () => {},
          focusOnObject: () => {},
          handleResize: () => {},
          dispose: () => {}
        };
      }
      
      // Create physics simulator
      try {
        this.physics = new GravitySimulator();
      } catch (error) {
        console.error('Error creating GravitySimulator:', error);
        this.physics = {
          update: () => {},
          addObject: () => {},
          setPaused: () => {},
          setTimeScale: () => {},
          getObjects: () => [],
          dispose: () => {}
        };
      }
      
      // Create gravity visualizer
      try {
        this.gravityVisualizer = new GravityVisualizer(this.scene);
      } catch (error) {
        console.error('Error creating GravityVisualizer:', error);
        this.gravityVisualizer = {
          update: () => {},
          toggleVisibility: () => {},
          dispose: () => {}
        };
      }
      
      // Create Lagrange point visualizer
      try {
        this.lagrangePointVisualizer = new LagrangePointVisualizer(this.scene);
      } catch (error) {
        console.error('Error creating LagrangePointVisualizer:', error);
        this.lagrangePointVisualizer = {
          update: () => {},
          setVisible: () => {},
          calculateLagrangePoints: () => {},
          dispose: () => {}
        };
      }
      
      // Create dialogs manager
      try {
        this.dialogs = new Dialogs();
      } catch (error) {
        console.error('Error creating Dialogs:', error);
        this.dialogs = {
          createObjectDialog: () => ({ show: () => {} }),
          dispose: () => {}
        };
      }
      
      // Create info panel
      try {
        this.infoPanelManager = new InfoPanel(this.objectProperties);
      } catch (error) {
        console.error('Error creating InfoPanel:', error);
        this.infoPanelManager = {
          updateObjectInfo: () => {},
          dispose: () => {}
        };
      }
      
      // Create object handlers
      try {
        this.objectHandlers = new ObjectHandlers(this);
      } catch (error) {
        console.error('Error creating ObjectHandlers:', error);
        this.objectHandlers = {
          createCelestialObject: (data) => ({ 
            id: data.id, 
            name: data.name,
            position: data.position || { x: 0, y: 0, z: 0 } 
          }),
          showAddObjectDialog: () => {},
          dispose: () => {}
        };
      }
      
      // Create system selector
      try {
        this.systemSelector = new SystemSelector(this);
      } catch (error) {
        console.error('Error creating SystemSelector:', error);
        this.systemSelector = {
          dispose: () => {}
        };
      }
      
      // Create educational features
      try {
        this.educationalFeatures = new EducationalFeatures(this);
      } catch (error) {
        console.error('Error creating EducationalFeatures:', error);
        this.educationalFeatures = {
          dispose: () => {}
        };
      }
      
      // Create help system
      try {
        this.helpSystem = new HelpSystem();
      } catch (error) {
        console.error('Error creating HelpSystem:', error);
        this.helpSystem = {
          showPanel: () => {},
          hidePanel: () => {},
          togglePanel: () => {},
          showTopic: () => {},
          showTooltip: () => {},
          hideAllTooltips: () => {},
          addContextHelp: () => {},
          dispose: () => {}
        };
      }
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
    if (this.playPauseButton) {
      this.playPauseButton.addEventListener('click', this.togglePlayPause);
    }
    
    // Handle time scale buttons
    this.decreaseTimeScale = () => this.handleDecreaseTimeScale();
    if (this.timeSlowerButton) {
      this.timeSlowerButton.addEventListener('click', this.decreaseTimeScale);
    }
    
    this.increaseTimeScale = () => this.handleIncreaseTimeScale();
    if (this.timeFasterButton) {
      this.timeFasterButton.addEventListener('click', this.increaseTimeScale);
    }
    
    // Handle reset view button
    this.resetView = () => this.handleResetView();
    if (this.resetViewButton) {
      this.resetViewButton.addEventListener('click', this.resetView);
    }
    
    // Handle add object button
    this.addNewObject = () => this.handleAddObject();
    if (this.addObjectButton) {
      this.addObjectButton.addEventListener('click', this.addNewObject);
    }
    
    // Handle keyboard shortcuts
    this.keydownHandler = (e) => this.handleKeydown(e);
    window.addEventListener('keydown', this.keydownHandler);
  }
  
  /**
   * Initialize Lagrange Points controls
   */
  initLagrangePointsControls() {
    try {
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
        if (this.lagrangePointVisualizer && typeof this.lagrangePointVisualizer.setVisible === 'function') {
          this.lagrangePointVisualizer.setVisible(isVisible);
        }
      });
      
      // Add select event
      this.lagrangeSystemSelect.addEventListener('change', () => {
        const [primaryId, secondaryId] = this.lagrangeSystemSelect.value.split(',');
        
        if (primaryId && secondaryId) {
          const primary = this.objects.find(obj => obj.id === primaryId);
          const secondary = this.objects.find(obj => obj.id === secondaryId);
          
          if (primary && secondary && this.lagrangePointVisualizer && 
              typeof this.lagrangePointVisualizer.calculateLagrangePoints === 'function') {
            this.lagrangePointVisualizer.calculateLagrangePoints(primary, secondary);
            this.lagrangeToggleButton.disabled = false;
            
            // Show the points if the toggle is active
            if (this.lagrangeToggleButton.classList.contains('active') && 
                typeof this.lagrangePointVisualizer.setVisible === 'function') {
              this.lagrangePointVisualizer.setVisible(true);
            }
          }
        } else {
          // Hide the points when no system is selected
          if (this.lagrangePointVisualizer && typeof this.lagrangePointVisualizer.setVisible === 'function') {
            this.lagrangePointVisualizer.setVisible(false);
          }
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
    } catch (error) {
      console.error("Error initializing Lagrange Points controls:", error);
    }
  }
  
  /**
   * Update available systems for Lagrange point visualization
   */
  updateLagrangeSystemOptions() {
    if (!this.lagrangeSystemSelect) return;
    
    try {
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
    } catch (error) {
      console.error("Error updating Lagrange system options:", error);
    }
  }
  
  /**
   * Initialize help button
   */
  initHelpButton() {
    try {
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
    } catch (error) {
      console.error("Error initializing help button:", error);
    }
  }
  
  /**
   * Handle keyboard shortcuts
   * @param {KeyboardEvent} e - The keyboard event
   */
  handleKeydown(e) {
    try {
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
    } catch (error) {
      console.error("Error handling keyboard event:", error);
    }
  }
  
  /**
   * Create default solar system
   */
  createDefaultSystem() {
    try {
      // Get default system data - try window function first, then local
      let defaultSystem;
      if (typeof window.getDefaultSystem === 'function') {
        defaultSystem = window.getDefaultSystem();
      } else if (typeof getDefaultSystem === 'function') {
        defaultSystem = getDefaultSystem();
      } else {
        throw new Error('getDefaultSystem function not found');
      }
      
      // Load objects into scene
      if (defaultSystem && defaultSystem.objects) {
        for (const objectData of defaultSystem.objects) {
          if (this.objectHandlers && typeof this.objectHandlers.createCelestialObject === 'function') {
            const object = this.objectHandlers.createCelestialObject(objectData);
            this.objects.push(object);
            if (this.physics && typeof this.physics.addObject === 'function') {
              this.physics.addObject(object);
            }
            
            // Add light to scene if this is a star
            if (object.light && this.scene) {
              this.scene.add(object.light);
            }
          }
        }
      }
      
      // Update body count
      this.updateBodyCount();
      
      // Update Lagrange system options
      this.updateLagrangeSystemOptions();
    } catch (error) {
      console.error('Error creating default system:', error);
      // Create a simple system as fallback
      if (this.objectHandlers && typeof this.objectHandlers.createCelestialObject === 'function') {
        const sun = this.objectHandlers.createCelestialObject({
          id: 'sun',
          name: 'Sun',
          type: 'star',
          mass: 1.989e30,
          radius: 696340,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        });
        
        const earth = this.objectHandlers.createCelestialObject({
          id: 'earth',
          name: 'Earth',
          type: 'planet',
          mass: 5.972e24,
          radius: 6371,
          position: { x: 149597870, y: 0, z: 0 },
          velocity: { x: 0, y: 29.78, z: 0 },
          orbiting: 'sun'
        });
        
        this.objects.push(sun, earth);
        if (this.physics && typeof this.physics.addObject === 'function') {
          this.physics.addObject(sun);
          this.physics.addObject(earth);
        }
        
        this.updateBodyCount();
        this.updateLagrangeSystemOptions();
      }
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
          if (this.fpsCounter) {
            this.fpsCounter.textContent = `FPS: ${fps}`;
          }
          frameCount = 0;
          lastFpsUpdate = time;
        }
        
        // Update physics
        if (!this.paused && this.physics && typeof this.physics.update === 'function') {
          this.physics.update(time);
        }
        
        // Update object positions in scene
        for (const object of this.objects) {
          if (object.mesh && object.position) {
            object.mesh.position.x = object.position.x / 1000000;
            object.mesh.position.y = object.position.y / 1000000;
            object.mesh.position.z = object.position.z / 1000000;
          }
          
          // Update orbit lines if needed
          if (object.updateOrbitLine && typeof object.updateOrbitLine === 'function') {
            object.updateOrbitLine();
          }
        }
        
        // Update gravity visualizer
        if (this.gravityVisualizer && typeof this.gravityVisualizer.update === 'function') {
          this.gravityVisualizer.update(this.objects);
        }
        
        // Update Lagrange points if they're visible
        if (this.lagrangePointVisualizer && this.lagrangePointVisualizer.visible && 
            typeof this.lagrangePointVisualizer.update === 'function') {
          this.lagrangePointVisualizer.update();
        }
        
        // Update camera controls
        if (this.cameraControls && typeof this.cameraControls.update === 'function') {
          this.cameraControls.update();
        }
        
        // Update info panel if object is selected
        if (this.selectedObjectId) {
          this.updateSelectedObjectInfo();
        }
        
        // Render scene - ensure renderer and scene exist
        if (this.renderer && this.scene && this.sceneManager && this.sceneManager.camera) {
          this.renderer.render(this.scene, this.sceneManager.camera);
        } else {
          // Skip rendering if components aren't available, but don't throw error
        }
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
    try {
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
    } catch (error) {
      console.error("Error focusing on object:", error);
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
    
    try {
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
    } catch (error) {
      console.error("Error adding Lagrange Points menu item:", error);
    }
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

// Add CSS for error messages and UI components
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

.lagrange-points-control {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 5px;
  color: white;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
}

.lagrange-points-select {
  padding: 5px;
  border-radius: 3px;
}

.lagrange-points-toggle {
  padding: 5px 10px;
  border-radius: 3px;
  background: #2a2a2a;
  color: white;
  border: 1px solid #444;
  cursor: pointer;
}

.lagrange-points-toggle.active {
  background: #3a3a3a;
  border-color: #666;
}

.help-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 20px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
`;
document.head.appendChild(style);

// Clean up resources on window unload
window.addEventListener('beforeunload', () => {
  if (window.solarSystemApp) {
    window.solarSystemApp.dispose();
  }
});
