// This is a partial update to the InfoPanel class to add orbit prediction controls

class InfoPanel {
  constructor(container, orbitPredictionVisualizer) {
    // Store the orbit prediction visualizer
    this.orbitPredictionVisualizer = orbitPredictionVisualizer;
    
    // ... existing constructor code ...
  }

  showObjectInfo(object, allObjects) {
    try {
      // ... existing code ...
      
      // Add a Show/Hide Orbit Prediction button
      const orbitPredictionButton = document.createElement('button');
      orbitPredictionButton.className = 'orbit-prediction-button';
      
      // Set button text based on whether prediction is active
      const hasPrediction = this.orbitPredictionVisualizer.hasOrbitPrediction(object.id);
      orbitPredictionButton.textContent = hasPrediction ? 'Hide Orbit Prediction' : 'Show Orbit Prediction';
      
      // Add click handler for the button
      orbitPredictionButton.addEventListener('click', () => {
        const isActive = this.orbitPredictionVisualizer.toggleOrbitPrediction(allObjects, object.id);
        orbitPredictionButton.textContent = isActive ? 'Hide Orbit Prediction' : 'Show Orbit Prediction';
      });
      
      // Add the button to the panel
      this.container.querySelector('#object-properties').appendChild(orbitPredictionButton);
      
      // ... rest of existing code ...
    } catch (error) {
      console.error('Error showing object info:', error);
    }
  }
}

// Add this code to your SolarSystemApp class

class SolarSystemApp {
  constructor() {
    // ... existing code ...
    
    // Initialize orbit prediction visualizer
    this.orbitPredictionVisualizer = new OrbitPredictionVisualizer(this.scene);
    
    // Pass the visualizer to the info panel
    this.infoPanel = new InfoPanel(document.getElementById('info-panel'), this.orbitPredictionVisualizer);
    
    // ... rest of constructor ...
  }
  
  // In your update method, add:
  update() {
    // ... existing code ...
    
    // If time is passing (not paused), update all active orbit predictions periodically
    if (!this.paused && this.frameCount % 600 === 0) { // Update every 600 frames (about 10 seconds at 60fps)
      this.orbitPredictionVisualizer.updateAllPredictions(this.objects);
    }
    
    // ... rest of method ...
  }
  
  // In your dispose method, add:
  dispose() {
    // ... existing code ...
    
    // Clean up orbit prediction visualizer
    if (this.orbitPredictionVisualizer) {
      this.orbitPredictionVisualizer.dispose();
    }
    
    // ... rest of method ...
  }
}