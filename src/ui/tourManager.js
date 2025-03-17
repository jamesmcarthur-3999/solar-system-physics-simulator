// TourManager.js - Handles guided tours of the solar system
const THREE = require('three');

/**
 * Manages guided tours for educational purposes
 * Allows creation of step-by-step tours explaining solar system concepts
 */
class TourManager {
  /**
   * Creates a new TourManager
   * @param {Object} solarSystemApp - Reference to the main application
   */
  constructor(solarSystemApp) {
    this.app = solarSystemApp;
    this.tours = [];
    this.currentTour = null;
    this.currentStep = 0;
    
    // Create UI elements
    this.createUI();
  }
  
  /**
   * Add a new tour
   * @param {Object} tour - Tour configuration object
   */
  addTour(tour) {
    this.tours.push(tour);
  }
  
  /**
   * Start a specific tour
   * @param {String} tourId - ID of the tour to start
   */
  startTour(tourId) {
    this.currentTour = this.tours.find(t => t.id === tourId);
    this.currentStep = 0;
    
    if (this.currentTour) {
      this.showTourPanel();
      this.showTourStep(this.currentStep);
    }
  }
  
  /**
   * Show the tour panel
   */
  showTourPanel() {
    if (this.tourPanel) {
      this.tourPanel.style.display = 'block';
    }
  }
  
  /**
   * Hide the tour panel
   */
  hideTourPanel() {
    if (this.tourPanel) {
      this.tourPanel.style.display = 'none';
    }
  }
  
  /**
   * Show a specific tour step
   * @param {Number} stepIndex - Index of the step to show
   */
  showTourStep(stepIndex) {
    if (!this.currentTour || !this.currentTour.steps[stepIndex]) {
      return;
    }
    
    const step = this.currentTour.steps[stepIndex];
    
    // Update UI
    this.tourTitle.textContent = this.currentTour.title;
    this.stepTitle.textContent = `Step ${stepIndex + 1}: ${step.title || ''}`;
    this.stepContent.innerHTML = step.content;
    
    // Perform actions for this step
    if (step.cameraPosition) {
      this.app.setCameraPosition(step.cameraPosition);
    }
    
    if (step.focusObject) {
      this.app.focusOnObject(step.focusObject);
    }
    
    if (step.timeScale !== undefined) {
      this.app.setTimeScale(step.timeScale);
    }
    
    if (step.highlightObject) {
      this.highlightObject(step.highlightObject);
    }
    
    // Update navigation buttons
    this.prevButton.disabled = stepIndex === 0;
    this.nextButton.disabled = stepIndex === this.currentTour.steps.length - 1;
  }
  
  /**
   * Highlight a specific object in the solar system
   * @param {String} objectId - ID of the object to highlight
   */
  highlightObject(objectId) {
    // Reset any previous highlights
    this.resetHighlights();
    
    // Find the object
    const object = this.app.objects.find(obj => obj.id === objectId);
    if (object && object.mesh) {
      // Store original material
      object.originalMaterial = object.mesh.material;
      
      // Create highlight material
      const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      
      // Add highlight mesh
      const highlightGeometry = new THREE.SphereGeometry(
        object.getDisplayRadius() * 1.05, 
        32, 
        32
      );
      this.highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
      this.highlightMesh.position.copy(object.position);
      
      // Add to scene
      this.app.scene.add(this.highlightMesh);
      
      // Store reference to highlighted object
      this.highlightedObject = object;
    }
  }
  
  /**
   * Reset all highlights
   */
  resetHighlights() {
    if (this.highlightMesh) {
      this.app.scene.remove(this.highlightMesh);
      this.highlightMesh.geometry.dispose();
      this.highlightMesh.material.dispose();
      this.highlightMesh = null;
    }
    
    if (this.highlightedObject && this.highlightedObject.originalMaterial) {
      this.highlightedObject.mesh.material = this.highlightedObject.originalMaterial;
      delete this.highlightedObject.originalMaterial;
      this.highlightedObject = null;
    }
  }
  
