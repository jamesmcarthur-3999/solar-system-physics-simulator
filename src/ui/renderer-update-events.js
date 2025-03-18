/**
 * Integration code for astronomical events detection in SolarSystemApp
 * 
 * This code should be incorporated into the SolarSystemApp class in renderer.js
 */

// Import the required modules
const AstronomicalEventDetector = require('../physics/astronomicalEvents');
const EventsPanel = require('./eventsPanel');

class SolarSystemApp {
  constructor(container) {
    // ... existing constructor code ...
    
    // Initialize astronomical event detector
    this.eventDetector = new AstronomicalEventDetector();
    
    // Initialize events panel
    this.eventsPanel = new EventsPanel(document.getElementById('events-container'));
    
    // Reference to events toggle button and count display
    this.eventsToggleButton = document.getElementById('toggle-events');
    this.eventsCountDisplay = document.getElementById('events-count');
    
    // Set up toggle button for events panel
    if (this.eventsToggleButton) {
      this.eventsToggleButton.addEventListener('click', () => {
        this.eventsPanel.toggle();
      });
    }
    
    // Listen for focus-event custom events
    document.addEventListener('focus-event', (e) => {
      this.focusOnObjects(e.detail.objects);
    });
  }
  
  /**
   * Update the simulation
   * @param {Number} timeStep - Time step in milliseconds
   */
  update(timeStep) {
    // ... existing update code ...
    
    // Update time tracking
    this.frameCount++;
    this.currentTime += timeStep;
    
    // Detect astronomical events periodically
    this.detectAstronomicalEvents();
    
    // ... rest of update method ...
  }
  
  /**
   * Detect astronomical events and update the UI
   */
  detectAstronomicalEvents() {
    try {
      // Only run detection every few frames to save performance
      if (this.frameCount % 60 !== 0) return; // Detect once per second at 60fps
      
      // Detect events
      const events = this.eventDetector.detectEvents(this.objects, this.currentTime);
      
      // Update events panel
      this.eventsPanel.updateEvents(events, this.currentTime);
      
      // Update events count display
      if (this.eventsCountDisplay) {
        this.eventsCountDisplay.textContent = events.length;
        
        // Highlight button if there are events
        if (events.length > 0) {
          this.eventsToggleButton.classList.add('has-events');
        } else {
          this.eventsToggleButton.classList.remove('has-events');
        }
      }
    } catch (error) {
      console.error('Error detecting astronomical events:', error);
    }
  }
  
  /**
   * Focus camera on a set of objects
   * @param {Array} objectNames - Array of object names to focus on
   */
  focusOnObjects(objectNames) {
    try {
      if (!objectNames || objectNames.length === 0) return;
      
      // Find the objects in the scene
      const objectsToFocus = this.objects.filter(obj => 
        objectNames.includes(obj.name)
      );
      
      if (objectsToFocus.length === 0) return;
      
      // Calculate the center point of all objects
      const center = new THREE.Vector3();
      objectsToFocus.forEach(obj => {
        center.add(obj.position);
      });
      center.divideScalar(objectsToFocus.length);
      
      // Calculate distance based on the furthest object from center
      let maxDistance = 0;
      objectsToFocus.forEach(obj => {
        const distance = obj.position.distanceTo(center);
        maxDistance = Math.max(maxDistance, distance);
      });
      
      // Set a minimum distance to ensure objects are visible
      maxDistance = Math.max(maxDistance * 2, 10);
      
      // Animate camera to new position
      this.animateCameraToPosition(center, maxDistance);
    } catch (error) {
      console.error('Error focusing on objects:', error);
    }
  }
  
  /**
   * Animate camera to focus on a position
   * @param {THREE.Vector3} targetPosition - Position to focus on
   * @param {Number} distance - Distance from the position
   */
  animateCameraToPosition(targetPosition, distance) {
    try {
      // Stop any existing animation
      if (this.cameraAnimation) {
        cancelAnimationFrame(this.cameraAnimation.id);
      }
      
      // Store original camera position and target
      const startPosition = this.camera.position.clone();
      const startTarget = this.controls.target.clone();
      
      // Calculate end position (maintaining angle but changing distance)
      const direction = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
      const endPosition = new THREE.Vector3().copy(targetPosition).add(direction.multiplyScalar(distance));
      
      // Animation parameters
      const duration = 1000; // ms
      const startTime = performance.now();
      
      // Animation function
      const animate = (currentTime) => {
        // Calculate progress (0 to 1)
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easing function for smoother animation
        const easedProgress = this.easeInOutCubic(progress);
        
        // Interpolate position and target
        this.camera.position.copy(startPosition).lerp(endPosition, easedProgress);
        this.controls.target.copy(startTarget).lerp(targetPosition, easedProgress);
        
        // Update controls
        this.controls.update();
        
        // Continue animation if not complete
        if (progress < 1) {
          this.cameraAnimation = {
            id: requestAnimationFrame(animate)
          };
        } else {
          this.cameraAnimation = null;
        }
      };
      
      // Start animation
      this.cameraAnimation = {
        id: requestAnimationFrame(animate)
      };
    } catch (error) {
      console.error('Error animating camera:', error);
    }
  }
  
  /**
   * Easing function for smoother camera animation
   * @param {Number} t - Progress from 0 to 1
   * @returns {Number} - Eased value
   */
  easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    // ... existing dispose code ...
    
    // Clean up events panel
    if (this.eventsPanel) {
      this.eventsPanel.dispose();
    }
    
    // Remove event listeners
    if (this.eventsToggleButton) {
      this.eventsToggleButton.removeEventListener('click', null);
    }
    
    document.removeEventListener('focus-event', null);
    
    // Cancel camera animation if active
    if (this.cameraAnimation) {
      cancelAnimationFrame(this.cameraAnimation.id);
    }
    
    // ... rest of dispose method ...
  }
}

// Add these event handler registrations to the initialize function or DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('scene-container');
  if (container) {
    window.solarSystemApp = new SolarSystemApp(container);
  }
});