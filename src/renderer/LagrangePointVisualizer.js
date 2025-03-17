// Import Three.js using CommonJS
const THREE = require('three');
const { TextGeometry } = require('three/examples/jsm/geometries/TextGeometry.js');
const { FontLoader } = require('three/examples/jsm/loaders/FontLoader.js');

/**
 * LagrangePointVisualizer class
 * Calculates and visualizes Lagrange points for a two-body system
 */
class LagrangePointVisualizer {
  /**
   * Constructor for LagrangePointVisualizer
   * @param {THREE.Scene} scene - Three.js scene to add visualization to
   */
  constructor(scene) {
    this.scene = scene;
    this.lagrangePoints = [];
    this.visible = false;
    this.primaryBody = null;
    this.secondaryBody = null;
    this.font = null;
    this.loadFont();
  }

  /**
   * Load the font for Lagrange point labels
   */
  loadFont() {
    const fontLoader = new FontLoader();
    fontLoader.load('https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
      // If we already have bodies selected, recalculate with the font
      if (this.primaryBody && this.secondaryBody) {
        this.calculateLagrangePoints(this.primaryBody, this.secondaryBody);
      }
    });
  }

  /**
   * Calculate and visualize Lagrange points for a two-body system
   * @param {CelestialObject} primaryBody - Larger body (e.g., Sun)
   * @param {CelestialObject} secondaryBody - Smaller body (e.g., Earth)
   */
  calculateLagrangePoints(primaryBody, secondaryBody) {
    // Clear existing points
    this.clearPoints();
    
    // Calculate mass ratio
    const mu = secondaryBody.mass / (primaryBody.mass + secondaryBody.mass);
    
    // Calculate distance between bodies
    const bodyVector = new THREE.Vector3().subVectors(
      secondaryBody.position,
      primaryBody.position
    );
    const r = bodyVector.length();
    
    // Calculate unit vectors
    const unitRadial = bodyVector.clone().normalize();
    
    // Calculate perpendicular unit vector in the orbital plane
    // First, pick a vector that's guaranteed not to be parallel to unitRadial
    let randomVec;
    if (Math.abs(unitRadial.x) < 0.9) {
      randomVec = new THREE.Vector3(1, 0, 0);
    } else {
      randomVec = new THREE.Vector3(0, 1, 0);
    }
    
    // Now get a vector perpendicular to unitRadial
    const unitPerpendicular = new THREE.Vector3()
      .crossVectors(unitRadial, randomVec)
      .normalize();
    
    // And then ensure it's in the orbital plane by taking cross product again
    const unitNormal = new THREE.Vector3()
      .crossVectors(unitRadial, unitPerpendicular)
      .normalize();
    
    // Now unitPerpendicular is perpendicular to unitRadial in the orbital plane
    
    // Calculate L1 (between the two bodies)
    const l1Distance = r * (1 - Math.pow(mu/3, 1/3));
    const l1Position = primaryBody.position.clone().add(
      unitRadial.clone().multiplyScalar(l1Distance)
    );
    
    // Calculate L2 (beyond the secondary body)
    const l2Distance = r * (1 + Math.pow(mu/3, 1/3));
    const l2Position = primaryBody.position.clone().add(
      unitRadial.clone().multiplyScalar(l2Distance)
    );
    
    // Calculate L3 (behind the primary body)
    const l3Distance = r * (1 + 5/12 * mu);
    const l3Position = primaryBody.position.clone().add(
      unitRadial.clone().multiplyScalar(-l3Distance)
    );
    
    // Calculate L4 (60° ahead of secondary body)
    const l4Position = primaryBody.position.clone()
      .add(unitRadial.clone().multiplyScalar(r * 0.5))
      .add(unitPerpendicular.clone().multiplyScalar(r * Math.sqrt(3)/2));
    
    // Calculate L5 (60° behind secondary body)
    const l5Position = primaryBody.position.clone()
      .add(unitRadial.clone().multiplyScalar(r * 0.5))
      .add(unitPerpendicular.clone().multiplyScalar(-r * Math.sqrt(3)/2));
    
    // Create visualization for each point
    this.createPointVisualization(l1Position, 'L1');
    this.createPointVisualization(l2Position, 'L2');
    this.createPointVisualization(l3Position, 'L3');
    this.createPointVisualization(l4Position, 'L4');
    this.createPointVisualization(l5Position, 'L5');
    
    // Store references to primary and secondary bodies
    this.primaryBody = primaryBody;
    this.secondaryBody = secondaryBody;
  }
  
  /**
   * Create visual representation of a Lagrange point
   * @param {THREE.Vector3} position - Position of the Lagrange point
   * @param {String} label - Label for the point (L1-L5)
   */
  createPointVisualization(position, label) {
    // Create point geometry
    const geometry = new THREE.SphereGeometry(0.05 * this.visualScale(), 16, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    
    // Add text label if font is loaded
    let textMesh = null;
    if (this.font) {
      const textGeometry = new TextGeometry(label, {
        font: this.font,
        size: 0.1 * this.visualScale(),
        height: 0.01 * this.visualScale()
      });
      
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      textMesh = new THREE.Mesh(textGeometry, textMaterial);
      
      // Center the text and offset it slightly from the point
      textGeometry.computeBoundingBox();
      const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
      textMesh.position.copy(position).add(
        new THREE.Vector3(
          -textWidth / 2 + 0.2 * this.visualScale(), 
          0.2 * this.visualScale(), 
          0
        )
      );
    }
    
    // Add to scene if visible
    if (this.visible) {
      this.scene.add(mesh);
      if (textMesh) this.scene.add(textMesh);
    }
    
    // Store reference
    this.lagrangePoints.push({
      point: mesh,
      label: textMesh,
      position: position.clone(),
      type: label
    });
  }
  
  /**
   * Calculate scale for visualization based on distance between bodies
   * @returns {Number} - Scale factor for visual elements
   */
  visualScale() {
    if (!this.primaryBody || !this.secondaryBody) return 1;
    
    const distance = new THREE.Vector3().subVectors(
      this.secondaryBody.position,
      this.primaryBody.position
    ).length();
    
    // Adjust scale to be proportional to distance
    return Math.max(1, distance / 20);
  }
  
  /**
   * Update Lagrange point positions when bodies move
   */
  update() {
    if (!this.primaryBody || !this.secondaryBody) return;
    
    // Only recalculate if bodies have moved significantly
    const currentVector = new THREE.Vector3().subVectors(
      this.secondaryBody.position,
      this.primaryBody.position
    );
    
    // Store previous positions for comparison
    if (!this.prevPrimaryPos) {
      this.prevPrimaryPos = this.primaryBody.position.clone();
    }
    
    if (!this.prevSecondaryPos) {
      this.prevSecondaryPos = this.secondaryBody.position.clone();
    }
    
    // Check if positions have changed significantly
    const primaryMoved = new THREE.Vector3()
      .subVectors(this.primaryBody.position, this.prevPrimaryPos)
      .lengthSq() > 0.1;
    
    const secondaryMoved = new THREE.Vector3()
      .subVectors(this.secondaryBody.position, this.prevSecondaryPos)
      .lengthSq() > 0.1;
    
    // If either body has moved significantly, recalculate
    if (primaryMoved || secondaryMoved) {
      this.calculateLagrangePoints(this.primaryBody, this.secondaryBody);
      
      // Update previous positions
      this.prevPrimaryPos.copy(this.primaryBody.position);
      this.prevSecondaryPos.copy(this.secondaryBody.position);
    }
  }
  
  /**
   * Set visibility of Lagrange points
   * @param {Boolean} visible - Whether points should be visible
   */
  setVisible(visible) {
    this.visible = visible;
    
    this.lagrangePoints.forEach(point => {
      if (visible) {
        this.scene.add(point.point);
        if (point.label) this.scene.add(point.label);
      } else {
        this.scene.remove(point.point);
        if (point.label) this.scene.remove(point.label);
      }
    });
  }
  
  /**
   * Clear all Lagrange point visualizations
   */
  clearPoints() {
    this.lagrangePoints.forEach(point => {
      this.scene.remove(point.point);
      if (point.label) this.scene.remove(point.label);
      
      if (point.point.geometry) point.point.geometry.dispose();
      if (point.point.material) point.point.material.dispose();
      
      if (point.label && point.label.geometry) point.label.geometry.dispose();
      if (point.label && point.label.material) point.label.material.dispose();
    });
    
    this.lagrangePoints = [];
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    this.clearPoints();
    this.primaryBody = null;
    this.secondaryBody = null;
    this.font = null;
  }
}

// Export using CommonJS syntax
module.exports = LagrangePointVisualizer;
