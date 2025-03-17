// educationalFeatures.js - Integration point for all educational components
const { TourManager } = require('./tourManager');
const { InformationPanelManager } = require('./informationPanelManager');
const { EducationalMenu } = require('./educationalMenu');

/**
 * Manages all educational features in the application
 * Acts as the integration point between the main app and educational components
 */
class EducationalFeatures {
  /**
   * Creates a new EducationalFeatures manager
   * @param {Object} solarSystemApp - Reference to the main application
   */
  constructor(solarSystemApp) {
    this.app = solarSystemApp;
    
    // Create components
    this.tourManager = new TourManager(solarSystemApp);
    this.infoPanelManager = new InformationPanelManager();
    this.educationalMenu = new EducationalMenu(this.tourManager, this.infoPanelManager);
    
    // Create default content
    this.createDefaultContent();
  }
  
  /**
   * Create default educational content
   */
  createDefaultContent() {
    // Create default tours
    this.tourManager.createDefaultTours();
    
    // Create default information panels
    this.infoPanelManager.createDefaultPanels();
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Dispose of components
    if (this.tourManager) {
      this.tourManager.dispose();
    }
    
    if (this.infoPanelManager) {
      this.infoPanelManager.dispose();
    }
    
    if (this.educationalMenu) {
      this.educationalMenu.dispose();
    }
  }
}

module.exports = {
  EducationalFeatures
};
