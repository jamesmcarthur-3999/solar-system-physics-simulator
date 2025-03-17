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
      // Continue execution to avoid breaking the animation loop
    }
  }

  calculateGravitationalForces(dt) {
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

  updatePositions(dt) {
    // Update each object's position based on velocity
    for (const obj of this.objects) {
      try {
        obj.updatePosition(dt);
      } catch (error) {
        console.error(`Error updating position for ${obj.name}:`, error);
        // Continue with other objects
      }
    }
  }

  checkCollisions() {
    // Basic collision detection implementation
    for (let i = 0; i < this.objects.length; i++) {
      const objA = this.objects[i];
      
      for (let j = i + 1; j < this.objects.length; j++) {
        const objB = this.objects[j];
        
        try {
          // Calculate distance between objects
          const dx = objB.position.x - objA.position.x;
          const dy = objB.position.y - objA.position.y;
          const dz = objB.position.z - objA.position.z;
          
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          // Check for collision
          const minDistance = (objA.getDisplayRadius() + objB.getDisplayRadius());
          if (distance < minDistance) {
            // Very basic collision handling - just log for now
            console.log(`Collision detected between ${objA.name} and ${objB.name}`);
            
            // TODO: Implement more sophisticated collision response
            // For now, just slightly adjust positions to prevent sticking
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
            
            if (objA.mesh) objA.mesh.position.copy(objA.position);
            if (objB.mesh) objB.mesh.position.copy(objB.position);
          }
        } catch (error) {
          console.error(`Error checking collision between ${objA.name} and ${objB.name}:`, error);
          // Continue with other objects
        }
      }
    }
  }

  reset() {
    this.lastTime = 0;
  }
  
  // Clean up resources
  dispose() {
    // Dispose all objects
    for (const object of this.objects) {
      if (object && typeof object.dispose === 'function') {
        object.dispose();
      }
    }
    
    // Clear objects array
    this.objects = [];
  }
}

// Export using CommonJS syntax
module.exports = {
  GravitySimulator
};