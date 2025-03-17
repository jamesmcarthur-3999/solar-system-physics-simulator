// infoPanel.js - Handles the display of information about celestial objects
const THREE = require('three');

// Units conversion constants
const AU_TO_KM = 149597870.7;
const KELVIN_TO_CELSIUS = (k) => k - 273.15;

/**
 * Manages the display of information panels for celestial objects
 */
class InfoPanelManager {
  /**
   * Creates a new InfoPanelManager
   * @param {HTMLElement} panelElement - The info panel DOM element
   * @param {HTMLElement} objectNameElement - The element to display the object's name
   * @param {HTMLElement} objectPropertiesElement - The element to display object properties
   */
  constructor(panelElement, objectNameElement, objectPropertiesElement) {
    this.panel = panelElement;
    this.nameElement = objectNameElement;
    this.propertiesElement = objectPropertiesElement;
    
    this.selectedObject = null;
    this.isVisible = false;
    
    // Initialize panel
    this._initializePanel();
  }
  
  /**
   * Shows the info panel for a specific celestial object
   * @param {Object} celestialObject - The object to display info for
   */
  showObjectInfo(celestialObject) {
    if (!celestialObject) {
      this.hide();
      return;
    }
    
    try {
      this.selectedObject = celestialObject;
      
      // Update object name
      this.nameElement.textContent = celestialObject.name;
      
      // Update object properties
      this._updateObjectProperties(celestialObject);
      
      // Show the panel if not already visible
      if (!this.isVisible) {
        this.show();
      }
    } catch (error) {
      console.error('Error showing object info:', error);
    }
  }
  
  /**
   * Updates the information displayed for the currently selected object
   */
  updateSelectedObjectInfo() {
    if (this.selectedObject) {
      this._updateObjectProperties(this.selectedObject);
    }
  }
  
  /**
   * Shows the info panel
   */
  show() {
    this.panel.classList.remove('hidden');
    this.isVisible = true;
  }
  
  /**
   * Hides the info panel
   */
  hide() {
    this.panel.classList.add('hidden');
    this.isVisible = false;
    this.selectedObject = null;
  }
  
  /**
   * Toggles the visibility of the info panel
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
    
    return this.isVisible;
  }
  
  /**
   * Initializes the panel structure
   * @private
   */
  _initializePanel() {
    // Clear any existing content
    this.propertiesElement.innerHTML = '';
    
    // Add default message when no object is selected
    this.nameElement.textContent = 'Select an object';
    this.propertiesElement.innerHTML = '<p class="info-message">Click on a celestial object to view its details.</p>';
  }
  
  /**
   * Updates the properties displayed for a celestial object
   * @param {Object} celestialObject - The object to update properties for
   * @private
   */
  _updateObjectProperties(celestialObject) {
    // Clear properties element
    this.propertiesElement.innerHTML = '';
    
    // Create sections
    const basicSection = this._createSection('Basic Properties');
    const positionSection = this._createSection('Position & Velocity');
    const advancedSection = this._createSection('Advanced Properties');
    
    // Basic properties
    this._addProperty(basicSection, 'Type', this._formatObjectType(celestialObject.type));
    this._addProperty(basicSection, 'Mass', this._formatMass(celestialObject.mass));
    this._addProperty(basicSection, 'Radius', this._formatDistance(celestialObject.radius, 'km'));
    
    // Position and velocity
    const distanceFromSun = this._calculateDistanceFromSun(celestialObject);
    this._addProperty(positionSection, 'Distance from Sun', this._formatDistance(distanceFromSun));
    
    const velocity = celestialObject.velocity ? new THREE.Vector3().copy(celestialObject.velocity) : null;
    if (velocity) {
      const speed = velocity.length();
      this._addProperty(positionSection, 'Speed', this._formatVelocity(speed));
    }
    
    // Advanced properties
    if (celestialObject.rotationPeriod) {
      this._addProperty(advancedSection, 'Rotation Period', this._formatTime(celestialObject.rotationPeriod));
    }
    
    if (celestialObject.axialTilt !== undefined) {
      this._addProperty(advancedSection, 'Axial Tilt', `${celestialObject.axialTilt.toFixed(1)}°`);
    }
    
    if (celestialObject.temperature !== undefined) {
      const tempK = celestialObject.temperature;
      const tempC = KELVIN_TO_CELSIUS(tempK);
      this._addProperty(advancedSection, 'Surface Temperature', `${tempK.toFixed(1)} K (${tempC.toFixed(1)} °C)`);
    }
    
    if (celestialObject.hasAtmosphere !== undefined) {
      this._addProperty(advancedSection, 'Atmosphere', celestialObject.hasAtmosphere ? 'Yes' : 'No');
    }
    
    // Habitability indicator (basic algorithm)
    if (celestialObject.type === 'planet') {
      const habitability = this._calculateHabitability(celestialObject);
      this._addHabitabilityIndicator(advancedSection, habitability);
    }
    
    // Append sections to properties element
    this.propertiesElement.appendChild(basicSection);
    this.propertiesElement.appendChild(positionSection);
    
    // Only add advanced section if it has children beyond the header
    if (advancedSection.childElementCount > 1) {
      this.propertiesElement.appendChild(advancedSection);
    }
  }
  
