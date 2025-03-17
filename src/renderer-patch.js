//=== PATCHES ===//
// This file contains patches to fix issues with the application
console.log("Renderer patches loading...");

// Add the getDisplayRadius method to all existing celestial objects
// This will run after the app has initialized
window.addEventListener('load', function() {
  console.log("Applying patches...");
  
  // Patch 1: Add getDisplayRadius method to all celestial objects
  setTimeout(() => {
    if (window.solarSystemApp && window.solarSystemApp.objects) {
      console.log("Adding getDisplayRadius to celestial objects...");
      
      window.solarSystemApp.objects.forEach(obj => {
        if (!obj.getDisplayRadius) {
          obj.getDisplayRadius = function() {
            return this.radius || 1;
          };
          console.log(`Added getDisplayRadius to ${obj.name || 'unknown object'}`);
        }
      });
    }
    
    // Patch 2: Fix animation loop to prevent method missing errors
    if (window.solarSystemApp) {
      console.log("Patching animation loop...");
      
      // Get the original startAnimationLoop method
      const originalStartAnimationLoop = window.solarSystemApp.startAnimationLoop;
      
      // Replace with safer version
      window.solarSystemApp.startAnimationLoop = function() {
        console.log("Using patched animation loop");
        
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
                  object.mesh.position.copy(object.position);
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
    }
    
    console.log("Patching complete!");
  }, 2000); // Wait 2 seconds for app to initialize
});