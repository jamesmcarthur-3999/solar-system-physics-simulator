/**
 * Integration code for optimizations in SolarSystemApp
 * 
 * This file contains updates to integrate the performance optimizations including:
 * - Barnes-Hut algorithm for N-body physics
 * - Level of Detail rendering for distant objects
 * - Optimized orbit line generation
 * - Performance monitoring UI
 */

// Import the optimization modules
const { OptimizedGravitySimulator } = require('../physics/gravitySimulatorOptimized');
const { OptimizedRenderer } = require('../renderer/lodRenderer');
const PerformanceMonitor = require('./performanceMonitor');

// Modifications for SolarSystemApp class
class SolarSystemApp {
  constructor(container) {
    // ... existing constructor code ...
    
    // Use optimized gravity simulator instead of the basic one
    this.gravitySimulator = new OptimizedGravitySimulator();
    
    // Create optimized renderer
    this.optimizedRenderer = new OptimizedRenderer({
      lod: {
        highDetailDistance: 50,
        mediumDetailDistance: 200,
        enabled: true
      },
      maxOrbitPoints: 200,
      minOrbitPoints: 50,
      orbitDistanceThreshold: 100,
      optimizeOrbitLines: true
    });
    
    // Create performance monitor
    this.performanceMonitor = new PerformanceMonitor(
      document.getElementById('performance-container'),
      {
        updateInterval: 500,
        expanded: false
      }
    );
    
    // Set up optimization toggle callbacks
    this.setupOptimizationCallbacks();
    
    // Performance measurement variables
    this.lastFrameStart = 0;
    this.lastPhysicsStart = 0;
    this.lastPhysicsEnd = 0;
    this.lastRenderStart = 0;
    this.lastRenderEnd = 0;
    
    // Add performance toggle button
    this.addPerformanceToggleButton();
  }
  
  /**
   * Set up callbacks for optimization toggles
   */
  setupOptimizationCallbacks() {
    this.performanceMonitor.setOptimizationCallback((option, enabled) => {
      switch (option) {
        case 'barnesHut':
          // When Barnes-Hut is disabled, use direct calculation
          if (this.gravitySimulator && typeof this.gravitySimulator.setTheta === 'function') {
            if (enabled) {
              this.gravitySimulator.setTheta(0.5); // Normal Barnes-Hut
            } else {
              this.gravitySimulator.setTheta(0.0); // Force direct calculation
            }
          }
          break;
          
        case 'lod':
          // Toggle level of detail rendering
          if (this.optimizedRenderer) {
            this.optimizedRenderer.setLODEnabled(enabled);
          }
          break;
          
        case 'orbitOptimization':
          // Toggle orbit line optimization
          if (this.optimizedRenderer) {
            this.optimizedRenderer.setOrbitOptimizationEnabled(enabled);
          }
          break;
          
        case 'adaptivePhysics':
          // Toggle adaptive physics time steps
          this.useAdaptivePhysics = enabled;
          break;
      }
    });
  }
  
  /**
   * Add toggle button for performance monitor
   */
  addPerformanceToggleButton() {
    try {
      // Create the toggle button if it doesn't exist
      if (!this.performanceToggleButton) {
        const footer = document.querySelector('footer');
        if (!footer) return;
        
        // Create button
        this.performanceToggleButton = document.createElement('button');
        this.performanceToggleButton.id = 'toggle-performance';
        this.performanceToggleButton.className = 'toggle-performance-button';
        
        // Add icon and text
        const icon = document.createElement('span');
        icon.className = 'performance-icon';
        icon.innerHTML = '📊';
        
        const text = document.createTextNode('Performance');
        
        this.performanceToggleButton.appendChild(icon);
        this.performanceToggleButton.appendChild(text);
        
        // Add click handler
        this.performanceToggleButton.addEventListener('click', () => {
          if (this.performanceMonitor) {
            // If panel is currently hidden (display: none), show it
            if (this.performanceMonitor.panel.style.display === 'none') {
              this.performanceMonitor.show();
            } else {
              this.performanceMonitor.hide();
            }
          }
        });
        
        // Add to footer, before the status div
        const statusDiv = footer.querySelector('.status');
        if (statusDiv) {
          footer.insertBefore(this.performanceToggleButton, statusDiv);
        } else {
          footer.appendChild(this.performanceToggleButton);
        }
      }
    } catch (error) {
      console.error('Error adding performance toggle button:', error);
    }
  }
  