  /**
   * Creates a section element for grouping related properties
   * @param {string} title - Section title
   * @returns {HTMLElement} The created section element
   * @private
   */
  _createSection(title) {
    const section = document.createElement('div');
    section.className = 'info-section';
    
    const header = document.createElement('h3');
    header.textContent = title;
    section.appendChild(header);
    
    return section;
  }
  
  /**
   * Adds a property row to a section
   * @param {HTMLElement} section - The section to add to
   * @param {string} name - Property name
   * @param {string} value - Property value
   * @private
   */
  _addProperty(section, name, value) {
    const row = document.createElement('div');
    row.className = 'info-row';
    
    const nameEl = document.createElement('span');
    nameEl.className = 'property-name';
    nameEl.textContent = name;
    
    const valueEl = document.createElement('span');
    valueEl.className = 'property-value';
    valueEl.textContent = value;
    
    row.appendChild(nameEl);
    row.appendChild(valueEl);
    section.appendChild(row);
  }
  
  /**
   * Adds a habitability indicator to a section
   * @param {HTMLElement} section - The section to add to
   * @param {Object} habitability - Habitability data
   * @private
   */
  _addHabitabilityIndicator(section, habitability) {
    const row = document.createElement('div');
    row.className = 'info-row';
    
    const nameEl = document.createElement('span');
    nameEl.className = 'property-name';
    nameEl.textContent = 'Habitability';
    
    const valueEl = document.createElement('div');
    valueEl.className = 'habitability-indicator';
    
    // Create indicator bar
    const bar = document.createElement('div');
    bar.className = 'habitability-bar';
    
    const indicator = document.createElement('div');
    indicator.className = 'habitability-fill';
    indicator.style.width = `${habitability.score}%`;
    
    // Set color based on habitability score
    if (habitability.score < 25) {
      indicator.style.backgroundColor = '#ff4444';
    } else if (habitability.score < 50) {
      indicator.style.backgroundColor = '#ffaa44';
    } else if (habitability.score < 75) {
      indicator.style.backgroundColor = '#ffff44';
    } else {
      indicator.style.backgroundColor = '#44ff44';
    }
    
    bar.appendChild(indicator);
    valueEl.appendChild(bar);
    
    // Add description
    const description = document.createElement('span');
    description.className = 'habitability-description';
    description.textContent = habitability.description;
    valueEl.appendChild(description);
    
    row.appendChild(nameEl);
    row.appendChild(valueEl);
    section.appendChild(row);
  }
  
  /**
   * Calculates the distance from the object to the Sun (or origin)
   * @param {Object} celestialObject - The object to calculate distance for
   * @returns {number} Distance in km
   * @private
   */
  _calculateDistanceFromSun(celestialObject) {
    if (!celestialObject.position) return 0;
    
    // Calculate distance from origin (assumed to be the Sun's position)
    const distance = celestialObject.position.length();
    return distance;
  }
  
