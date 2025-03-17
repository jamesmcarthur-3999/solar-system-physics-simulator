/**
 * Save and Load functionality for the Solar System Simulator
 */

// Function to serialize the solar system for saving
function serializeSolarSystem(solarSystemApp) {
  try {
    const saveData = {
      objects: [],
      settings: {
        timeScale: solarSystemApp.timeScale,
        paused: solarSystemApp.paused
      }
    };

    // Collect object data
    solarSystemApp.objects.forEach(obj => {
      saveData.objects.push({
        id: obj.id,
        name: obj.name,
        type: obj.isStar ? 'star' : 'planet',
        mass: obj.mass,
        radius: obj.radius,
        position: {
          x: obj.position.x,
          y: obj.position.y,
          z: obj.position.z
        },
        velocity: {
          x: obj.velocity.x,
          y: obj.velocity.y,
          z: obj.velocity.z
        },
        color: obj.color,
        texture: obj.texturePath,
        isStar: obj.isStar
      });
    });

    return saveData;
  } catch (error) {
    console.error('Error serializing solar system:', error);
    throw new Error('Failed to prepare solar system data for saving');
  }
}

// Function to save the current solar system state
function saveSolarSystem(solarSystemApp) {
  try {
    // Prepare data to save
    const saveData = serializeSolarSystem(solarSystemApp);
    
    // Use IPC to send data to main process for saving
    window.api.send('save-system', saveData);
    
    // Show message
    showNotification('Saving solar system configuration...');
  } catch (error) {
    console.error('Error saving solar system:', error);
    showNotification('Failed to save solar system configuration', 'error');
  }
}

// Function to load a saved solar system
function loadSolarSystem(solarSystemApp) {
  try {
    // Use IPC to request load operation from main process
    window.api.send('load-system');
    
    // Show message
    showNotification('Loading solar system configuration...');
  } catch (error) {
    console.error('Error requesting solar system load:', error);
    showNotification('Failed to load solar system configuration', 'error');
  }
}

// Function to deserialize and apply loaded solar system data
function deserializeSolarSystem(solarSystemApp, data) {
  try {
    // Clear existing objects
    while (solarSystemApp.objects.length > 0) {
      const obj = solarSystemApp.objects[0];
      solarSystemApp.removeObject(obj.id);
    }
    
    // Apply settings
    if (data.settings) {
      if (data.settings.timeScale !== undefined) {
        solarSystemApp.setTimeScale(data.settings.timeScale);
      }
      
      if (data.settings.paused !== undefined) {
        solarSystemApp.setPaused(data.settings.paused);
      }
    }
    
    // Add loaded objects
    if (data.objects && Array.isArray(data.objects)) {
      const CelestialObject = require('../data/celestialObject.js');
      
      data.objects.forEach(objData => {
        try {
          // Create new celestial object
          const newObject = new CelestialObject({
            id: objData.id,
            name: objData.name,
            mass: objData.mass,
            radius: objData.radius,
            position: [objData.position.x, objData.position.y, objData.position.z],
            velocity: [objData.velocity.x, objData.velocity.y, objData.velocity.z],
            color: objData.color,
            texture: objData.texture,
            isStar: objData.isStar
          });
          
          // Add to solar system
          solarSystemApp.addObject(newObject);
        } catch (objError) {
          console.error(`Error creating object ${objData.name}:`, objError);
        }
      });
    }
    
    showNotification('Solar system configuration loaded successfully');
  } catch (error) {
    console.error('Error deserializing solar system:', error);
    showNotification('Failed to apply loaded solar system configuration', 'error');
  }
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
  // Simple implementation - can be replaced with a more sophisticated UI
  const notificationEl = document.getElementById('notification');
  if (notificationEl) {
    notificationEl.textContent = message;
    notificationEl.className = `notification ${type}`;
    notificationEl.style.display = 'block';
    
    // Hide after a few seconds
    setTimeout(() => {
      notificationEl.style.display = 'none';
    }, 3000);
  } else {
    console.log(`Notification (${type}): ${message}`);
  }
}

// Setup event listeners for IPC responses
function setupSaveLoadListeners(solarSystemApp) {
  // Listen for save completion
  window.api.receive('system-saved', (data) => {
    if (data.success) {
      showNotification(`Solar system saved to ${data.filePath}`);
    } else {
      showNotification('Failed to save solar system', 'error');
    }
  });
  
  // Listen for load completion
  window.api.receive('system-loaded', (data) => {
    if (data.success && data.data) {
      deserializeSolarSystem(solarSystemApp, data.data);
    }
  });
  
  // Listen for errors
  window.api.receive('error', (data) => {
    showNotification(data.message, 'error');
  });
}

module.exports = {
  saveSolarSystem,
  loadSolarSystem,
  setupSaveLoadListeners
};