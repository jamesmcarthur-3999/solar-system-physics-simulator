/**
 * Level of Detail (LOD) Renderer for Solar System
 * 
 * This module provides optimized rendering for distant objects by reducing
 * the geometry complexity based on the object's distance from the camera.
 */

const THREE = require('three');

/**
 * Level of Detail Manager for celestial objects
 */
class LODManager {
  /**
   * Create a new LOD Manager
   * @param {Object} options - Configuration options
   * @param {Number} options.highDetailDistance - Distance threshold for high detail (default: 50)
   * @param {Number} options.mediumDetailDistance - Distance threshold for medium detail (default: 200)
   * @param {Boolean} options.enabled - Whether LOD is enabled (default: true)
   */
  constructor(options = {}) {
    this.highDetailDistance = options.highDetailDistance || 50;
    this.mediumDetailDistance = options.mediumDetailDistance || 200;
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    
    // Map to store LOD status for each object
    this.objectLODStatus = new Map();
    
    // Geometry detail levels (segments)
    this.detailLevels = {
      high: 32, // High detail - 32 segments
      medium: 16, // Medium detail - 16 segments
      low: 8 // Low detail - 8 segments
    };
  }

  /**
   * Enable or disable LOD
   * @param {Boolean} enabled - Whether LOD should be enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Set distance thresholds for LOD levels
   * @param {Number} highDetail - Distance threshold for high detail
   * @param {Number} mediumDetail - Distance threshold for medium detail
   */
  setDistanceThresholds(highDetail, mediumDetail) {
    this.highDetailDistance = highDetail;
    this.mediumDetailDistance = mediumDetail;
  }

