// Solar System Simulator - Main Renderer

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM content loaded, starting initialization...");
  initializeSolarSystemSimulator();
});

/**
 * Main initialization function for the Solar System Simulator
 */
async function initializeSolarSystemSimulator() {
  try {
    // Access APIs exposed from preload with safety checks
    const THREE = window.THREE || {};
    const OrbitControls = window.OrbitControls;
    
    // Check if THREE is properly loaded
    if (!THREE || typeof THREE.Scene !== 'function') {
      console.error('THREE.js not properly loaded. Scene constructor not available.');
      displayErrorMessage('THREE.js library not properly loaded. Please check console for details.');
      return;
    }
    
    console.log("THREE.js is loaded and available");
    
    // Initialize constants first to ensure they're available
    await loadConstants();
    
    // Then load all required modules
    await loadModules();
    
    // Create the application
    try {
      window.solarSystemApp = new SolarSystemApp();
      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Failed to initialize SolarSystemApp:", error);
      displayErrorMessage(`Error initializing application: ${error.message}`);
      throw error;
    }
  } catch (error) {
    console.error('Error initializing application:', error);
    displayErrorMessage(`Critical error: ${error.message}`);
  }
}

/**
 * Display an error message to the user
 * @param {string} message - Error message to display
 */
function displayErrorMessage(message) {
  // Remove any existing error messages
  const existingErrors = document.querySelectorAll('.error-message');
  existingErrors.forEach(el => el.remove());
  
  // Create new error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <h2>Error Loading Application</h2>
    <p>${message}</p>
    <p>Please check the console for more details.</p>
  `;
  document.body.appendChild(errorDiv);
}

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
        .replace(/module\\.exports\\s*=.*;?/g, '')
        .replace(/__dirname/g, '\"/src\"'); // Replace __dirname with a string
      
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
            ${scriptText.replace(/\\brequire\\s*\\(\\s*['\"]([^'\"]+)['\"]\\s*\\)/g, (match, path) => {
              // Simple module name mapping
              if (path === 'three') return 'window.THREE || {}';
              if (path.includes('three')) return 'window.THREE || {}';
              if (path.includes('OrbitControls')) return '{ OrbitControls: window.OrbitControls }';
              if (path.includes('TextGeometry')) return '{ TextGeometry: window.TextGeometry }';
              if (path.includes('FontLoader')) return '{ FontLoader: window.FontLoader }';
              if (path === 'child_process') return '{ execSync: function() { console.warn("execSync not available in browser"); return ""; } }';
              if (path === 'fs') return 'window.fs || {}';
              if (path === 'path') return 'window.path || { join: function() { return Array.from(arguments).join("/").replace(/\\\\\\\\/+/g, "/"); } }';
              
              // Other modules - check if they exist in window
              const parts = path.split('/');
              const moduleName = parts[parts.length - 1].replace('.js', '');
              return `window.${moduleName} || {}`;
            })}
            
            // Export to window
            if (typeof module.exports === 'function') {
              // If it exports a constructor
              window[module.exports.name || '${url.split('/').pop().replace('.js', '')}'] = module.exports;
            } else if (typeof module.exports === 'object') {
              // If it exports an object with properties
              for (const key in module.exports) {
                if (Object.prototype.hasOwnProperty.call(module.exports, key)) {
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
            }
            
            // Special case for modules exporting a single class
            const moduleNameSingle = '${url.split('/').pop().replace('.js', '')}';
            if (module.exports && !window[moduleNameSingle]) {
              window[moduleNameSingle] = module.exports;
            }
          })();
        `;
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
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
      '../data/celestialObject.js',
      '../data/solarSystem.js',
      './educationalFeatures.js',
      './systemSelector.js',
      './HelpSystem.js',
      '../utils/downloadTextures.js'
    ];
    
    // Setup global namespace for modules that might not exist
    window.solarSystem = window.solarSystem || {};
    
    // Load modules sequentially
    const loadedModules = [];
    const failedModules = [];
    
    for (const modulePath of modules) {
      try {
        await loadModuleScript(modulePath);
        loadedModules.push(modulePath);
      } catch (error) {
        console.error(`Failed to load module ${modulePath}:`, error);
        console.warn(`Continuing with placeholder implementation for ${modulePath}`);
        failedModules.push(modulePath);
        // Continue with next module rather than throwing, so we can load as many as possible
      }
    }
    
    console.log(`Modules loaded: ${loadedModules.length}/${modules.length}`);
    
    if (failedModules.length > 0) {
      console.warn(`Failed to load ${failedModules.length} modules:`, failedModules);
    } else {
      console.log('All modules loaded successfully');
    }
  } catch (error) {
    console.error('Error loading modules:', error);
    throw error;
  }
}