  /**
   * Create the UI elements for the tour
   */
  createUI() {
    // Create tour panel
    this.tourPanel = document.createElement('div');
    this.tourPanel.className = 'tour-panel';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'tour-header';
    
    this.tourTitle = document.createElement('h3');
    this.tourTitle.textContent = 'Solar System Tour';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'tour-close-button';
    closeButton.addEventListener('click', () => this.endTour());
    
    header.appendChild(this.tourTitle);
    header.appendChild(closeButton);
    
    // Create title for current step
    this.stepTitle = document.createElement('h4');
    this.stepTitle.className = 'tour-step-title';
    
    // Create content area
    this.stepContent = document.createElement('div');
    this.stepContent.className = 'tour-content';
    
    // Create navigation
    const navigation = document.createElement('div');
    navigation.className = 'tour-navigation';
    
    this.prevButton = document.createElement('button');
    this.prevButton.textContent = 'Previous';
    this.prevButton.className = 'tour-nav-button';
    this.prevButton.addEventListener('click', () => {
      this.currentStep--;
      this.showTourStep(this.currentStep);
    });
    
    this.nextButton = document.createElement('button');
    this.nextButton.textContent = 'Next';
    this.nextButton.className = 'tour-nav-button';
    this.nextButton.addEventListener('click', () => {
      this.currentStep++;
      this.showTourStep(this.currentStep);
    });
    
    navigation.appendChild(this.prevButton);
    navigation.appendChild(this.nextButton);
    
    // Assemble panel
    this.tourPanel.appendChild(header);
    this.tourPanel.appendChild(this.stepTitle);
    this.tourPanel.appendChild(this.stepContent);
    this.tourPanel.appendChild(navigation);
    
    // Add to document
    document.body.appendChild(this.tourPanel);
    
    // Initially hide the panel
    this.tourPanel.style.display = 'none';
  }
  
  /**
   * End the current tour
   */
  endTour() {
    this.resetHighlights();
    this.currentTour = null;
    this.hideTourPanel();
  }
  
