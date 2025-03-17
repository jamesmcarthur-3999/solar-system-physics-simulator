//=== PATCHES ===//
// Add the getDisplayRadius method to all existing celestial objects
// This will run after the app has initialized
window.addEventListener('load', function() {
  console.log("Applying patches...");
  
  // Patch 1: Add getDisplayRadius method to all celestial objects
  setTimeout(() => {
    if (window.solarSystemApp && window.solarSystemApp.objects) {
      console.log("Adding getDisplayRadius to celestial objects...");
      
      window.solarSystemApp.objects.forEach(obj => {
        if (!obj.getDisplayRadius) {
          obj.getDisplayRadius = function() {
            return this.radius || 1;
          };
          console.log(`Added getDisplayRadius to ${obj.name || 'unknown object'}`);
        }
      });
      
      console.log("Patching complete!");
    }
  }, 2000); // Wait 2 seconds for app to initialize
});