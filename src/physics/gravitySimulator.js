// Import constants
import { G } from '../data/solarSystem.js';
import * as THREE from 'three';

// GravitySimulator class for handling physics calculations
export class GravitySimulator {
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
  }

  calculateGravitationalForces(dt) {
    // For each pair of objects, calculate gravitational force
    for (let i = 0; i < this.objects.length; i++) {
      const objA = this.objects[i];
      
      for (let j = i + 1; j < this.objects.length; j++) {
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
      }
    }
  }

  updatePositions(dt) {
    // Update each object's position based on velocity
    for (const obj of this.objects) {
      obj.updatePosition(dt);
    }
  }

  checkCollisions() {
    // To be implemented: collision detection and handling
  }

  reset() {
    this.lastTime = 0;
  }
}