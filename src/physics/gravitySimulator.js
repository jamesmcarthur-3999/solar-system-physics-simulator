// Gravity Simulator - Handles physics calculations for celestial bodies

class GravitySimulator {
  constructor() {
    // Internal state
    this.objects = [];
    this.timeScale = window.CONSTANTS ? window.CONSTANTS.DEFAULT_TIME_SCALE : 1; // Days per second
    this.paused = false;
    this.lastTime = 0;
    
    // Physics settings
    this.G = window.CONSTANTS ? window.CONSTANTS.G : 6.67430e-11;
    this.secondsPerDay = window.CONSTANTS ? window.CONSTANTS.SECONDS_PER_DAY : 86400;
    this.collisionsEnabled = false; // Disable collisions initially until fixed
  }
  
  /**
   * Add a celestial object to the simulation
   * @param {Object} object - The object to add
   */
  addObject(object) {
    // Add getDisplayRadius method if it doesn't exist
    if (!object.getDisplayRadius) {
      object.getDisplayRadius = function() {
        return this.radius || 1;
      };
    }
    
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
   * Check for collisions between objects
   */
  checkCollisions() {
    if (!this.collisionsEnabled) return;
    
    try {
      // Check each pair of objects
      for (let i = 0; i < this.objects.length; i++) {
        const objA = this.objects[i];
        
        for (let j = i + 1; j < this.objects.length; j++) {
          const objB = this.objects[j];
          
          try {
            // Get object names for logging
            const nameA = objA.name || 'Object ' + i;
            const nameB = objB.name || 'Object ' + j;
            
            // Calculate distance between objects
            const dx = objB.position.x - objA.position.x;
            const dy = objB.position.y - objA.position.y;
            const dz = objB.position.z - objA.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // Get object radii
            const radiusA = objA.getDisplayRadius ? objA.getDisplayRadius() : (objA.radius || 1);
            const radiusB = objB.getDisplayRadius ? objB.getDisplayRadius() : (objB.radius || 1);
            
            // Check if objects are colliding
            if (distance < radiusA + radiusB) {
              console.log(`Collision detected between ${nameA} and ${nameB}`);
              
              // Handle collision (simple elastic collision)
              // In a real simulation, you'd need more complex physics for celestial body collisions
              
              // For now, just adjust positions to prevent overlap
              const overlap = (radiusA + radiusB) - distance;
              const adjustX = (dx / distance) * overlap * 0.5;
              const adjustY = (dy / distance) * overlap * 0.5;
              const adjustZ = (dz / distance) * overlap * 0.5;
              
              objA.position.x -= adjustX;
              objA.position.y -= adjustY;
              objA.position.z -= adjustZ;
              
              objB.position.x += adjustX;
              objB.position.y += adjustY;
              objB.position.z += adjustZ;
            }
          } catch (error) {
            console.error(`Error checking collision between ${objA.name || 'Unknown'} and ${objB.name || 'Unknown'}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in collision detection:', error);
    }
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
      
      // Initialize acceleration if not present
      if (!obj1.acceleration) {
        obj1.acceleration = { x: 0, y: 0, z: 0 };
      } else {
        obj1.acceleration.x = 0;
        obj1.acceleration.y = 0;
        obj1.acceleration.z = 0;
      }
      
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
      
      // Initialize velocity if not present
      if (!obj.velocity) {
        obj.velocity = { x: 0, y: 0, z: 0 };
      }
      
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
    
    // Check for collisions
    this.checkCollisions();
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