  /**
   * Get the appropriate detail level for an object based on distance
   * @param {Number} distance - Distance from the camera
   * @returns {String} - Detail level (high, medium, or low)
   */
  getDetailLevel(distance) {
    if (!this.enabled) return 'high';
    
    if (distance < this.highDetailDistance) {
      return 'high';
    } else if (distance < this.mediumDetailDistance) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Update LOD for an object based on its distance from the camera
   * @param {Object} object - Celestial object to update
   * @param {THREE.Camera} camera - Camera to measure distance from
   * @returns {Boolean} - Whether the object's LOD was changed
   */
  updateObjectLOD(object, camera) {
    if (!this.enabled || !object || !object.mesh || !camera) return false;
    
    try {
      // Calculate distance from camera to object
      const distance = camera.position.distanceTo(object.position);
      
      // Determine appropriate detail level
      const detailLevel = this.getDetailLevel(distance);
      
      // Get current LOD status for this object
      const currentLOD = this.objectLODStatus.get(object.id);
      
      // Check if LOD needs updating
      if (!currentLOD || currentLOD !== detailLevel) {
        // Update the object's geometry
        this.updateObjectGeometry(object, detailLevel);
        
        // Update LOD status
        this.objectLODStatus.set(object.id, detailLevel);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error updating LOD for object ${object.name}:`, error);
      return false;
    }
  }

  /**
   * Update an object's geometry based on detail level
   * @param {Object} object - Celestial object to update
   * @param {String} detailLevel - Detail level (high, medium, or low)
   */
  updateObjectGeometry(object, detailLevel) {
    if (!object || !object.mesh) return;
    
    try {
      // Get the number of segments for this detail level
      const segments = this.detailLevels[detailLevel];
      
      // Create new geometry
      const radius = object.getDisplayRadius();
      const newGeometry = new THREE.SphereGeometry(radius, segments, segments);
      
      // Store current material
      const material = object.mesh.material;
      
      // Remove old mesh from scene (parent)
      const parent = object.mesh.parent;
      if (parent) {
        parent.remove(object.mesh);
      }
      
      // Dispose of old geometry
      if (object.mesh.geometry) {
        object.mesh.geometry.dispose();
      }
      
      // Create new mesh with the same material
      const newMesh = new THREE.Mesh(newGeometry, material);
      newMesh.position.copy(object.position);
      
      // Preserve userData from old mesh
      newMesh.userData = object.mesh.userData;
      
      // Preserve any special properties from the old mesh
      if (object.mesh.castShadow) newMesh.castShadow = true;
      if (object.mesh.receiveShadow) newMesh.receiveShadow = true;
      
      // Replace the mesh
      object.mesh = newMesh;
      
      // Re-add to scene
      if (parent) {
        parent.add(object.mesh);
      }
      
      // Re-attach glow effect for stars
      if (object.isStar && object.glowMesh) {
        object.mesh.add(object.glowMesh);
      }
    } catch (error) {
      console.error(`Error updating geometry for object ${object.name}:`, error);
    }
  }

  /**
   * Update LOD for all objects based on camera distance
   * @param {Array} objects - Array of celestial objects
   * @param {THREE.Camera} camera - Camera to measure distance from
   */
  updateAllObjects(objects, camera) {
    if (!this.enabled || !objects || !camera) return;
    
    objects.forEach(object => {
      this.updateObjectLOD(object, camera);
    });
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.objectLODStatus.clear();
  }
}

/**
 * Optimized renderer with adaptive orbit lines
 */
class OptimizedRenderer {
  /**
   * Create an optimized renderer
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Create LOD manager
    this.lodManager = new LODManager(options.lod);
    
    // Orbit line optimization options
    this.orbitLineOptions = {
      maxPoints: options.maxOrbitPoints || 200, // Maximum points for distant objects
      minPoints: options.minOrbitPoints || 50, // Minimum points for any orbit
      distanceThreshold: options.orbitDistanceThreshold || 100, // Distance threshold for optimization
      enabled: options.optimizeOrbitLines !== false
    };
  }

  /**
   * Update LOD for all objects
   * @param {Array} objects - Array of celestial objects
   * @param {THREE.Camera} camera - Camera to measure distance from
   */
  updateLOD(objects, camera) {
    this.lodManager.updateAllObjects(objects, camera);
  }

  /**
   * Create an optimized orbit line
   * @param {Object} object - Celestial object
   * @param {THREE.Camera} camera - Camera for distance calculation
   * @param {THREE.Scene} scene - Scene to add the orbit line to
   */
  createOrbitLine(object, camera, scene) {
    if (!object || !scene) return;
    
    try {
      // Remove existing orbit line if any
      if (object.orbitLine && object.orbitLine.parent) {
        scene.remove(object.orbitLine);
        
        // Dispose of old resources
        if (object.orbitLine.geometry) {
          object.orbitLine.geometry.dispose();
        }
        if (object.orbitLine.material) {
          object.orbitLine.material.dispose();
        }
      }
      
      // Skip if no orbit points
      if (!object.orbitPoints || object.orbitPoints.length === 0) {
        return;
      }
      
      // Calculate appropriate number of points based on distance
      let numPoints = object.orbitPoints.length;
      
      if (this.orbitLineOptions.enabled && camera) {
        // Get distance from camera
        const distance = camera.position.distanceTo(object.position);
        
        // Calculate number of points based on distance
        if (distance > this.orbitLineOptions.distanceThreshold) {
          // Reduce points based on distance
          const reductionFactor = Math.max(
            0.1,
            this.orbitLineOptions.distanceThreshold / distance
          );
          
          numPoints = Math.max(
            this.orbitLineOptions.minPoints,
            Math.floor(object.orbitPoints.length * reductionFactor)
          );
          numPoints = Math.min(numPoints, this.orbitLineOptions.maxPoints);
        }
      }
      
      // Sample points from the orbit
      const sampledPoints = this.sampleOrbitPoints(object.orbitPoints, numPoints);
      
      // Create geometry for orbit line
      const geometry = new THREE.BufferGeometry().setFromPoints(sampledPoints);
      const material = new THREE.LineBasicMaterial({ 
        color: object.color, 
        opacity: 0.5, 
        transparent: true 
      });
      
      // Create line
      object.orbitLine = new THREE.Line(geometry, material);
      scene.add(object.orbitLine);
    } catch (error) {
      console.error(`Error creating optimized orbit line for ${object.name}:`, error);
    }
  }

  /**
   * Sample points from an orbit for reduced detail
   * @param {Array} points - Full set of orbit points
   * @param {Number} numSamples - Number of samples to take
   * @returns {Array} - Sampled points
   */
  sampleOrbitPoints(points, numSamples) {
    if (numSamples >= points.length) {
      return points;
    }
    
    const result = [];
    const step = points.length / numSamples;
    
    // Always include first and last points
    result.push(points[0]);
    
    // Sample intermediate points
    for (let i = 1; i < numSamples - 1; i++) {
      const index = Math.floor(i * step);
      result.push(points[index]);
    }
    
    // Add last point
    result.push(points[points.length - 1]);
    
    return result;
  }

  /**
   * Update orbit lines for all objects
   * @param {Array} objects - Array of celestial objects
   * @param {THREE.Camera} camera - Camera for distance calculation
   * @param {THREE.Scene} scene - Scene to add the orbit lines to
   */
  updateOrbitLines(objects, camera, scene) {
    if (!objects || !scene) return;
    
    objects.forEach(object => {
      this.createOrbitLine(object, camera, scene);
    });
  }

  /**
   * Enable or disable LOD
   * @param {Boolean} enabled - Whether LOD should be enabled
   */
  setLODEnabled(enabled) {
    this.lodManager.setEnabled(enabled);
  }

  /**
   * Enable or disable orbit line optimization
   * @param {Boolean} enabled - Whether orbit line optimization should be enabled
   */
  setOrbitOptimizationEnabled(enabled) {
    this.orbitLineOptions.enabled = enabled;
  }

  /**
   * Set LOD distance thresholds
   * @param {Number} highDetail - Distance threshold for high detail
   * @param {Number} mediumDetail - Distance threshold for medium detail
   */
  setLODDistanceThresholds(highDetail, mediumDetail) {
    this.lodManager.setDistanceThresholds(highDetail, mediumDetail);
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.lodManager) {
      this.lodManager.dispose();
    }
  }
}

module.exports = {
  LODManager,
  OptimizedRenderer
};