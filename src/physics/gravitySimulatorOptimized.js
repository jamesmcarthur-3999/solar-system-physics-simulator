/**
 * Optimized Gravity Simulator using Barnes-Hut algorithm
 * 
 * This is an optimized version of the original GravitySimulator
 * that uses the Barnes-Hut algorithm to improve performance from
 * O(n²) to O(n log n) for large numbers of objects.
 */

// Import constants and dependencies
const { G } = require('../data/solarSystem');
const THREE = require('three');
const BarnesHutSimulator = require('./barnesHut');

// Optimized GravitySimulator class using Barnes-Hut
class OptimizedGravitySimulator {
  /**
   * Create a new optimized gravity simulator
   * @param {Number} theta - Barnes-Hut theta parameter (default: 0.5)
   */
  constructor(theta = 0.5) {
    this.objects = [];
    this.timeScale = 1; // 1 day per second
    this.paused = false;
    this.lastTime = 0;
    
    // Create Barnes-Hut simulator
    this.barnesHut = new BarnesHutSimulator(theta, G);
    
    // Performance monitoring
    this.lastFrameTime = 0;
    this.frameTimeAverage = 0;
    this.frameTimeCount = 0;
    this.frameTimeTotal = 0;
    
    // Add performance monitoring
    this.perfMonitorInterval = setInterval(() => {
      if (this.frameTimeCount > 0) {
        this.frameTimeAverage = this.frameTimeTotal / this.frameTimeCount;
        
        // Reset counters
        this.frameTimeCount = 0;
        this.frameTimeTotal = 0;
      }
    }, 1000);
  }

  /**
   * Add an object to the simulation
   * @param {Object} object - Celestial object to add
   */
  addObject(object) {
    this.objects.push(object);
  }

  /**
   * Remove an object from the simulation
   * @param {String} id - ID of the object to remove
   */
  removeObject(id) {
    // Get the object first so we can dispose of its resources
    const object = this.objects.find(obj => obj.id === id);
    if (object && typeof object.dispose === 'function') {
      object.dispose();
    }
    
    // Remove from array
    this.objects = this.objects.filter(obj => obj.id !== id);
  }

  /**
   * Set the simulation time scale
   * @param {Number} scale - New time scale
   */
  setTimeScale(scale) {
    this.timeScale = scale;
  }

  /**
   * Pause or resume the simulation
   * @param {Boolean} paused - Whether to pause
   */
  setPaused(paused) {
    this.paused = paused;
  }

  /**
   * Set the Barnes-Hut theta parameter
   * @param {Number} theta - New theta value (smaller is more accurate)
   */
  setTheta(theta) {
    this.barnesHut.setTheta(theta);
  }

  /**
   * Update the simulation
   * @param {Number} time - Current time
   */
  update(time) {
    if (this.paused) return;
    
    try {
      // Start performance measurement
      const perfStart = performance.now();
      
      // Calculate delta time in seconds
      const dt = (this.lastTime === 0) ? 0 : (time - this.lastTime) / 1000;
      this.lastTime = time;
      
      // Skip first frame
      if (dt === 0) return;
      
      // Scale delta time by time scale (convert to days)
      const scaledDt = dt * this.timeScale / 86400; // seconds to days
      
      // Calculate forces using Barnes-Hut algorithm
      this.calculateGravitationalForces(scaledDt);
      
      // Update positions based on new velocities
      this.updatePositions(scaledDt);
      
      // Check for collisions
      this.checkCollisions();
      
      // Calculate performance metrics
      const frameTime = performance.now() - perfStart;
      this.lastFrameTime = frameTime;
      this.frameTimeTotal += frameTime;
      this.frameTimeCount++;
    } catch (error) {
      console.error('Error in optimized physics update:', error);
      // Continue execution to avoid breaking the animation loop
    }
  }

  /**
   * Calculate gravitational forces using Barnes-Hut algorithm
   * @param {Number} dt - Time step in days
   */
  calculateGravitationalForces(dt) {
    try {
      // Use Barnes-Hut algorithm to calculate forces
      this.barnesHut.calculateForces(this.objects);
    } catch (error) {
      console.error('Error calculating forces with Barnes-Hut:', error);
      
      // Fallback to direct calculation if Barnes-Hut fails
      this.calculateForcesDirectly();
    }
  }

  /**
   * Calculate forces directly using O(n²) approach as fallback
   */
  calculateForcesDirectly() {
    // For each pair of objects, calculate gravitational force
    for (let i = 0; i < this.objects.length; i++) {
      const objA = this.objects[i];
      
      for (let j = i + 1; j < this.objects.length; j++) {
        const objB = this.objects[j];
        
        try {
          // Calculate distance between objects
          const dx = objB.position.x - objA.position.x;
          const dy = objB.position.y - objA.position.y;
          const dz = objB.position.z - objA.position.z;
          
          const distanceSquared = dx * dx + dy * dy + dz * dz;
          const distance = Math.sqrt(distanceSquared);
          
          // Skip if objects are too close (would cause extreme forces)
          if (distance < (objA.radius + objB.radius) * 1e-6) {
            // Handle collision eventually
            continue;
          }
          
          // Calculate force magnitude using Newton's law of gravitation
          // F = G * (m1 * m2) / r^2
          const forceMagnitude = G * objA.mass * objB.mass / distanceSquared;
          
          // Calculate force direction
          const forceX = forceMagnitude * dx / distance;
          const forceY = forceMagnitude * dy / distance;
          const forceZ = forceMagnitude * dz / distance;
          
          // Apply force to both objects (equal and opposite)
          objA.applyForce(new THREE.Vector3(forceX, forceY, forceZ));
          objB.applyForce(new THREE.Vector3(-forceX, -forceY, -forceZ));
        } catch (error) {
          console.error(`Error calculating forces between ${objA.name} and ${objB.name}:`, error);
          // Continue with other objects
        }
      }
    }
  }