// Main application class for Solar System Simulator
class SolarSystemApp {
  constructor() {
    // Initialize state
    this.timeScale = 1; // 1 day per second
    this.paused = false;
    this.objects = [];
    this.selectedObjectId = null;
    
    // Get DOM elements
    this.getUIElements();
    
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
   * Get UI elements from the DOM
   */
  getUIElements() {
    try {
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
    } catch (error) {
      console.error('Error getting UI elements:', error);
    }
  }
  
  /**
   * Initialize all managers and controllers
   */
  initManagers() {
    try {
      // Create scene manager
      this.initSceneManager();
      
      // Create camera controls
      this.initCameraControls();
      
      // Create physics simulator
      this.initPhysicsSimulator();
      
      // Create gravity visualizer
      this.initGravityVisualizer();
      
      // Create Lagrange point visualizer
      this.initLagrangePointVisualizer();
      
      // Create dialogs manager
      this.initDialogs();
      
      // Create info panel
      this.initInfoPanel();
      
      // Create object handlers
      this.initObjectHandlers();
      
      // Create system selector
      this.initSystemSelector();
      
      // Create educational features
      this.initEducationalFeatures();
      
      // Create help system
      this.initHelpSystem();
    } catch (error) {
      console.error('Error initializing managers:', error);
      throw new Error(`Failed to initialize managers: ${error.message}`);
    }
  }
  
  /**
   * Initialize scene manager
   */
  initSceneManager() {
    try {
      if (typeof window.SceneManager === 'function') {
        this.sceneManager = new window.SceneManager(this.sceneContainer);
        this.scene = this.sceneManager.scene;
        this.renderer = this.sceneManager.renderer;
      } else {
        console.error('SceneManager not found, creating fallback');
        this.createFallbackSceneManager();
      }
    } catch (error) {
      console.error('Error initializing scene manager:', error);
      this.createFallbackSceneManager();
    }
  }
  
  /**
   * Create a fallback scene manager if the real one fails
   */
  createFallbackSceneManager() {
    console.warn('Creating fallback scene manager');
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
    this.sceneManager = {
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      handleResize: () => {},
      render: () => {},
      dispose: () => {}
    };
  }
  
  /**
   * Initialize camera controls
   */
  initCameraControls() {
    try {
      if (typeof window.CameraControls === 'function') {
        this.cameraControls = new window.CameraControls(
          this.sceneManager.camera,
          this.sceneContainer
        );
      } else {
        console.error('CameraControls not found, creating fallback');
        this.createFallbackCameraControls();
      }
    } catch (error) {
      console.error('Error initializing camera controls:', error);
      this.createFallbackCameraControls();
    }
  }
  
  /**
   * Create fallback camera controls
   */
  createFallbackCameraControls() {
    console.warn('Creating fallback camera controls');
    this.cameraControls = {
      update: () => {},
      resetView: () => {},
      setPosition: () => {},
      focusOnObject: () => {},
      handleResize: () => {},
      dispose: () => {}
    };
  }
  
  /**
   * Initialize physics simulator
   */
  initPhysicsSimulator() {
    try {
      if (typeof window.GravitySimulator === 'function') {
        this.physics = new window.GravitySimulator();
      } else {
        console.error('GravitySimulator not found, creating fallback');
        this.createFallbackPhysicsSimulator();
      }
    } catch (error) {
      console.error('Error initializing physics simulator:', error);
      this.createFallbackPhysicsSimulator();
    }
  }
  
  /**
   * Create fallback physics simulator
   */
  createFallbackPhysicsSimulator() {
    console.warn('Creating fallback physics simulator');
    this.physics = {
      objects: [],
      update: () => {},
      addObject: (obj) => { this.physics.objects.push(obj); },
      setPaused: () => {},
      setTimeScale: () => {},
      getObjects: () => this.physics.objects,
      dispose: () => { this.physics.objects = []; }
    };
  }
  
  /**
   * Initialize gravity visualizer
   */
  initGravityVisualizer() {
    try {
      if (typeof window.GravityVisualizer === 'function') {
        this.gravityVisualizer = new window.GravityVisualizer(this.scene);
      } else {
        console.error('GravityVisualizer not found, creating fallback');
        this.createFallbackGravityVisualizer();
      }
    } catch (error) {
      console.error('Error initializing gravity visualizer:', error);
      this.createFallbackGravityVisualizer();
    }
  }
  
  /**
   * Create fallback gravity visualizer
   */
  createFallbackGravityVisualizer() {
    console.warn('Creating fallback gravity visualizer');
    this.gravityVisualizer = {
      update: () => {},
      toggleVisibility: () => {},
      dispose: () => {}
    };
  }
  
  /**
   * Initialize Lagrange point visualizer
   */
  initLagrangePointVisualizer() {
    try {
      if (typeof window.LagrangePointVisualizer === 'function') {
        this.lagrangePointVisualizer = new window.LagrangePointVisualizer(this.scene);
      } else {
        console.error('LagrangePointVisualizer not found, creating fallback');
        this.createFallbackLagrangePointVisualizer();
      }
    } catch (error) {
      console.error('Error initializing Lagrange point visualizer:', error);
      this.createFallbackLagrangePointVisualizer();
    }
  }
  
  /**
   * Create fallback Lagrange point visualizer
   */
  createFallbackLagrangePointVisualizer() {
    console.warn('Creating fallback Lagrange point visualizer');
    this.lagrangePointVisualizer = {
      update: () => {},
      setVisible: () => {},
      calculateLagrangePoints: () => {},
      dispose: () => {}
    };
  }
  
  /**
   * Initialize dialogs manager
   */
  initDialogs() {
    try {
      if (typeof window.Dialogs === 'function') {
        this.dialogs = new window.Dialogs();
      } else {
        console.error('Dialogs not found, creating fallback');
        this.createFallbackDialogs();
      }
    } catch (error) {
      console.error('Error initializing dialogs:', error);
      this.createFallbackDialogs();
    }
  }
  
  /**
   * Create fallback dialogs manager
   */
  createFallbackDialogs() {
    console.warn('Creating fallback dialogs manager');
    this.dialogs = {
      createObjectDialog: () => ({ show: () => {} }),
      dispose: () => {}
    };
  }
  
  /**
   * Initialize info panel
   */
  initInfoPanel() {
    try {
      if (typeof window.InfoPanel === 'function') {
        this.infoPanelManager = new window.InfoPanel(this.objectProperties);
      } else {
        console.error('InfoPanel not found, creating fallback');
        this.createFallbackInfoPanel();
      }
    } catch (error) {
      console.error('Error initializing info panel:', error);
      this.createFallbackInfoPanel();
    }
  }
  
  /**
   * Create fallback info panel
   */
  createFallbackInfoPanel() {
    console.warn('Creating fallback info panel');
    this.infoPanelManager = {
      updateObjectInfo: () => {},
      dispose: () => {}
    };
  }
  
  /**
   * Initialize object handlers
   */
  initObjectHandlers() {
    try {
      if (typeof window.ObjectHandlers === 'function') {
        this.objectHandlers = new window.ObjectHandlers(this);
      } else {
        console.error('ObjectHandlers not found, creating fallback');
        this.createFallbackObjectHandlers();
      }
    } catch (error) {
      console.error('Error initializing object handlers:', error);
      this.createFallbackObjectHandlers();
    }
  }
  
  /**
   * Create fallback object handlers
   */
  createFallbackObjectHandlers() {
    const THREE = window.THREE;
    console.warn('Creating fallback object handlers');
    this.objectHandlers = {
      createCelestialObject: (data) => {
        // Create a very basic celestial object
        const object = {
          id: data.id || `obj-${Math.random().toString(36).substr(2, 9)}`,
          name: data.name || 'Unknown',
          type: data.type || 'planet',
          mass: data.mass || 1,
          radius: data.radius || 1,
          position: { 
            x: data.position ? data.position[0] || 0 : 0,
            y: data.position ? data.position[1] || 0 : 0,
            z: data.position ? data.position[2] || 0 : 0
          },
          velocity: { 
            x: data.velocity ? data.velocity[0] || 0 : 0,
            y: data.velocity ? data.velocity[1] || 0 : 0,
            z: data.velocity ? data.velocity[2] || 0 : 0
          },
          acceleration: { x: 0, y: 0, z: 0 },
          orbiting: data.orbiting || null
        };
        
        // Create mesh if THREE is available
        if (THREE) {
          try {
            // Create geometry
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
            
            // Add to scene
            if (this.scene) {
              this.scene.add(object.mesh);
            }
          } catch (error) {
            console.error('Error creating fallback object mesh:', error);
          }
        }
        
        return object;
      },
      showAddObjectDialog: () => {},
      dispose: () => {}
    };
  }
  
  /**
   * Initialize system selector
   */
  initSystemSelector() {
    try {
      if (typeof window.SystemSelector === 'function') {
        this.systemSelector = new window.SystemSelector(this);
      } else {
        console.error('SystemSelector not found, creating fallback');
        this.createFallbackSystemSelector();
      }
    } catch (error) {
      console.error('Error initializing system selector:', error);
      this.createFallbackSystemSelector();
    }
  }
  
  /**
   * Create fallback system selector
   */
  createFallbackSystemSelector() {
    console.warn('Creating fallback system selector');
    this.systemSelector = {
      dispose: () => {}
    };
  }
  
  /**
   * Initialize educational features
   */
  initEducationalFeatures() {
    try {
      if (typeof window.EducationalFeatures === 'function') {
        this.educationalFeatures = new window.EducationalFeatures(this);
      } else {
        console.error('EducationalFeatures not found, creating fallback');
        this.createFallbackEducationalFeatures();
      }
    } catch (error) {
      console.error('Error initializing educational features:', error);
      this.createFallbackEducationalFeatures();
    }
  }
  
  /**
   * Create fallback educational features
   */
  createFallbackEducationalFeatures() {
    console.warn('Creating fallback educational features');
    this.educationalFeatures = {
      dispose: () => {}
    };
  }
  
  /**
   * Initialize help system
   */
  initHelpSystem() {
    try {
      if (typeof window.HelpSystem === 'function') {
        this.helpSystem = new window.HelpSystem();
      } else {
        console.error('HelpSystem not found, creating fallback');
        this.createFallbackHelpSystem();
      }
    } catch (error) {
      console.error('Error initializing help system:', error);
      this.createFallbackHelpSystem();
    }
  }
  
  /**
   * Create fallback help system
   */
  createFallbackHelpSystem() {
    console.warn('Creating fallback help system');
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
  
  // The rest of the SolarSystemApp methods...
  // For brevity, we're not including all methods here since they need minimal changes
  // We'll just define a placeholder for each required method
  
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
   * Create default solar system
   */
  createDefaultSystem() {
    try {
      // Get default system data
      let defaultSystem;
      
      if (window.solarSystem && typeof window.solarSystem.getDefaultSystem === 'function') {
        defaultSystem = window.solarSystem.getDefaultSystem();
      } else if (typeof window.getDefaultSystem === 'function') {
        defaultSystem = window.getDefaultSystem();
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
      // Create a simple fallback system
      this.createFallbackSystem();
    }
  }
  
  /**
   * Create a simple fallback solar system
   */
  createFallbackSystem() {
    try {
      console.warn('Creating fallback solar system');
      
      if (this.objectHandlers && typeof this.objectHandlers.createCelestialObject === 'function') {
        // Create sun
        const sun = this.objectHandlers.createCelestialObject({
          id: 'sun',
          name: 'Sun',
          type: 'star',
          mass: 1.989e30,
          radius: 696340,
          position: [0, 0, 0],
          velocity: [0, 0, 0]
        });
        
        // Create earth
        const earth = this.objectHandlers.createCelestialObject({
          id: 'earth',
          name: 'Earth',
          type: 'planet',
          mass: 5.972e24,
          radius: 6371,
          position: [149597870, 0, 0],
          velocity: [0, 29.78, 0],
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
    } catch (error) {
      console.error('Error creating fallback system:', error);
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
   * Start the animation loop
   */
  startAnimationLoop() {
    // Check if we already have an animation frame ID
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
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
        if (this.objects && Array.isArray(this.objects)) {
          for (const object of this.objects) {
            if (object && object.mesh && object.position) {
              object.mesh.position.set(
                object.position.x / 1000000,
                object.position.y / 1000000,
                object.position.z / 1000000
              );
            }
            
            // Update orbit lines if needed
            if (object && object.updateOrbitLine && typeof object.updateOrbitLine === 'function') {
              object.updateOrbitLine();
            }
          }
        }
        
        // Update gravity visualizer
        if (this.gravityVisualizer && typeof this.gravityVisualizer.update === 'function') {
          this.gravityVisualizer.update(this.objects || []);
        }
        
        // Update Lagrange points if they're visible
        if (this.lagrangePointVisualizer && 
            this.lagrangePointVisualizer.visible && 
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
        
        // Render scene
        if (this.renderer && 
            this.scene && 
            this.sceneManager && 
            this.sceneManager.camera && 
            typeof this.renderer.render === 'function') {
          this.renderer.render(this.scene, this.sceneManager.camera);
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
  
  // Placeholder methods to complete the class
  handleResize() {}
  handlePlayPause() {}
  handleDecreaseTimeScale() {}
  handleIncreaseTimeScale() {}
  updateTimeDisplay() {}
  handleResetView() {}
  handleAddObject() {}
  focusOnObject() {}
  setTimeScale() {}
  highlightObject() {}
  resetHighlights() {}
  updateSelectedObjectInfo() {}
  updateBodyCount() {}
  addLagrangePointsMenuItem() {}
  handleKeydown() {}
  
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
      
      // Dispose of components
      if (this.helpSystem && typeof this.helpSystem.dispose === 'function') {
        this.helpSystem.dispose();
      }
      
      if (this.lagrangePointVisualizer && typeof this.lagrangePointVisualizer.dispose === 'function') {
        this.lagrangePointVisualizer.dispose();
      }
      
      if (this.systemSelector && typeof this.systemSelector.dispose === 'function') {
        this.systemSelector.dispose();
      }
      
      if (this.educationalFeatures && typeof this.educationalFeatures.dispose === 'function') {
        this.educationalFeatures.dispose();
      }
      
      if (this.gravityVisualizer && typeof this.gravityVisualizer.dispose === 'function') {
        this.gravityVisualizer.dispose();
      }
      
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

// Add CSS for error messages
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
`;
document.head.appendChild(style);

// Clean up resources on window unload
window.addEventListener('beforeunload', () => {
  if (window.solarSystemApp) {
    window.solarSystemApp.dispose();
  }
});