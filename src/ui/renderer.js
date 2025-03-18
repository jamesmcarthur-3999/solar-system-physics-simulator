// Solar System Simulator - Main Renderer

// Add fallback rendering options
if (window.THREE) {
  window.USE_SOFTWARE_RENDERING = true;
  console.log("Enabling software rendering fallbacks");
}

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM content loaded, starting initialization...");
  initializeSolarSystemSimulator();
});

/**
 * Main initialization function for the Solar System Simulator
 */
async function initializeSolarSystemSimulator() {
  try {
    // Access APIs exposed from preload with safety checks
    const THREE = window.THREE || {};
    const OrbitControls = window.OrbitControls;
    
    // Check if THREE is properly loaded
    if (!THREE || typeof THREE.Scene !== 'function') {
      console.error('THREE.js not properly loaded. Scene constructor not available.');
      displayErrorMessage('THREE.js library not properly loaded. Please check console for details.');
      return;
    }
    
    console.log("THREE.js is loaded and available");
    
    // Initialize constants first to ensure they're available
    await loadConstants();
    
    // Then load all required modules
    await loadModules();
    
    // Create the application
    try {
      window.solarSystemApp = new SolarSystemApp();
      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Failed to initialize SolarSystemApp:", error);
      displayErrorMessage(`Error initializing application: ${error.message}`);
      throw error;
    }
  } catch (error) {
    console.error('Error initializing application:', error);
    displayErrorMessage(`Critical error: ${error.message}`);
  }
}

/**
 * Display an error message to the user
 * @param {string} message - Error message to display
 */
function displayErrorMessage(message) {
  // Remove any existing error messages
  const existingErrors = document.querySelectorAll('.error-message');
  existingErrors.forEach(el => el.remove());
  
  // Create new error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <h2>Error Loading Application</h2>
    <p>${message}</p>
    <p>Please check the console for more details.</p>
  `;
  document.body.appendChild(errorDiv);
}

// Continue with the rest of the renderer.js file as it was...
// (I'm truncating this for brevity, but the changes are at the beginning of the file)