  /**
   * Update positions of all objects
   * @param {Number} dt - Time step in days
   */
  updatePositions(dt) {
    // Adaptive physics resolution based on time scale
    const substeps = this.calculateSubsteps();
    const subDt = dt / substeps;
    
    // Perform multiple substeps for stability at high time scales
    for (let step = 0; step < substeps; step++) {
      // Update each object's position based on velocity
      for (const obj of this.objects) {
        try {
          obj.updatePosition(subDt);
        } catch (error) {
          console.error(`Error updating position for ${obj.name}:`, error);
          // Continue with other objects
        }
      }
    }
  }

  /**
   * Calculate number of substeps based on time scale
   * @returns {Number} - Number of substeps to use
   */
  calculateSubsteps() {
    // Use more substeps at higher time scales for stability
    const baseSubsteps = 1;
    const adaptiveSubsteps = Math.ceil(Math.log10(this.timeScale + 1));
    return Math.max(baseSubsteps, adaptiveSubsteps);
  }

  /**
   * Check for collisions between objects
   */
  checkCollisions() {
    // Only check for objects that are close to each other
    // Using a simple spatial hashing for efficiency
    const cellSize = 10; // Size of spatial hash cells
    const spatialHash = new Map();
    
    // Place objects in spatial hash
    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      const cellX = Math.floor(obj.position.x / cellSize);
      const cellY = Math.floor(obj.position.y / cellSize);
      const cellZ = Math.floor(obj.position.z / cellSize);
      
      // Hash key for this cell
      const key = `${cellX},${cellY},${cellZ}`;
      
      // Add object to cell
      if (!spatialHash.has(key)) {
        spatialHash.set(key, []);
      }
      spatialHash.get(key).push(obj);
      
      // Also check neighboring cells to handle objects at cell boundaries
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (dx === 0 && dy === 0 && dz === 0) continue; // Skip center cell
            
            const neighborKey = `${cellX + dx},${cellY + dy},${cellZ + dz}`;
            
            // Check against objects in neighboring cell
            if (spatialHash.has(neighborKey)) {
              const neighbors = spatialHash.get(neighborKey);
              
              for (const neighbor of neighbors) {
                try {
                  this.checkCollisionBetween(obj, neighbor);
                } catch (error) {
                  console.error(`Error checking collision between ${obj.name} and ${neighbor.name}:`, error);
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Check for collision between two objects
   * @param {Object} objA - First object
   * @param {Object} objB - Second object
   */
  checkCollisionBetween(objA, objB) {
    // Skip if it's the same object
    if (objA.id === objB.id) return;
    
    // Calculate distance between objects
    const dx = objB.position.x - objA.position.x;
    const dy = objB.position.y - objA.position.y;
    const dz = objB.position.z - objA.position.z;
    
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Check for collision
    const minDistance = (objA.getDisplayRadius() + objB.getDisplayRadius());
    if (distance < minDistance) {
      // Log collision
      console.log(`Collision detected between ${objA.name} and ${objB.name}`);
      
      // Basic collision response - adjust positions to prevent objects from overlapping
      const pushDistance = (minDistance - distance) * 0.5;
      const pushX = (dx / distance) * pushDistance;
      const pushY = (dy / distance) * pushDistance;
      const pushZ = (dz / distance) * pushDistance;
      
      objA.position.x -= pushX;
      objA.position.y -= pushY;
      objA.position.z -= pushZ;
      
      objB.position.x += pushX;
      objB.position.y += pushY;
      objB.position.z += pushZ;
      
      // Update mesh positions
      if (objA.mesh) objA.mesh.position.copy(objA.position);
      if (objB.mesh) objB.mesh.position.copy(objB.position);
    }
  }

  /**
   * Reset the simulation
   */
  reset() {
    this.lastTime = 0;
  }
  
  /**
   * Get performance metrics
   * @returns {Object} - Performance metrics
   */
  getPerformanceMetrics() {
    return {
      lastFrameTime: this.lastFrameTime,
      averageFrameTime: this.frameTimeAverage,
      objectCount: this.objects.length
    };
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Dispose all objects
    for (const object of this.objects) {
      if (object && typeof object.dispose === 'function') {
        object.dispose();
      }
    }
    
    // Clear objects array
    this.objects = [];
    
    // Clear performance monitor interval
    clearInterval(this.perfMonitorInterval);
  }
}

module.exports = {
  OptimizedGravitySimulator
};