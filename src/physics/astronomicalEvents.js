/**
 * Astronomical Events Detection for Solar System Simulator
 * 
 * This module handles detection of important astronomical events such as:
 * - Conjunctions (objects appearing close from Earth's perspective)
 * - Oppositions (objects on opposite sides of Earth)
 * - Eclipses (objects blocking light from the Sun)
 * - Close approaches (objects passing near each other)
 */

const THREE = require('three');

class AstronomicalEventDetector {
  constructor() {
    this.events = [];
    this.lastDetectionTime = 0;
    this.detectionInterval = 1000; // Check for events every 1000ms
    this.eventThresholds = {
      conjunction: 5.0, // Angle in degrees
      opposition: 175.0, // Angle in degrees
      eclipse: 0.5, // Overlap ratio
      closeApproach: 0.1 // Distance factor (relative to sum of object radii)
    };
  }

  /**
   * Set detection thresholds for different event types
   * @param {Object} thresholds - Object with thresholds for each event type
   */
  setThresholds(thresholds) {
    this.eventThresholds = { ...this.eventThresholds, ...thresholds };
  }

  /**
   * Set detection interval in milliseconds
   * @param {Number} interval - Interval in milliseconds
   */
  setDetectionInterval(interval) {
    this.detectionInterval = interval;
  }

  /**
   * Detect astronomical events in the current state of the solar system
   * @param {Array} objects - Array of celestial objects
   * @param {Number} currentTime - Current simulation time (milliseconds)
   * @returns {Array} - Array of detected events
   */
  detectEvents(objects, currentTime) {
    // Only run detection if enough time has passed since last detection
    if (currentTime - this.lastDetectionTime < this.detectionInterval) {
      return this.events;
    }

    // Update last detection time
    this.lastDetectionTime = currentTime;

    // Clear old events
    this.events = [];

    try {
      // Find Earth and Sun for reference
      const earth = objects.find(obj => obj.name === 'Earth');
      const sun = objects.find(obj => obj.name === 'Sun' || obj.isStar);

      if (!earth || !sun) {
        // Can't detect certain events without Earth or Sun
        this.detectCloseApproaches(objects);
        return this.events;
      }

      // Detect all types of events
      this.detectConjunctions(objects, earth, sun);
      this.detectOppositions(objects, earth, sun);
      this.detectEclipses(objects, sun);
      this.detectCloseApproaches(objects);

    } catch (error) {
      console.error('Error detecting astronomical events:', error);
    }

    return this.events;
  }

