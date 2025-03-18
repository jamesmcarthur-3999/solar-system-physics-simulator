/**
 * Solar System Simulator - Renderer Patches
 * 
 * This file contains patches to fix issues with the application.
 * It runs after the main application has initialized to fix any remaining issues.
 */

console.log("Renderer patches loading...");

// Apply patches after the app has initialized
window.addEventListener('load', function() {
  console.log("Applying patches...");
  
  // Wait a bit for everything to initialize
  setTimeout(() => {
    try {
      applyAllPatches();
      console.log("Patching complete!");
    } catch (error) {
      console.error("Error applying patches:", error);
    }
  }, 2000); // Wait 2 seconds for app to initialize
});

/**
 * Apply all patches in order
 */
function applyAllPatches() {
  try {
    // Patch 1: Add getDisplayRadius method to all celestial objects
    patchCelestialObjects();
    
    // Patch 2: Fix animation loop to prevent method missing errors
    patchAnimationLoop();
    
    // Patch 3: Fix camera controls if missing
    patchCameraControls();
    
    // Patch 4: Fix event handlers if missing
    patchEventHandlers();
  } catch (error) {
    console.error("Error in applyAllPatches:", error);
  }
}

/**
 * Patch 1: Add getDisplayRadius method to all celestial objects
 */
function patchCelestialObjects() {
  try {
    if (window.solarSystemApp && window.solarSystemApp.objects) {
      console.log("Adding getDisplayRadius to celestial objects...");
      
      window.solarSystemApp.objects.forEach(obj => {
        if (!obj.getDisplayRadius) {
          obj.getDisplayRadius = function() {
            // Scale radius based on whether it's a star or planet
            if (this.isStar) {
              return this.radius ? Math.log10(this.radius) * 2 : 10;
            } else {
              return this.radius ? Math.log10(this.radius) * 4 : 1;
            }
          };
          console.log(`Added getDisplayRadius to ${obj.name || 'unknown object'}`);
        }
      });
    } else {
      console.warn("No solarSystemApp or objects found to patch");
    }
  } catch (error) {
    console.error("Error patching celestial objects:", error);
  }
}

/**
 * Patch 2: Fix animation loop to prevent method missing errors
 */
function patchAnimationLoop() {
  try {
    if (window.solarSystemApp) {
      console.log("Patching animation loop...");
      
      // Get the original startAnimationLoop method
      const originalStartAnimationLoop = window.solarSystemApp.startAnimationLoop;
      
      // Replace with safer version
      window.solarSystemApp.startAnimationLoop = function() {
        console.log("Using patched animation loop");
        
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
            
            // Update physics - only if available
            if (!this.paused && this.physics && typeof this.physics.update === 'function') {
              this.physics.update(time);
            }
            
            // Update object positions in scene
            if (this.objects && Array.isArray(this.objects)) {
              for (const object of this.objects) {
                if (object && object.mesh && object.position) {
                  // Use position.set if available, otherwise copy
                  if (typeof object.mesh.position.set === 'function') {
                    object.mesh.position.set(
                      object.position.x / 1000000,
                      object.position.y / 1000000,
                      object.position.z / 1000000
                    );
                  } else if (typeof object.mesh.position.copy === 'function') {
                    // Scale position
                    const scaledPosition = {
                      x: object.position.x / 1000000,
                      y: object.position.y / 1000000,
                      z: object.position.z / 1000000
                    };
                    object.mesh.position.copy(scaledPosition);
                  }
                }
                
                // Update orbit lines if needed
                if (object && object.updateOrbitLine && typeof object.updateOrbitLine === 'function') {
                  object.updateOrbitLine();
                }
              }
            }
            
            // Update gravity visualizer - only if available
            if (this.gravityVisualizer && typeof this.gravityVisualizer.update === 'function') {
              this.gravityVisualizer.update(this.objects || []);
            }
            
            // Update Lagrange points if they're visible - only if available
            if (this.lagrangePointVisualizer && 
                this.lagrangePointVisualizer.visible && 
                typeof this.lagrangePointVisualizer.update === 'function') {
              this.lagrangePointVisualizer.update();
            }
            
            // Update camera controls - only if available
            if (this.cameraControls && typeof this.cameraControls.update === 'function') {
              this.cameraControls.update();
            }
            
            // Update info panel if object is selected - only if available
            if (this.selectedObjectId && 
                typeof this.updateSelectedObjectInfo === 'function') {
              this.updateSelectedObjectInfo();
            }
            
            // Render scene - only if available
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
      };
      
      // Restart animation loop with patched version
      if (window.solarSystemApp.animationFrameId) {
        cancelAnimationFrame(window.solarSystemApp.animationFrameId);
        window.solarSystemApp.startAnimationLoop();
      }
    } else {
      console.warn("No solarSystemApp found to patch animation loop");
    }
  } catch (error) {
    console.error("Error patching animation loop:", error);
  }
}

