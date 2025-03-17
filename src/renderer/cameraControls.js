// cameraControls.js - Camera management and controls for the scene
const THREE = require('three');
const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls');

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
    this.camera = camera;
    this.renderer = renderer;
    this.controls = new OrbitControls(camera, domElement);
    
    // Configure default orbit controls
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 1.2;
    
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
  }
  
  /**
   * Updates the camera and controls each frame
   */
  update() {
    if (this.followMode && this.followObject) {
      this._updateFollowCamera();
    } else {
      // Update orbit controls when not in follow mode
      this.controls.update();
    }
  }
  
  /**
   * Enables follow mode for a specific celestial object
   * @param {Object} object - The object to follow (must have a position property)
   * @param {THREE.Vector3} offset - Optional custom offset from the object
   */
  followCelestialObject(object, offset) {
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
  }
  
  /**
   * Disables follow mode and returns to free camera control
   */
  disableFollowMode() {
    this.followMode = false;
    this.followObject = null;
    
    // Re-enable orbit controls
    this.controls.enabled = true;
    
    console.log('Follow mode disabled');
  }
  
  /**
   * Resets the camera to the default position
   */
  resetToDefault() {
    // Disable follow mode if active
    this.disableFollowMode();
    
    // Animate to default position
    this._animateCameraToPosition(
      this.defaultPosition,
      this.defaultTarget,
      1000 // Animation duration in ms
    );
    
    console.log('Camera reset to default position');
  }
  
  /**
   * Disposes of resources when no longer needed
   */
  dispose() {
    if (this.controls) {
      this.controls.dispose();
    }
  }
  
  /**
   * Updates the camera position when in follow mode
   * @private
   */
  _updateFollowCamera() {
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
  }
  
  /**
   * Animates the camera to a specified position and target
   * @param {THREE.Vector3} position - The destination position
   * @param {THREE.Vector3} target - The look-at target
   * @param {number} duration - Duration of animation in milliseconds
   * @private
   */
  _animateCameraToPosition(position, target, duration) {
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

module.exports = {
  CameraController
};