  /**
   * Formats a mass value with appropriate units
   * @param {number} mass - Mass in kg
   * @returns {string} Formatted mass string
   * @private
   */
  _formatMass(mass) {
    if (mass >= 1e27) {
      return `${(mass / 1e27).toFixed(2)} × 10²⁷ kg`;
    } else if (mass >= 1e24) {
      return `${(mass / 1e24).toFixed(2)} × 10²⁴ kg`;
    } else if (mass >= 1e21) {
      return `${(mass / 1e21).toFixed(2)} × 10²¹ kg`;
    } else if (mass >= 1e18) {
      return `${(mass / 1e18).toFixed(2)} × 10¹⁸ kg`;
    } else {
      return `${mass.toExponential(2)} kg`;
    }
  }
  
  /**
   * Formats a distance value with appropriate units
   * @param {number} distance - Distance in km
   * @param {string} unit - Optional unit override
   * @returns {string} Formatted distance string
   * @private
   */
  _formatDistance(distance, unit = null) {
    if (unit === 'km' || distance < AU_TO_KM) {
      return `${distance.toLocaleString()} km`;
    } else {
      // Convert to AU
      const distanceAU = distance / AU_TO_KM;
      return `${distanceAU.toFixed(3)} AU`;
    }
  }
  
  /**
   * Formats a velocity value
   * @param {number} velocity - Velocity in km/s
   * @returns {string} Formatted velocity string
   * @private
   */
  _formatVelocity(velocity) {
    return `${velocity.toFixed(2)} km/s`;
  }
  
  /**
   * Formats a time value with appropriate units
   * @param {number} hours - Time in hours
   * @returns {string} Formatted time string
   * @private
   */
  _formatTime(hours) {
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    } else {
      const days = hours / 24;
      return `${days.toFixed(1)} days`;
    }
  }
  
  /**
   * Formats an object type for display
   * @param {string} type - The object type
   * @returns {string} Formatted type string
   * @private
   */
  _formatObjectType(type) {
    if (!type) return 'Unknown';
    
    // Capitalize first letter
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
  
  /**
   * Calculates a habitability score for a celestial object
   * @param {Object} celestialObject - The object to calculate habitability for
   * @returns {Object} Habitability data with score and description
   * @private
   */
  _calculateHabitability(celestialObject) {
    // Simple habitability model based on Earth-like conditions
    let score = 0;
    let description = 'Uninhabitable';
    
    // Temperature factor (Earth ~288K)
    if (celestialObject.temperature) {
      const tempK = celestialObject.temperature;
      // Higher score closer to Earth's temperature
      const tempFactor = Math.max(0, 100 - Math.abs(tempK - 288) / 2);
      score += tempFactor * 0.4; // 40% weight
    }
    
    // Atmosphere factor
    if (celestialObject.hasAtmosphere) {
      score += 30; // 30% weight
    }
    
    // Size factor (Earth-like size)
    if (celestialObject.radius) {
      // Earth radius in km
      const earthRadius = 6371;
      const sizeFactor = Math.max(0, 100 - Math.abs(celestialObject.radius - earthRadius) / 100);
      score += sizeFactor * 0.2; // 20% weight
    }
    
    // Distance factor (Earth at 1 AU)
    const distanceAU = this._calculateDistanceFromSun(celestialObject) / AU_TO_KM;
    if (distanceAU > 0) {
      // Higher score closer to 1 AU (Earth's distance)
      const distanceFactor = Math.max(0, 100 - Math.abs(distanceAU - 1) * 50);
      score += distanceFactor * 0.1; // 10% weight
    }
    
    // Set description based on score
    if (score >= 80) {
      description = 'Excellent habitability potential';
    } else if (score >= 60) {
      description = 'Good habitability potential';
    } else if (score >= 40) {
      description = 'Moderate habitability potential';
    } else if (score >= 20) {
      description = 'Poor habitability potential';
    } else {
      description = 'Uninhabitable';
    }
    
    return {
      score,
      description
    };
  }
}

module.exports = {
  InfoPanelManager
};