/**
 * Patch 3: Fix camera controls if missing
 */
function patchCameraControls() {
  try {
    if (window.solarSystemApp && !window.solarSystemApp.cameraControls) {
      console.log("Patching camera controls...");
      
      // Create a minimal camera controls object
      window.solarSystemApp.cameraControls = {
        update: () => {},
        resetView: () => {
          if (window.solarSystemApp.sceneManager && 
              window.solarSystemApp.sceneManager.camera && 
              window.solarSystemApp.sceneManager.camera.position &&
              typeof window.solarSystemApp.sceneManager.camera.position.set === 'function') {
            window.solarSystemApp.sceneManager.camera.position.set(0, 5, 15);
          }
        },
        setPosition: () => {},
        focusOnObject: () => {},
        handleResize: () => {},
        dispose: () => {}
      };
    }
  } catch (error) {
    console.error("Error patching camera controls:", error);
  }
}

/**
 * Patch 4: Fix event handlers if missing
 */
function patchEventHandlers() {
  try {
    if (window.solarSystemApp) {
      console.log("Patching event handlers...");
      
      // Define missing event handlers if needed
      if (!window.solarSystemApp.handleResize) {
        window.solarSystemApp.handleResize = function() {
          if (this.sceneManager && typeof this.sceneManager.handleResize === 'function') {
            this.sceneManager.handleResize();
          }
        };
      }
      
      if (!window.solarSystemApp.handlePlayPause) {
        window.solarSystemApp.handlePlayPause = function() {
          this.paused = !this.paused;
          
          if (this.physics && typeof this.physics.setPaused === 'function') {
            this.physics.setPaused(this.paused);
          }
          
          if (this.playPauseButton) {
            this.playPauseButton.textContent = this.paused ? 'Play' : 'Pause';
          }
        };
      }
      
      if (!window.solarSystemApp.handleDecreaseTimeScale) {
        window.solarSystemApp.handleDecreaseTimeScale = function() {
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
        };
      }
      
      if (!window.solarSystemApp.handleIncreaseTimeScale) {
        window.solarSystemApp.handleIncreaseTimeScale = function() {
          if (this.timeScale < 1) {
            this.timeScale *= 2;
          } else {
            this.timeScale++;
          }
          
          if (this.physics && typeof this.physics.setTimeScale === 'function') {
            this.physics.setTimeScale(this.timeScale);
          }
          
          this.updateTimeDisplay();
        };
      }
      
      if (!window.solarSystemApp.updateTimeDisplay) {
        window.solarSystemApp.updateTimeDisplay = function() {
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
        };
      }
      
      if (!window.solarSystemApp.handleResetView) {
        window.solarSystemApp.handleResetView = function() {
          if (this.cameraControls && typeof this.cameraControls.resetView === 'function') {
            this.cameraControls.resetView();
          }
        };
      }
      
      if (!window.solarSystemApp.updateBodyCount) {
        window.solarSystemApp.updateBodyCount = function() {
          if (this.bodyCount) {
            this.bodyCount.textContent = `Bodies: ${this.objects.length}`;
          }
        };
      }
      
      if (!window.solarSystemApp.handleKeydown) {
        window.solarSystemApp.handleKeydown = function(e) {
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
          } catch (error) {
            console.error("Error handling keyboard event:", error);
          }
        };
      }
    } else {
      console.warn("No solarSystemApp found to patch event handlers");
    }
  } catch (error) {
    console.error("Error patching event handlers:", error);
  }
}