  /**
   * Detect conjunctions (objects appearing close from Earth's perspective)
   * @param {Array} objects - Array of celestial objects
   * @param {Object} earth - Earth object
   * @param {Object} sun - Sun object
   */
  detectConjunctions(objects, earth, sun) {
    try {
      // Can't detect conjunctions without Earth
      if (!earth) return;

      // For each pair of objects (excluding Earth)
      for (let i = 0; i < objects.length; i++) {
        const obj1 = objects[i];
        if (obj1.id === earth.id) continue;

        for (let j = i + 1; j < objects.length; j++) {
          const obj2 = objects[j];
          if (obj2.id === earth.id) continue;

          // Calculate vectors from Earth to both objects
          const earthToObj1 = new THREE.Vector3().subVectors(obj1.position, earth.position);
          const earthToObj2 = new THREE.Vector3().subVectors(obj2.position, earth.position);

          // Calculate angle between vectors in degrees
          const angle = earthToObj1.angleTo(earthToObj2) * (180 / Math.PI);

          // Check if angle is below threshold for conjunction
          if (angle < this.eventThresholds.conjunction) {
            this.events.push({
              type: 'conjunction',
              objects: [obj1.name, obj2.name],
              angle: angle.toFixed(2),
              time: Date.now(),
              description: `${obj1.name} and ${obj2.name} appear close together when viewed from Earth (${angle.toFixed(2)}°)`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error detecting conjunctions:', error);
    }
  }

  /**
   * Detect oppositions (objects on opposite sides of Earth)
   * @param {Array} objects - Array of celestial objects
   * @param {Object} earth - Earth object
   * @param {Object} sun - Sun object
   */
  detectOppositions(objects, earth, sun) {
    try {
      // Can't detect oppositions without Earth and Sun
      if (!earth || !sun) return;

      // Calculate vector from Earth to Sun
      const earthToSun = new THREE.Vector3().subVectors(sun.position, earth.position);

      // For each object (excluding Earth and Sun)
      for (const obj of objects) {
        if (obj.id === earth.id || obj.id === sun.id) continue;

        // Calculate vector from Earth to object
        const earthToObj = new THREE.Vector3().subVectors(obj.position, earth.position);

        // Calculate angle between vectors in degrees
        const angle = earthToSun.angleTo(earthToObj) * (180 / Math.PI);

        // Check if angle is close to 180 degrees (opposition)
        if (angle > this.eventThresholds.opposition) {
          this.events.push({
            type: 'opposition',
            objects: [sun.name, obj.name],
            angle: angle.toFixed(2),
            time: Date.now(),
            description: `${obj.name} is on the opposite side of Earth from the ${sun.name} (${angle.toFixed(2)}°)`
          });
        }
      }
    } catch (error) {
      console.error('Error detecting oppositions:', error);
    }
  }

  /**
   * Detect eclipses (objects blocking light from the Sun)
   * @param {Array} objects - Array of celestial objects
   * @param {Object} sun - Sun object
   */
  detectEclipses(objects, sun) {
    try {
      // Can't detect eclipses without Sun
      if (!sun) return;

      // For each pair of objects (excluding Sun)
      for (let i = 0; i < objects.length; i++) {
        const obj1 = objects[i];
        if (obj1.id === sun.id) continue;

        for (let j = 0; j < objects.length; j++) {
          if (i === j) continue;
          const obj2 = objects[j];
          if (obj2.id === sun.id) continue;

          // Calculate vectors
          const sunToObj1 = new THREE.Vector3().subVectors(obj1.position, sun.position).normalize();
          const sunToObj2 = new THREE.Vector3().subVectors(obj2.position, sun.position).normalize();
          const obj1ToObj2 = new THREE.Vector3().subVectors(obj2.position, obj1.position);

          // Check if objects are aligned from Sun's perspective
          const alignmentAngle = sunToObj1.angleTo(sunToObj2) * (180 / Math.PI);
          
          // Object 2 is further from the Sun than Object 1
          const obj1DistToSun = obj1.position.distanceTo(sun.position);
          const obj2DistToSun = obj2.position.distanceTo(sun.position);
          
          if (alignmentAngle < 1.0 && obj2DistToSun > obj1DistToSun) {
            // Calculate apparent sizes from the perspective of the other object
            const obj1ApparentSize = obj1.getDisplayRadius() / obj1ToObj2.length();
            const sunApparentSize = sun.getDisplayRadius() / obj2.position.distanceTo(sun.position);
            
            // Calculate overlap ratio
            const overlapRatio = obj1ApparentSize / sunApparentSize;
            
            if (overlapRatio > this.eventThresholds.eclipse) {
              const eclipseType = overlapRatio >= 0.9 ? 'total' : 'partial';
              this.events.push({
                type: 'eclipse',
                subtype: eclipseType,
                objects: [obj1.name, sun.name, obj2.name],
                coverage: (overlapRatio * 100).toFixed(1),
                time: Date.now(),
                description: `${eclipseType.charAt(0).toUpperCase() + eclipseType.slice(1)} eclipse of ${sun.name} by ${obj1.name} as seen from ${obj2.name} (${(overlapRatio * 100).toFixed(1)}% coverage)`
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error detecting eclipses:', error);
    }
  }

  /**
   * Detect close approaches between celestial objects
   * @param {Array} objects - Array of celestial objects
   */
  detectCloseApproaches(objects) {
    try {
      // For each pair of objects
      for (let i = 0; i < objects.length; i++) {
        const obj1 = objects[i];

        for (let j = i + 1; j < objects.length; j++) {
          const obj2 = objects[j];

          // Calculate distance between objects
          const distance = obj1.position.distanceTo(obj2.position);
          
          // Calculate minimum safe distance (sum of radii plus threshold)
          const minDistance = (obj1.radius + obj2.radius) * (1 + this.eventThresholds.closeApproach);
          
          // Check if distance is below threshold for close approach
          if (distance < minDistance) {
            this.events.push({
              type: 'closeApproach',
              objects: [obj1.name, obj2.name],
              distance: distance.toFixed(0),
              minSafeDistance: minDistance.toFixed(0),
              time: Date.now(),
              description: `${obj1.name} and ${obj2.name} are in a close approach (${distance.toFixed(0)} km, safe distance: ${minDistance.toFixed(0)} km)`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error detecting close approaches:', error);
    }
  }

  /**
   * Get all current events
   * @returns {Array} - Array of current events
   */
  getEvents() {
    return this.events;
  }

  /**
   * Get events of a specific type
   * @param {String} type - Event type
   * @returns {Array} - Array of events of the specified type
   */
  getEventsByType(type) {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Get events involving a specific object
   * @param {String} objectName - Name of the object
   * @returns {Array} - Array of events involving the specified object
   */
  getEventsByObject(objectName) {
    return this.events.filter(event => 
      event.objects.includes(objectName)
    );
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.events = [];
  }
}

module.exports = AstronomicalEventDetector;