// gravityVisualizer.js - Creates visual representations of gravitational fields
const THREE = require('three');

/**
 * Creates and manages gravity well visualizations for celestial objects
 */
class GravityVisualizer {
  /**
   * Creates a new gravity visualizer
   * @param {THREE.Scene} scene - The Three.js scene to add visualizations to
   */
  constructor(scene) {
    this.scene = scene;
    this.visualizations = new Map(); // Map of object ID to visualization mesh
    this.enabled = false;
    this.massThreshold = 1e24; // Only show for objects above this mass
  }
  
  /**
   * Toggles visibility of all gravity visualizations
   * @param {boolean} enabled - Whether visualizations should be shown
   */
  toggleVisibility(enabled) {
    this.enabled = enabled !== undefined ? enabled : !this.enabled;
    
    // Update visibility of all existing visualizations
    this.visualizations.forEach(viz => {
      viz.visible = this.enabled;
    });
    
    return this.enabled;
  }
  
  /**
   * Creates a gravity well visualization for the specified celestial object
   * @param {Object} celestialObject - The object to visualize gravity for
   */
  createVisualization(celestialObject) {
    // Skip small objects
    if (celestialObject.mass < this.massThreshold) {
      return;
    }
    
    // Skip if we already have a visualization for this object
    if (this.visualizations.has(celestialObject.id)) {
      this.updateVisualization(celestialObject);
      return;
    }
    
    try {
      // Define visualization parameters based on object mass
      const size = Math.max(100, Math.min(1000, celestialObject.mass / 1e28 * 500));
      const resolution = 32;
      const distortionFactor = Math.min(10, celestialObject.mass / 1e30 * 5);
      
      // Create a plane geometry
      const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
      
      // Create deformation based on mass
      this._deformGeometry(geometry, celestialObject.mass, size, distortionFactor);
      
      // Create visualization material
      const material = new THREE.MeshBasicMaterial({
        color: this._getColorForObject(celestialObject),
        wireframe: true,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      
      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `gravity-well-${celestialObject.id}`;
      mesh.rotation.x = Math.PI / 2; // Make it horizontal
      mesh.visible = this.enabled;
      
      // Add to scene
      this.scene.add(mesh);
      this.visualizations.set(celestialObject.id, mesh);
      
      console.log(`Created gravity visualization for ${celestialObject.name}`);
    } catch (error) {
      console.error(`Error creating gravity visualization for ${celestialObject.name}:`, error);
    }
  }
  
  /**
   * Updates the position and properties of an existing gravity visualization
   * @param {Object} celestialObject - The object whose visualization to update
   */
  updateVisualization(celestialObject) {
    const visualization = this.visualizations.get(celestialObject.id);
    if (!visualization) return;
    
    try {
      // Update position to match the celestial object
      visualization.position.copy(celestialObject.position);
    } catch (error) {
      console.error(`Error updating gravity visualization for ${celestialObject.name}:`, error);
    }
  }
  
  /**
   * Updates all gravity visualizations based on current object positions
   * @param {Array|Map} celestialObjects - Collection of celestial objects
   */
  updateAllVisualizations(celestialObjects) {
    try {
      if (Array.isArray(celestialObjects)) {
        celestialObjects.forEach(obj => this.updateVisualization(obj));
      } else if (celestialObjects instanceof Map) {
        celestialObjects.forEach(obj => this.updateVisualization(obj));
      }
    } catch (error) {
      console.error('Error updating gravity visualizations:', error);
    }
  }
  
  /**
   * Creates gravity visualizations for a collection of celestial objects
   * @param {Array|Map} celestialObjects - Collection of celestial objects
   */
  createAllVisualizations(celestialObjects) {
    try {
      if (Array.isArray(celestialObjects)) {
        celestialObjects.forEach(obj => this.createVisualization(obj));
      } else if (celestialObjects instanceof Map) {
        celestialObjects.forEach(obj => this.createVisualization(obj));
      }
    } catch (error) {
      console.error('Error creating gravity visualizations:', error);
    }
  }
  
  /**
   * Removes the gravity visualization for a specific object
   * @param {string} objectId - ID of the celestial object
   */
  removeVisualization(objectId) {
    const visualization = this.visualizations.get(objectId);
    if (!visualization) return;
    
    try {
      // Remove from scene
      this.scene.remove(visualization);
      
      // Dispose of geometry and material
      if (visualization.geometry) {
        visualization.geometry.dispose();
      }
      
      if (visualization.material) {
        visualization.material.dispose();
      }
      
      // Remove from map
      this.visualizations.delete(objectId);
    } catch (error) {
      console.error(`Error removing gravity visualization for object ${objectId}:`, error);
    }
  }
  
  /**
   * Removes all gravity visualizations
   */
  removeAllVisualizations() {
    try {
      this.visualizations.forEach((viz, id) => {
        this.scene.remove(viz);
        
        if (viz.geometry) {
          viz.geometry.dispose();
        }
        
        if (viz.material) {
          viz.material.dispose();
        }
      });
      
      this.visualizations.clear();
    } catch (error) {
      console.error('Error removing all gravity visualizations:', error);
    }
  }
  
  /**
   * Disposes of all resources when no longer needed
   */
  dispose() {
    this.removeAllVisualizations();
  }
  
  /**
   * Deforms a plane geometry to create a gravity well effect
   * @param {THREE.PlaneGeometry} geometry - The geometry to deform
   * @param {number} mass - Object mass for depth calculation
   * @param {number} size - Size of the plane
   * @param {number} distortionFactor - How deep the well should be
   * @private
   */
  _deformGeometry(geometry, mass, size, distortionFactor) {
    // Get position attribute
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array;
    
    // Modify each vertex
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Calculate distance from center
      const distance = Math.sqrt(x * x + z * z);
      
      // Create gravity well deformation (inverse square law effect)
      const halfSize = size / 2;
      const normalizedDistance = Math.min(1, distance / halfSize);
      const distortion = -distortionFactor * (1 - normalizedDistance * normalizedDistance);
      
      // Apply to y coordinate (depth)
      positions[i + 1] = distortion;
    }
    
    // Mark positions as needing update
    positionAttribute.needsUpdate = true;
    
    // Recompute normals
    geometry.computeVertexNormals();
  }
  
  /**
   * Determines a color for the gravity visualization based on object properties
   * @param {Object} celestialObject - The celestial object
   * @returns {number} THREE.js compatible color
   * @private
   */
  _getColorForObject(celestialObject) {
    // Use object's color if available, otherwise determine by type
    if (celestialObject.color) {
      // If string hex color, convert to number
      if (typeof celestialObject.color === 'string') {
        return new THREE.Color(celestialObject.color).getHex();
      }
      return celestialObject.color;
    }
    
    // Default colors by object type
    switch (celestialObject.type) {
      case 'star':
        return 0xffaa00;
      case 'planet':
        return 0x3388ff;
      case 'moon':
        return 0x88ccff;
      case 'asteroid':
        return 0x999999;
      case 'comet':
        return 0x00ffcc;
      default:
        return 0x0088ff;
    }
  }
}

module.exports = {
  GravityVisualizer
};