  /**
   * Create default solar system tours
   */
  createDefaultTours() {
    const solarSystemTour = {
      id: 'solar-system-basics',
      title: 'Solar System Basics',
      steps: [
        {
          title: 'Welcome to the Solar System',
          content: `
            <p>Welcome to our guided tour of the Solar System! This tour will introduce you to the
            main celestial bodies in our solar system and explain key astronomical concepts.</p>
            <p>Use the Next and Previous buttons to navigate through the tour.</p>
          `,
          cameraPosition: { x: 0, y: 50, z: 50 },
          timeScale: 0
        },
        {
          title: 'The Sun: Our Star',
          content: `
            <p>At the center of our solar system is the Sun — a massive, hot ball of gas that provides
            light, heat, and energy to Earth and the other planets.</p>
            <p>The Sun contains 99.8% of the total mass in the solar system and exerts a strong 
            gravitational pull on everything around it.</p>
            <p>The Sun's gravity is what keeps all the planets in their orbits.</p>
          `,
          focusObject: 'sun',
          timeScale: 0
        },
        {
          title: 'The Inner Rocky Planets',
          content: `
            <p>The four planets closest to the Sun are called the "inner" or "terrestrial" planets: 
            Mercury, Venus, Earth, and Mars.</p>
            <p>These planets are relatively small and made primarily of rock and metal.</p>
            <p>Notice how close they are to each other compared to the outer planets.</p>
          `,
          cameraPosition: { x: 0, y: 30, z: 30 },
          timeScale: 5
        },
        {
          title: 'Earth: Our Home Planet',
          content: `
            <p>Earth is the third planet from the Sun and the only known world to support life.</p>
            <p>Earth's moderate temperatures, presence of water, and protective atmosphere make it uniquely 
            suitable for life as we know it.</p>
            <p>The blue appearance comes from the vast oceans that cover about 71% of Earth's surface.</p>
          `,
          focusObject: 'earth',
          timeScale: 0.5,
          highlightObject: 'earth'
        },
        {
          title: 'The Gas Giants',
          content: `
            <p>Beyond the asteroid belt lie the "gas giants" — Jupiter and Saturn — which are 
            much larger than the inner planets and composed primarily of hydrogen and helium.</p>
            <p>These enormous planets have strong gravitational fields and numerous moons.</p>
          `,
          cameraPosition: { x: 0, y: 50, z: 120 },
          timeScale: 5
        },
        {
          title: 'Jupiter: The Largest Planet',
          content: `
            <p>Jupiter is the largest planet in our solar system, with a mass more than 
            twice that of all other planets combined.</p>
            <p>It has a strong magnetic field and at least 79 moons, including the four 
            large Galilean moons: Io, Europa, Ganymede, and Callisto.</p>
            <p>The distinctive striped appearance comes from its turbulent atmosphere 
            with powerful storms, including the Great Red Spot.</p>
          `,
          focusObject: 'jupiter',
          timeScale: 1,
          highlightObject: 'jupiter'
        },
        {
          title: 'The Ice Giants',
          content: `
            <p>Uranus and Neptune are known as the "ice giants" because they contain more 
            "icy" materials like water, ammonia, and methane in addition to hydrogen and helium.</p>
            <p>Their blue-green colors come from methane in their atmospheres, which absorbs 
            red light and reflects blue light.</p>
          `,
          cameraPosition: { x: 0, y: 50, z: 200 },
          timeScale: 5
        },
        {
          title: 'Planetary Motion',
          content: `
            <p>All planets orbit the Sun in elliptical (oval-shaped) paths, with the Sun at one focus of the ellipse.</p>
            <p>Planets closer to the Sun orbit faster than those farther away, following Kepler's laws of planetary motion.</p>
            <p>Notice how the inner planets complete their orbits much more quickly than the outer planets.</p>
          `,
          cameraPosition: { x: 0, y: 100, z: 0 },
          timeScale: 20
        },
        {
          title: 'End of Tour',
          content: `
            <p>This concludes our basic tour of the solar system. You've learned about:</p>
            <ul>
              <li>The Sun as the center of our solar system</li>
              <li>The inner rocky planets</li>
              <li>The gas giants</li>
              <li>The ice giants</li>
              <li>How planets move around the Sun</li>
            </ul>
            <p>You can now explore the simulation on your own or try another guided tour!</p>
          `,
          cameraPosition: { x: 30, y: 30, z: 30 },
          timeScale: 5
        }
      ]
    };
    
    this.addTour(solarSystemTour);
    
    // Add other default tours as needed
    const orbitalMechanicsTour = {
      id: 'orbital-mechanics',
      title: 'Orbital Mechanics',
      steps: [
        {
          title: 'Introduction to Orbits',
          content: `
            <p>This tour will explain the fundamental principles of orbital mechanics - how and why 
            celestial bodies move the way they do.</p>
            <p>We'll explore concepts like gravitational attraction, orbital velocity, and Kepler's laws.</p>
          `,
          cameraPosition: { x: 0, y: 50, z: 50 },
          timeScale: 0
        },
        {
          title: 'Gravity: The Binding Force',
          content: `
            <p>Gravity is the force that keeps planets in orbit around the Sun and moons around planets.</p>
            <p>According to Newton's law of universal gravitation, every mass attracts every other mass with a 
            force proportional to the product of their masses and inversely proportional to the square of the 
            distance between them.</p>
            <p>F = G(m₁m₂)/r²</p>
          `,
          focusObject: 'sun',
          timeScale: 0
        },
        {
          title: 'Elliptical Orbits',
          content: `
            <p>Planets don't orbit in perfect circles but in ellipses, with the Sun at one focus of the ellipse.</p>
            <p>This is Kepler's First Law of Planetary Motion.</p>
            <p>The degree of elongation of an orbit is described by its eccentricity. A perfect circle has an 
            eccentricity of 0. Mercury has the most eccentric orbit of the planets with an eccentricity of 0.21.</p>
          `,
          focusObject: 'mercury',
          timeScale: 10
        },
        // Additional steps would follow
      ]
    };
    
    this.addTour(orbitalMechanicsTour);
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove event listeners
    if (this.prevButton) {
      this.prevButton.removeEventListener('click', () => {});
    }
    
    if (this.nextButton) {
      this.nextButton.removeEventListener('click', () => {});
    }
    
    const closeButton = this.tourPanel?.querySelector('.tour-close-button');
    if (closeButton) {
      closeButton.removeEventListener('click', () => {});
    }
    
    // Reset highlights
    this.resetHighlights();
    
    // Remove panel from DOM
    if (this.tourPanel && this.tourPanel.parentNode) {
      this.tourPanel.parentNode.removeChild(this.tourPanel);
    }
  }
}

module.exports = {
  TourManager
};
