// Gravity Simulator - Handles physics calculations for celestial bodies

class GravitySimulator {
  constructor() {
    // Internal state
    this.objects = [];
    this.timeScale = window.CONSTANTS.DEFAULT_TIME_SCALE; // Days per second
    this.paused = false;
    this.lastTime = 0;
    
    // Physics settings
    this.G = window.CONSTANTS.G;
    this.secondsPerDay = window.CONSTANTS.SECONDS_PER_DAY;
  }
  
  /**
   * Add a celestial object to the simulation
   * @param {Object} object - The object to add
   */
  addObject(object) {
    this.objects.push(object);
  }
  
  /**
   * Remove an object from the simulation
   * @param {String} id - ID of the object to remove
   */
  removeObject(id) {
    const index = this.objects.findIndex(obj => obj.id === id);
    if (index !== -1) {
      this.objects.splice(index, 1);
    }
  }
  
  /**
   * Set the simulation time scale
   * @param {Number} scale - Time scale in days per second
   */
  setTimeScale(scale) {
    this.timeScale = scale;
  }
  
  /**
   * Set whether the simulation is paused
   * @param {Boolean} paused - Whether to pause the simulation
   */
  setPaused(paused) {
    this.paused = paused;
  }
  
  /**
   * Get all objects in the simulation
   * @returns {Array} - Array of celestial objects
   */
  getObjects() {
    return this.objects;
  }
  
  /**
   * Calculate gravitational force between two objects
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} - Force vector with x, y, z components
   */
  calculateGravitationalForce(obj1, obj2) {
    // Calculate distance vector
    const dx = obj2.position.x - obj1.position.x;
    const dy = obj2.position.y - obj1.position.y;
    const dz = obj2.position.z - obj1.position.z;
    
    // Calculate distance squared
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    
    // Avoid division by zero
    if (distanceSquared === 0) return { x: 0, y: 0, z: 0 };
    
    // Calculate distance
    const distance = Math.sqrt(distanceSquared);
    
    // Calculate gravitational force magnitude: F = G * m1 * m2 / r^2
    const forceMagnitude = this.G * obj1.mass * obj2.mass / distanceSquared;
    
    // Calculate normalized direction vector
    const fx = (dx / distance) * forceMagnitude;
    const fy = (dy / distance) * forceMagnitude;
    const fz = (dz / distance) * forceMagnitude;
    
    return { x: fx, y: fy, z: fz };
  }
  
  /**
   * Update all object positions based on gravitational forces
   * @param {Number} time - Current time in milliseconds
   */
  update(time) {
    if (this.paused) return;
    
    // Calculate delta time in seconds
    const deltaTime = (this.lastTime === 0) ? 0 : (time - this.lastTime) / 1000;
    this.lastTime = time;
    
    // Scale delta time by time scale (days per second)
    const scaledDeltaTime = deltaTime * this.timeScale * this.secondsPerDay;
    
    // Skip if delta time is too large (e.g., after switching tabs)
    if (scaledDeltaTime > 100000) return;
    
    // Calculate forces
    for (let i = 0; i < this.objects.length; i++) {
      const obj1 = this.objects[i];
      
      // Reset acceleration
      obj1.acceleration = { x: 0, y: 0, z: 0 };
      
      // Sum forces from all other objects
      for (let j = 0; j < this.objects.length; j++) {
        if (i === j) continue; // Skip self
        
        const obj2 = this.objects[j];
        
        // Calculate force
        const force = this.calculateGravitationalForce(obj1, obj2);
        
        // Apply to acceleration (F = ma, so a = F/m)
        obj1.acceleration.x += force.x / obj1.mass;
        obj1.acceleration.y += force.y / obj1.mass;
        obj1.acceleration.z += force.z / obj1.mass;
      }
    }
    
    // Update velocities and positions
    for (const obj of this.objects) {
      // Skip objects with fixed positions
      if (obj.fixed) continue;
      
      // Update velocity using acceleration
      obj.velocity.x += obj.acceleration.x * scaledDeltaTime;
      obj.velocity.y += obj.acceleration.y * scaledDeltaTime;
      obj.velocity.z += obj.acceleration.z * scaledDeltaTime;
      
      // Update position using velocity
      obj.position.x += obj.velocity.x * scaledDeltaTime;
      obj.position.y += obj.velocity.y * scaledDeltaTime;
      obj.position.z += obj.velocity.z * scaledDeltaTime;
      
      // Update orbit history
      if (obj.orbitHistory) {
        obj.orbitHistory.push({ ...obj.position });
        
        // Limit history length
        if (obj.orbitHistory.length > obj.orbitHistoryLength) {
          obj.orbitHistory.shift();
        }
      }
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    this.objects = [];
  }
}

// Make available to the window context
window.GravitySimulator = GravitySimulator;
