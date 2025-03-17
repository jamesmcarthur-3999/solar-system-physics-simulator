// objectHandlers.js - Handlers for celestial object creation/modification
const { createObjectDialog } = require('./dialogs');
const { CelestialObject } = require('../data/celestialObject');
const THREE = require('three');

// AU to km conversion
const AU_TO_KM = 149597870.7;

/**
 * Handles the creation of a new celestial object through the UI
 * @param {Object} sceneManager - The scene manager instance
 * @param {Object} gravitySimulator - The gravity simulator instance
 */
function handleAddObject(sceneManager, gravitySimulator) {
  return new Promise((resolve, reject) => {
    try {
      createObjectDialog(
        // onSubmit
        (data) => {
          // Convert data values to appropriate units for the simulation
          // Position from AU to km
          const position = new THREE.Vector3(
            data.position.x * AU_TO_KM,
            data.position.y * AU_TO_KM,
            data.position.z * AU_TO_KM
          );
          
          // Create a new celestial object from the form data
          const newObject = new CelestialObject({
            id: crypto.randomUUID(),
            name: data.name,
            type: data.type,
            mass: data.mass,
            radius: data.radius,
            position,
            velocity: data.velocity,
            color: data.color,
            rotationPeriod: data.rotationPeriod,
            axialTilt: data.axialTilt,
            temperature: data.temperature,
            hasAtmosphere: data.hasAtmosphere
          });
          
          // Add to the scene and physics simulation
          sceneManager.addObject(newObject);
          gravitySimulator.addBody(newObject);
          
          // Update counters
          updateObjectCounter(document.getElementById('body-count'), sceneManager.getObjectCount());
          
          resolve(newObject);
        },
        // onCancel
        () => {
          console.log('Object creation canceled');
          resolve(null);
        }
      );
    } catch (error) {
      console.error('Error creating object:', error);
      reject(error);
    }
  });
}

/**
 * Updates the object counter in the UI
 * @param {HTMLElement} counterElement - The element to update
 * @param {number} count - The number of objects
 */
function updateObjectCounter(counterElement, count) {
  if (counterElement) {
    counterElement.textContent = `Bodies: ${count}`;
  }
}

/**
 * Sets up event listeners for object-related actions
 * @param {HTMLElement} addObjectButton - The add object button
 * @param {Object} sceneManager - The scene manager instance
 * @param {Object} gravitySimulator - The gravity simulator instance
 */
function setupObjectListeners(addObjectButton, sceneManager, gravitySimulator) {
  if (addObjectButton) {
    addObjectButton.addEventListener('click', () => {
      handleAddObject(sceneManager, gravitySimulator)
        .then(newObject => {
          if (newObject) {
            console.log(`Added new celestial object: ${newObject.name}`);
          }
        })
        .catch(error => {
          console.error('Failed to add object:', error);
        });
    });
  }
}

module.exports = {
  handleAddObject,
  setupObjectListeners,
  updateObjectCounter
};
