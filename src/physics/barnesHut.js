/**
 * Barnes-Hut Algorithm Implementation for N-body Simulation
 * 
 * The Barnes-Hut algorithm improves the performance of N-body simulations
 * from O(n²) to O(n log n) by approximating the forces from distant bodies.
 * 
 * It works by organizing bodies in an octree (3D) or quadtree (2D) and treating
 * distant clusters of bodies as a single body with combined mass.
 */

const THREE = require('three');

/**
 * Octree node for the Barnes-Hut algorithm
 */
class OctreeNode {
  /**
   * Create a new octree node
   * @param {THREE.Vector3} center - Center point of the node's region
   * @param {Number} size - Size of the node's region (width/height/depth)
   */
  constructor(center, size) {
    this.center = center.clone();
    this.size = size;
    this.children = new Array(8).fill(null);
    this.body = null;
    this.totalMass = 0;
    this.centerOfMass = new THREE.Vector3();
    this.hasChildren = false;
    this.bodyCount = 0;
  }

  /**
   * Check if a point is within this node's region
   * @param {THREE.Vector3} position - Position to check
   * @returns {Boolean} - True if the point is in the region
   */
  containsPoint(position) {
    return (
      position.x >= this.center.x - this.size / 2 &&
      position.x <= this.center.x + this.size / 2 &&
      position.y >= this.center.y - this.size / 2 &&
      position.y <= this.center.y + this.size / 2 &&
      position.z >= this.center.z - this.size / 2 &&
      position.z <= this.center.z + this.size / 2
    );
  }

  /**
   * Get the index of the child node that would contain a position
   * @param {THREE.Vector3} position - Position to check
   * @returns {Number} - Index of the child (0-7)
   */
  getChildIndex(position) {
    let index = 0;
    if (position.x >= this.center.x) index |= 1; // Right
    if (position.y >= this.center.y) index |= 2; // Top
    if (position.z >= this.center.z) index |= 4; // Front
    return index;
  }

  /**
   * Get the center point of a child node at a given index
   * @param {Number} index - Index of the child (0-7)
   * @returns {THREE.Vector3} - Center point of the child
   */
  getChildCenter(index) {
    const offset = this.size / 4;
    const x = this.center.x + (index & 1 ? offset : -offset);
    const y = this.center.y + (index & 2 ? offset : -offset);
    const z = this.center.z + (index & 4 ? offset : -offset);
    return new THREE.Vector3(x, y, z);
  }

  /**
   * Insert a body into the octree
   * @param {Object} body - Celestial body to insert
   */
  insert(body) {
    // If this node is empty, add the body here
    if (this.bodyCount === 0) {
      this.body = body;
      this.totalMass = body.mass;
      this.centerOfMass.copy(body.position);
      this.bodyCount = 1;
      return;
    }

    // If this node already has a body, create children if needed
    if (!this.hasChildren) {
      this.subdivide();
    }

    // Add the current body's contribution to center of mass
    this.centerOfMass.multiplyScalar(this.totalMass);
    this.centerOfMass.add(new THREE.Vector3().copy(body.position).multiplyScalar(body.mass));
    this.totalMass += body.mass;
    this.centerOfMass.divideScalar(this.totalMass);
    this.bodyCount++;

    // Insert the body into the appropriate child
    const childIndex = this.getChildIndex(body.position);
    this.children[childIndex].insert(body);
  }

  /**
   * Subdivide the node into 8 children
   */
  subdivide() {
    // Create 8 child nodes
    const childSize = this.size / 2;
    for (let i = 0; i < 8; i++) {
      const childCenter = this.getChildCenter(i);
      this.children[i] = new OctreeNode(childCenter, childSize);
    }

    // Move existing body into the appropriate child
    if (this.body) {
      const index = this.getChildIndex(this.body.position);
      this.children[index].insert(this.body);
      this.body = null;
    }

    this.hasChildren = true;
  }