  /**
   * Update method with performance measuring
   * @param {Number} timeStep - Time step
   */
  update(timeStep) {
    try {
      // Start frame timing
      this.lastFrameStart = performance.now();
      
      // Skip if paused
      if (this.paused) {
        return;
      }
      
      // Update time tracking
      this.currentTime += timeStep;
      this.frameCount++;
      
      // Start physics timing
      this.lastPhysicsStart = performance.now();
      
      // Update physics with adaptive time steps if enabled
      if (this.useAdaptivePhysics && this.timeScale > 10) {
        // Calculate smaller substeps for stability at high time scales
        const substeps = Math.ceil(Math.log10(this.timeScale));
        const subTimeStep = timeStep / substeps;
        
        for (let i = 0; i < substeps; i++) {
          this.gravitySimulator.update(this.currentTime + (i * subTimeStep));
        }
      } else {
        // Regular update
        this.gravitySimulator.update(this.currentTime);
      }
      
      // End physics timing
      this.lastPhysicsEnd = performance.now();
      
      // Start render timing
      this.lastRenderStart = performance.now();
      
      // Update orbit points for all objects
      for (const object of this.objects) {
        if (object.position && object.orbitPoints) {
          object.orbitPoints.push(new THREE.Vector3().copy(object.position));
          
          // Limit number of orbit points to prevent memory issues
          if (object.orbitPoints.length > 500) {
            object.orbitPoints.shift();
          }
        }
      }
      
      // Update orbit lines with optimized renderer
      this.optimizedRenderer.updateOrbitLines(this.objects, this.camera, this.scene);
      
      // Update level of detail based on camera distance
      this.optimizedRenderer.updateLOD(this.objects, this.camera);
      
      // Update mesh positions
      for (const object of this.objects) {
        if (object.mesh) {
          object.mesh.position.copy(object.position);
        }
      }
      
      // Update any visual effects
      this.updateVisualEffects();
      
      // End render timing
      this.lastRenderEnd = performance.now();
      
      // Update FPS counter
      this.updateFPS();
      
      // Update performance monitor
      this.updatePerformanceMonitor();
    } catch (error) {
      console.error('Error in update loop:', error);
    }
  }
  
  /**
   * Update performance monitor with current metrics
   */
  updatePerformanceMonitor() {
    if (!this.performanceMonitor) return;
    
    // Calculate timings
    const frameTime = performance.now() - this.lastFrameStart;
    const physicsTime = this.lastPhysicsEnd - this.lastPhysicsStart;
    const renderTime = this.lastRenderEnd - this.lastRenderStart;
    
    // Get physics performance metrics
    let objectCount = this.objects.length;
    let avgFrameTime = frameTime;
    
    if (this.gravitySimulator && typeof this.gravitySimulator.getPerformanceMetrics === 'function') {
      const metrics = this.gravitySimulator.getPerformanceMetrics();
      objectCount = metrics.objectCount;
      avgFrameTime = metrics.averageFrameTime || frameTime;
    }
    
    // Update performance monitor
    this.performanceMonitor.updateMetrics({
      frameTime: frameTime,
      avgFrameTime: avgFrameTime,
      physicsTime: physicsTime,
      renderTime: renderTime,
      objectCount: objectCount
    });
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // ... existing dispose code ...
    
    // Dispose of optimized renderer
    if (this.optimizedRenderer) {
      this.optimizedRenderer.dispose();
    }
    
    // Dispose of performance monitor
    if (this.performanceMonitor) {
      this.performanceMonitor.dispose();
    }
    
    // Remove performance toggle button
    if (this.performanceToggleButton && this.performanceToggleButton.parentNode) {
      this.performanceToggleButton.parentNode.removeChild(this.performanceToggleButton);
    }
    
    // ... rest of existing dispose code ...
  }
}

// Add to index.html:
// <link rel="stylesheet" href="./performance-monitor.css">
// <div id="performance-container"></div>

// When the app is initialized:
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('scene-container');
  if (container) {
    window.solarSystemApp = new SolarSystemApp(container);
  }
});