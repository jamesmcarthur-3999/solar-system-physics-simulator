// Import constants
const { G } = require('../data/solarSystem');
const THREE = require('three');

// GravitySimulator class for handling physics calculations
class GravitySimulator {
  constructor() {
    this.objects = [];
    this.timeScale = 1; // 1 day per second
    this.paused = false;
    this.lastTime = 0;
  }

  addObject(object) {
    this.objects.push(object);
  }

  removeObject(id) {
    // Get the object first so we can dispose of its resources
    const object = this.objects.find(obj => obj.id === id);
    if (object && typeof object.dispose === 'function') {
      object.dispose();
    }
    
    // Remove from array
    this.objects = this.objects.filter(obj => obj.id !== id);
  }

  setTimeScale(scale) {
    this.timeScale = scale;
  }

  setPaused(paused) {
    this.paused = paused;
  }

  update(time) {
    if (this.paused) return;
    
    try {
      // Calculate delta time in seconds
      const dt = (this.lastTime === 0) ? 0 : (time - this.lastTime) / 1000;
      this.lastTime = time;
      
      // Skip first frame
      if (dt === 0) return;
      
      // Scale delta time by time scale (convert to days)
      const scaledDt = dt * this.timeScale / 86400; // seconds to days
      
      // Calculate forces and update velocities
      this.calculateGravitationalForces(scaledDt);
      
      // Update positions based on new velocities
      this.updatePositions(scaledDt);
      
      // Check for collisions
      this.checkCollisions();
    } catch (error) {
      console.error('Error in physics update:', error);
      // Don't halt the simulation - we'll just skip this frame
    }
  }

  calculateGravitationalForces(dt) {
    // For each pair of objects, calculate gravitational force
    for (let i = 0; i < this.objects.length; i++) {
      const objA = this.objects[i];
      
      for (let j = i + 1; j < this.objects.length; j++) {
        try {
          const objB = this.objects[j];
          
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
          console.error(`Error calculating gravity between objects ${i} and ${j}:`, error);
          // Continue with the next pair
        }
      }
    }
  }

  updatePositions(dt) {
    // Update each object's position based on velocity
    for (const obj of this.objects) {
      try {
        obj.updatePosition(dt);
      } catch (error) {
        console.error(`Error updating position for object ${obj.id}:`, error);
        // Continue with the next object
      }
    }
  }

  checkCollisions() {
    // Simple collision detection
    for (let i = 0; i < this.objects.length; i++) {
      const objA = this.objects[i];
      
      for (let j = i + 1; j < this.objects.length; j++) {
        try {
          const objB = this.objects[j];
          
          // Skip star-star collisions (stars shouldn't collide)
          if (objA.isStar && objB.isStar) continue;
          
          // Calculate distance between objects
          const dx = objB.position.x - objA.position.x;
          const dy = objB.position.y - objA.position.y;
          const dz = objB.position.z - objA.position.z;
          
          const distanceSquared = dx * dx + dy * dy + dz * dz;
          const distance = Math.sqrt(distanceSquared);
          
          // Check if objects are colliding (simple sphere collision)
          const minDistance = (objA.radius + objB.radius) * 1e-6; // Convert km to AU scale
          
          if (distance < minDistance) {
            // Simple collision response - log it for now
            console.log(`Collision detected between ${objA.name} and ${objB.name}`);
            
            // TODO: Implement proper collision handling
            // For now, just slightly separate them to prevent continuous collisions
            const separation = minDistance - distance;
            const separationVector = new THREE.Vector3(dx, dy, dz).normalize().multiplyScalar(separation * 1.1);
            
            // Move smaller object away
            if (objA.mass < objB.mass) {
              objA.position.sub(separationVector);
            } else {
              objB.position.add(separationVector);
            }
          }
        } catch (error) {
          console.error(`Error checking collision between objects ${i} and ${j}:`, error);
          // Continue with the next pair
        }
      }
    }
  }

  reset() {
    this.lastTime = 0;
  }
  
  // Clean up resources
  dispose() {
    // Dispose of each object's resources
    for (const obj of this.objects) {
      if (typeof obj.dispose === 'function') {
        obj.dispose();
      }
    }
    this.objects = [];
  }
}

// Export using CommonJS syntax
module.exports = { GravitySimulator };