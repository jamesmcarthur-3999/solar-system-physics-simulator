// cameraControls.js - Camera management and controls for the scene
// Use browser globals if available, otherwise try to require
const THREE = typeof window !== 'undefined' && window.THREE ? window.THREE : {};
const OrbitControls = typeof window !== 'undefined' && window.OrbitControls ? window.OrbitControls : null;

/**
 * Manages camera behavior including follow mode for celestial objects
 */
class CameraController {
  /**
   * Creates a new camera controller
   * @param {THREE.PerspectiveCamera} camera - The Three.js camera to control
   * @param {THREE.WebGLRenderer} renderer - The Three.js renderer
   * @param {HTMLElement} domElement - The DOM element for orbit controls
   */
  constructor(camera, renderer, domElement) {
    try {
      this.camera = camera;
      this.renderer = renderer;
      
      // Check if OrbitControls is available
      if (!OrbitControls) {
        console.warn('OrbitControls not available, using basic camera controls');
        this.controls = {
          update: () => {},
          target: new THREE.Vector3(0, 0, 0),
          enabled: true,
          dispose: () => {}
        };
      } else {
        this.controls = new OrbitControls(camera, domElement);
        
        // Configure default orbit controls
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 1.2;
      }
      
      // Follow mode properties
      this.followMode = false;
      this.followObject = null;
      this.followOffset = new THREE.Vector3(0, 50, 150);
      this.followLerpFactor = 0.05; // Controls smoothness of camera movement
      
      // Default camera positions
      this.defaultPosition = new THREE.Vector3(0, 400, 1000);
      this.defaultTarget = new THREE.Vector3(0, 0, 0);
      
      // Initialize controls target
      this.controls.target.copy(this.defaultTarget);
    } catch (error) {
      console.error('Error initializing CameraController:', error);
      // Create dummy properties for error resilience
      this.camera = camera || { position: { lerp: () => {}, clone: () => ({ add: () => {} }), lookAt: () => {} } };
      this.controls = { 
        update: () => {}, 
        target: { copy: () => {}, lerp: () => {}, clone: () => {}, lerpVectors: () => {} },
        enabled: true,
        dispose: () => {}
      };
      this.followMode = false;
      this.followObject = null;
      this.followOffset = { clone: () => {} };
      this.defaultPosition = { clone: () => {} };
      this.defaultTarget = { clone: () => {} };
    }
  }
  
  /**
   * Updates the camera and controls each frame
   */
  update() {
    try {
      if (this.followMode && this.followObject) {
        this._updateFollowCamera();
      } else {
        // Update orbit controls when not in follow mode
        this.controls.update();
      }
    } catch (error) {
      console.error('Error updating camera controls:', error);
    }
  }
  
  /**
   * Enables follow mode for a specific celestial object
   * @param {Object} object - The object to follow (must have a position property)
   * @param {THREE.Vector3} offset - Optional custom offset from the object
   */
  followCelestialObject(object, offset) {
    try {
      if (!object) {
        console.warn('Cannot follow undefined object');
        return;
      }
      
      this.followMode = true;
      this.followObject = object;
      
      // Disable orbit controls when in follow mode
      this.controls.enabled = false;
      
      // Use custom offset if provided
      if (offset) {
        this.followOffset.copy(offset);
      }
      
      console.log(`Camera now following: ${object.name}`);
    } catch (error) {
      console.error('Error setting follow mode:', error);
    }
  }
  
  /**
   * Disables follow mode and returns to free camera control
   */
  disableFollowMode() {
    try {
      this.followMode = false;
      this.followObject = null;
      
      // Re-enable orbit controls
      this.controls.enabled = true;
      
      console.log('Follow mode disabled');
    } catch (error) {
      console.error('Error disabling follow mode:', error);
    }
  }
  
  /**
   * Resets the camera to the default position
   */
  resetToDefault() {
    try {
      // Disable follow mode if active
      this.disableFollowMode();
      
      // Make sure we have Vector3 and animation capability
      if (THREE.Vector3 && this.defaultPosition && this.defaultTarget) {
        // Animate to default position
        this._animateCameraToPosition(
          this.defaultPosition,
          this.defaultTarget,
          1000 // Animation duration in ms
        );
      } else {
        // Fallback if Vector3 is not available
        if (this.camera && this.camera.position) {
          this.camera.position.set(0, 400, 1000);
        }
        if (this.controls && this.controls.target) {
          this.controls.target.set(0, 0, 0);
        }
      }
      
      console.log('Camera reset to default position');
    } catch (error) {
      console.error('Error resetting camera:', error);
    }
  }
  
  /**
   * Disposes of resources when no longer needed
   */
  dispose() {
    try {
      if (this.controls && typeof this.controls.dispose === 'function') {
        this.controls.dispose();
      }
    } catch (error) {
      console.error('Error disposing camera controller:', error);
    }
  }
  
  /**
   * Updates the camera position when in follow mode
   * @private
   */
  _updateFollowCamera() {
    try {
      if (!this.followObject || !this.followObject.position) {
        return;
      }
      
      // Create a copy of the object's position
      const targetPosition = this.followObject.position.clone();
      
      // Update the controls target to point at the object
      this.controls.target.lerp(targetPosition, this.followLerpFactor);
      
      // Calculate desired camera position (object position + offset)
      const desiredPosition = targetPosition.clone().add(this.followOffset);
      
      // Smoothly move the camera to the desired position
      this.camera.position.lerp(desiredPosition, this.followLerpFactor);
      
      // Ensure the camera is looking at the target
      this.camera.lookAt(targetPosition);
    } catch (error) {
      console.error('Error updating follow camera:', error);
    }
  }
  
  /**
   * Animates the camera to a specified position and target
   * @param {THREE.Vector3} position - The destination position
   * @param {THREE.Vector3} target - The look-at target
   * @param {number} duration - Duration of animation in milliseconds
   * @private
   */
  _animateCameraToPosition(position, target, duration) {
    try {
      const startPosition = this.camera.position.clone();
      const startTarget = this.controls.target.clone();
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth transition
        const easeProgress = this._easeInOutCubic(progress);
        
        // Interpolate position and target
        this.camera.position.lerpVectors(startPosition, position, easeProgress);
        this.controls.target.lerpVectors(startTarget, target, easeProgress);
        
        // Continue animation if not complete
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    } catch (error) {
      console.error('Error animating camera:', error);
      
      // Fallback to instant position change
      if (this.camera && this.camera.position && position) {
        this.camera.position.copy(position);
      }
      if (this.controls && this.controls.target && target) {
        this.controls.target.copy(target);
      }
    }
  }
  
  /**
   * Cubic easing function for smooth camera animation
   * @param {number} t - Progress value between 0 and 1
   * @returns {number} Eased value
   * @private
   */
  _easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
  window.CameraController = CameraController;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CameraController
  };
}