  /**
   * Calculate the gravitational force on a body
   * @param {Object} body - Body to calculate force for
   * @param {Number} theta - Barnes-Hut theta parameter (accuracy control)
   * @param {Number} G - Gravitational constant
   * @param {THREE.Vector3} force - Vector to accumulate forces into
   */
  calculateForce(body, theta, G, force) {
    // If this node is empty, there's no force
    if (this.bodyCount === 0) {
      return;
    }

    // Calculate distance between body and this node's center of mass
    const dx = this.centerOfMass.x - body.position.x;
    const dy = this.centerOfMass.y - body.position.y;
    const dz = this.centerOfMass.z - body.position.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    
    // Avoid applying force from the body to itself
    if (distanceSquared <= 1e-10) {
      return;
    }

    // If this node is a leaf with a single body, calculate exact force
    if (this.bodyCount === 1 && this.body) {
      // Skip if it's the same body
      if (this.body.id === body.id) {
        return;
      }

      const distance = Math.sqrt(distanceSquared);
      const forceMagnitude = G * this.body.mass * body.mass / distanceSquared;
      
      // Add force components
      force.x += forceMagnitude * dx / distance;
      force.y += forceMagnitude * dy / distance;
      force.z += forceMagnitude * dz / distance;
      return;
    }

    // Check if this node is far enough to use approximation
    const s = this.size;
    const d = Math.sqrt(distanceSquared);
    
    if (s / d < theta) {
      // This node is far enough to be treated as a single body
      const distance = Math.sqrt(distanceSquared);
      const forceMagnitude = G * this.totalMass * body.mass / distanceSquared;
      
      // Add force components
      force.x += forceMagnitude * dx / distance;
      force.y += forceMagnitude * dy / distance;
      force.z += forceMagnitude * dz / distance;
    } else {
      // Node is too close, recursively calculate forces from children
      if (this.hasChildren) {
        for (let i = 0; i < 8; i++) {
          if (this.children[i]) {
            this.children[i].calculateForce(body, theta, G, force);
          }
        }
      }
    }
  }
}

/**
 * Barnes-Hut simulation for efficient n-body gravity calculation
 */
class BarnesHutSimulator {
  /**
   * Create a new Barnes-Hut simulator
   * @param {Number} theta - Accuracy parameter (0.5 is good, smaller is more accurate)
   * @param {Number} G - Gravitational constant
   */
  constructor(theta = 0.5, G = 6.67430e-11) {
    this.theta = theta;
    this.G = G;
    this.root = null;
    this.bounds = {
      min: new THREE.Vector3(),
      max: new THREE.Vector3()
    };
  }

  /**
   * Set the accuracy parameter
   * @param {Number} theta - New theta value (0.5 is good, smaller is more accurate)
   */
  setTheta(theta) {
    this.theta = theta;
  }

  /**
   * Calculate the bounds of the simulation space based on bodies
   * @param {Array} bodies - Array of celestial bodies
   */
  calculateBounds(bodies) {
    if (bodies.length === 0) return;

    // Initialize with first body
    this.bounds.min.copy(bodies[0].position);
    this.bounds.max.copy(bodies[0].position);

    // Find min and max for each dimension
    for (let i = 1; i < bodies.length; i++) {
      const pos = bodies[i].position;
      
      // Update minimum bounds
      this.bounds.min.x = Math.min(this.bounds.min.x, pos.x);
      this.bounds.min.y = Math.min(this.bounds.min.y, pos.y);
      this.bounds.min.z = Math.min(this.bounds.min.z, pos.z);
      
      // Update maximum bounds
      this.bounds.max.x = Math.max(this.bounds.max.x, pos.x);
      this.bounds.max.y = Math.max(this.bounds.max.y, pos.y);
      this.bounds.max.z = Math.max(this.bounds.max.z, pos.z);
    }

    // Add padding to ensure all bodies are contained
    const padding = 0.01;
    this.bounds.min.multiplyScalar(1 + padding);
    this.bounds.max.multiplyScalar(1 + padding);
  }

  /**
   * Build the octree from a set of bodies
   * @param {Array} bodies - Array of celestial bodies
   */
  buildOctree(bodies) {
    // Calculate bounds of the simulation space
    this.calculateBounds(bodies);

    // Calculate center and size of the root node
    const center = new THREE.Vector3().addVectors(this.bounds.min, this.bounds.max).multiplyScalar(0.5);
    
    // Size should be the larger of width, height, or depth
    const size = Math.max(
      this.bounds.max.x - this.bounds.min.x,
      this.bounds.max.y - this.bounds.min.y,
      this.bounds.max.z - this.bounds.min.z
    ) * 1.1; // Add 10% margin to ensure all bodies fit

    // Create the root node
    this.root = new OctreeNode(center, size);

    // Insert all bodies into the octree
    bodies.forEach(body => {
      this.root.insert(body);
    });
  }

  /**
   * Calculate gravitational forces for all bodies
   * @param {Array} bodies - Array of celestial bodies
   */
  calculateForces(bodies) {
    // Build the octree first
    this.buildOctree(bodies);

    // Calculate forces for each body
    bodies.forEach(body => {
      const force = new THREE.Vector3(0, 0, 0);
      
      // Calculate force using the octree
      this.root.calculateForce(body, this.theta, this.G, force);
      
      // Apply the force to the body
      body.applyForce(force);
    });
  }
}

module.exports = BarnesHutSimulator;