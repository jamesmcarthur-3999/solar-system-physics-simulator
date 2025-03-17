/**
 * Orbit Prediction Visualization for the Solar System Simulator
 */

const THREE = require('three');
const { GravitySimulator } = require('../physics/gravitySimulator');
const CelestialObject = require('../data/celestialObject');

// Class to handle orbital prediction visualization
class OrbitPredictionVisualizer {
  constructor(scene) {
    this.scene = scene;
    this.predictions = new Map();
  }
  
  /**
   * Show orbit prediction for a specific celestial object
   * @param {Array} objects - Array of all celestial objects in the system
   * @param {String} objectId - ID of the object to predict orbit for
   * @param {Number} numSteps - Number of simulation steps for prediction (default: 1000)
   * @param {Number} timeStepDays - Time step in days for each prediction step (default: 1)
   * @param {Number} opacity - Opacity of the prediction line (default: 0.6)
   * @param {Number} detail - Level of detail for the prediction (skips rendering some points) (default: 1)
   */
  showOrbitPrediction(objects, objectId, numSteps = 1000, timeStepDays = 1, opacity = 0.6, detail = 1) {
    try {
      // Clear any existing prediction for this object
      this.hideOrbitPrediction(objectId);
      
      // Find the target object
      const targetObject = objects.find(obj => obj.id === objectId);
      if (!targetObject) {
        console.warn(`Object with ID ${objectId} not found for orbit prediction`);
        return;
      }
      
      // Clone the current solar system state for simulation
      const simulationObjects = [];
      
      for (const obj of objects) {
        // Create a simplified clone of each object for simulation
        const clonedObj = new CelestialObject({
          id: obj.id,
          name: obj.name,
          mass: obj.mass,
          radius: obj.radius,
          position: [obj.position.x, obj.position.y, obj.position.z],
          velocity: [obj.velocity.x, obj.velocity.y, obj.velocity.z],
          color: obj.color
        });
        
        // Skip mesh creation for faster simulation
        if (clonedObj.mesh) {
          // Remove mesh to avoid unnecessary overhead
          delete clonedObj.mesh;
        }
        
        simulationObjects.push(clonedObj);
      }
      
      // Create a temporary physics simulator
      const simulator = new GravitySimulator();
      
      // Add all objects to the simulator
      simulationObjects.forEach(obj => {
        simulator.addObject(obj);
      });
      
      // Create array to store predicted positions
      const positions = [];
      
      // Run simulation for specified steps
      const timeStep = timeStepDays; // in days
      
      for (let i = 0; i < numSteps; i++) {
        simulator.update(timeStep * 86400); // Convert days to seconds
        
        // Store position of target object (only store every 'detail' steps for performance)
        if (i % detail === 0) {
          const targetObj = simulationObjects.find(obj => obj.id === objectId);
          if (targetObj) {
            positions.push(new THREE.Vector3().copy(targetObj.position));
          }
        }
      }
      
      // Create line geometry from positions
      const geometry = new THREE.BufferGeometry().setFromPoints(positions);
      
      // Create line material
      const material = new THREE.LineBasicMaterial({
        color: targetObject.color || 0xffffff,
        transparent: true,
        opacity: opacity
      });
      
      // Create line and add to scene
      const predictedOrbit = new THREE.Line(geometry, material);
      this.scene.add(predictedOrbit);
      
      // Store reference for later removal
      this.predictions.set(objectId, predictedOrbit);
      
      // Clean up simulator
      simulator.dispose();
      
      return true;
    } catch (error) {
      console.error('Error creating orbit prediction:', error);
      return false;
    }
  }
  
  /**
   * Hide orbit prediction for a specific object
   * @param {String} objectId - ID of the object to hide prediction for
   */
  hideOrbitPrediction(objectId) {
    try {
      const prediction = this.predictions.get(objectId);
      if (prediction) {
        // Remove from scene
        this.scene.remove(prediction);
        
        // Dispose of resources
        if (prediction.geometry) {
          prediction.geometry.dispose();
        }
        
        if (prediction.material) {
          prediction.material.dispose();
        }
        
        // Remove from map
        this.predictions.delete(objectId);
      }
    } catch (error) {
      console.error('Error hiding orbit prediction:', error);
    }
  }
  
  /**
   * Hide all orbit predictions
   */
  hideAllPredictions() {
    try {
      // Get all object IDs with predictions
      const objectIds = Array.from(this.predictions.keys());
      
      // Hide each prediction
      for (const id of objectIds) {
        this.hideOrbitPrediction(id);
      }
    } catch (error) {
      console.error('Error hiding all orbit predictions:', error);
    }
  }
  
  /**
   * Update orbit prediction for an object
   * @param {Array} objects - Array of all celestial objects
   * @param {String} objectId - ID of the object to update prediction for
   */
  updateOrbitPrediction(objects, objectId) {
    if (this.predictions.has(objectId)) {
      this.showOrbitPrediction(objects, objectId);
    }
  }
  
  /**
   * Update all active predictions
   * @param {Array} objects - Array of all celestial objects
   */
  updateAllPredictions(objects) {
    const objectIds = Array.from(this.predictions.keys());
    for (const id of objectIds) {
      this.updateOrbitPrediction(objects, id);
    }
  }
  
  /**
   * Toggle orbit prediction for an object
   * @param {Array} objects - Array of all celestial objects
   * @param {String} objectId - ID of the object to toggle prediction for
   */
  toggleOrbitPrediction(objects, objectId) {
    if (this.predictions.has(objectId)) {
      this.hideOrbitPrediction(objectId);
      return false;
    } else {
      return this.showOrbitPrediction(objects, objectId);
    }
  }
  
  /**
   * Check if an object has an active prediction
   * @param {String} objectId - ID of the object to check
   * @returns {Boolean} - True if the object has an active prediction
   */
  hasOrbitPrediction(objectId) {
    return this.predictions.has(objectId);
  }
  
  /**
   * Dispose of all resources
   */
  dispose() {
    this.hideAllPredictions();
  }
}

module.exports = OrbitPredictionVisualizer;