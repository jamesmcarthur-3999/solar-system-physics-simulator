// EducationalMenu.js - Provides a menu for accessing educational features

/**
 * Educational menu that provides access to tours and information panels
 * This serves as the main entry point for all educational features
 */
class EducationalMenu {
  /**
   * Creates a new EducationalMenu
   * @param {Object} tourManager - Reference to the TourManager
   * @param {Object} infoPanelManager - Reference to the InformationPanelManager
   * @param {Object} solarSystemApp - Reference to the main application (optional)
   */
  constructor(tourManager, infoPanelManager, solarSystemApp = null) {
    this.tourManager = tourManager;
    this.infoPanelManager = infoPanelManager;
    this.app = solarSystemApp;
    this.isMenuOpen = false;
    this.createUI();
  }
  
  /**
   * Create the UI elements for the menu
   */
  createUI() {
    // Create the menu button
    this.menuButton = document.createElement('button');
    this.menuButton.className = 'educational-menu-button';
    this.menuButton.innerHTML = '?';
    this.menuButton.title = 'Educational Features';
    this.menuButton.addEventListener('click', () => this.toggleMenu());
    document.body.appendChild(this.menuButton);
    
    // Create the menu
    this.menu = document.createElement('div');
    this.menu.className = 'educational-menu';
    document.body.appendChild(this.menu);
    
    // Populate the menu
    this.populateMenu();
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && e.target !== this.menuButton && !this.menu.contains(e.target)) {
        this.closeMenu();
      }
    });
  }
  
  /**
   * Populate the menu with items
   */
  populateMenu() {
    // Guided Tours Section
    const toursSection = document.createElement('div');
    toursSection.className = 'educational-menu-section';
    
    const toursTitle = document.createElement('div');
    toursTitle.className = 'educational-menu-title';
    toursTitle.textContent = 'Guided Tours';
    toursSection.appendChild(toursTitle);
    
    // Add tour options
    const solarSystemTourBtn = document.createElement('button');
    solarSystemTourBtn.className = 'educational-menu-item';
    solarSystemTourBtn.textContent = 'Solar System Basics';
    solarSystemTourBtn.addEventListener('click', () => {
      this.closeMenu();
      this.tourManager.startTour('solar-system-basics');
    });
    toursSection.appendChild(solarSystemTourBtn);
    
    const orbitalMechanicsTourBtn = document.createElement('button');
    orbitalMechanicsTourBtn.className = 'educational-menu-item';
    orbitalMechanicsTourBtn.textContent = 'Orbital Mechanics';
    orbitalMechanicsTourBtn.addEventListener('click', () => {
      this.closeMenu();
      this.tourManager.startTour('orbital-mechanics');
    });
    toursSection.appendChild(orbitalMechanicsTourBtn);
    
    this.menu.appendChild(toursSection);
    
    // Information Panels Section
    const infoSection = document.createElement('div');
    infoSection.className = 'educational-menu-section';
    
    const infoTitle = document.createElement('div');
    infoTitle.className = 'educational-menu-title';
    infoTitle.textContent = 'Information & Concepts';
    infoSection.appendChild(infoTitle);
    
    // Celestial Bodies submenu
    const sunInfoBtn = document.createElement('button');
    sunInfoBtn.className = 'educational-menu-item';
    sunInfoBtn.textContent = 'The Sun';
    sunInfoBtn.addEventListener('click', () => {
      this.closeMenu();
      this.infoPanelManager.showPanel('sun');
    });
    infoSection.appendChild(sunInfoBtn);
    
    const earthInfoBtn = document.createElement('button');
    earthInfoBtn.className = 'educational-menu-item';
    earthInfoBtn.textContent = 'Earth';
    earthInfoBtn.addEventListener('click', () => {
      this.closeMenu();
      this.infoPanelManager.showPanel('earth');
    });
    infoSection.appendChild(earthInfoBtn);
    
    const gravityInfoBtn = document.createElement('button');
    gravityInfoBtn.className = 'educational-menu-item';
    gravityInfoBtn.textContent = 'Gravity';
    gravityInfoBtn.addEventListener('click', () => {
      this.closeMenu();
      this.infoPanelManager.showPanel('gravity');
    });
    infoSection.appendChild(gravityInfoBtn);
    
    const orbitalMechanicsInfoBtn = document.createElement('button');
    orbitalMechanicsInfoBtn.className = 'educational-menu-item';
    orbitalMechanicsInfoBtn.textContent = 'Orbital Mechanics';
    orbitalMechanicsInfoBtn.addEventListener('click', () => {
      this.closeMenu();
      this.infoPanelManager.showPanel('orbital-mechanics');
    });
    infoSection.appendChild(orbitalMechanicsInfoBtn);
    
    const lagrangePointsInfoBtn = document.createElement('button');
    lagrangePointsInfoBtn.className = 'educational-menu-item';
    lagrangePointsInfoBtn.textContent = 'Lagrange Points';
    lagrangePointsInfoBtn.addEventListener('click', () => {
      this.closeMenu();
      if (this.app && this.app.helpSystem) {
        this.app.helpSystem.showTopic('lagrange-points');
      } else {
        this.infoPanelManager.showPanel('lagrange-points');
      }
    });
    infoSection.appendChild(lagrangePointsInfoBtn);
    
    const spaceExplorationInfoBtn = document.createElement('button');
    spaceExplorationInfoBtn.className = 'educational-menu-item';
    spaceExplorationInfoBtn.textContent = 'Space Exploration History';
    spaceExplorationInfoBtn.addEventListener('click', () => {
      this.closeMenu();
      this.infoPanelManager.showPanel('space-exploration');
    });
    infoSection.appendChild(spaceExplorationInfoBtn);
    
    const browseAllBtn = document.createElement('button');
    browseAllBtn.className = 'educational-menu-item';
    browseAllBtn.textContent = 'Browse All Topics...';
    browseAllBtn.addEventListener('click', () => {
      this.closeMenu();
      // Toggle visibility of the information panel selector
      const selector = document.querySelector('.info-panel-selector');
      if (selector) {
        selector.style.display = selector.style.display === 'none' ? 'block' : 'none';
      }
    });
    infoSection.appendChild(browseAllBtn);
    
    this.menu.appendChild(infoSection);
    
    // Visualization Tools Section
    const vizSection = document.createElement('div');
    vizSection.className = 'educational-menu-section';
    
    const vizTitle = document.createElement('div');
    vizTitle.className = 'educational-menu-title';
    vizTitle.textContent = 'Visualization Tools';
    vizSection.appendChild(vizTitle);
    
    // Add visualization options
    const showLagrangePointsBtn = document.createElement('button');
    showLagrangePointsBtn.className = 'educational-menu-item';
    showLagrangePointsBtn.textContent = 'Show Lagrange Points';
    showLagrangePointsBtn.addEventListener('click', () => {
      this.closeMenu();
      if (this.app) {
        // Focus on the Lagrange Points control
        if (this.app.lagrangeSystemSelect) {
          this.app.lagrangeSystemSelect.focus();
          
          // Show help tooltip if no system is selected
          if (this.app.lagrangeSystemSelect.value === '' && this.app.helpSystem) {
            this.app.helpSystem.showTooltip(
              this.app.lagrangeSystemSelect.id || 'lagrangeSystemSelect',
              'Select a system from this dropdown to visualize Lagrange points, then click "Show" to display them.',
              'lagrange-points'
            );
          }
        }
      }
    });
    vizSection.appendChild(showLagrangePointsBtn);
    
    const showGravityFieldBtn = document.createElement('button');
    showGravityFieldBtn.className = 'educational-menu-item';
    showGravityFieldBtn.textContent = 'Gravity Field Visualization';
    showGravityFieldBtn.addEventListener('click', () => {
      this.closeMenu();
      if (this.app && this.app.gravityVisualizer) {
        // Toggle gravity visualization
        this.app.gravityVisualizer.toggleVisibility();
      }
    });
    vizSection.appendChild(showGravityFieldBtn);
    
    this.menu.appendChild(vizSection);
    
    // Help Section
    const helpSection = document.createElement('div');
    helpSection.className = 'educational-menu-section';
    
    const helpTitle = document.createElement('div');
    helpTitle.className = 'educational-menu-title';
    helpTitle.textContent = 'Help';
    helpSection.appendChild(helpTitle);
    
    const helpCenterBtn = document.createElement('button');
    helpCenterBtn.className = 'educational-menu-item';
    helpCenterBtn.textContent = 'Open Help Center';
    helpCenterBtn.addEventListener('click', () => {
      this.closeMenu();
      if (this.app && this.app.helpSystem) {
        this.app.helpSystem.showPanel();
      }
    });
    helpSection.appendChild(helpCenterBtn);
    
    this.menu.appendChild(helpSection);
  }
  
  /**
   * Toggle the menu open/closed
   */
  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
  
  /**
   * Open the menu
   */
  openMenu() {
    this.menu.classList.add('active');
    this.isMenuOpen = true;
  }
  
  /**
   * Close the menu
   */
  closeMenu() {
    this.menu.classList.remove('active');
    this.isMenuOpen = false;
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove event listeners
    this.menuButton.removeEventListener('click', () => {});
    
    const menuItems = this.menu.querySelectorAll('.educational-menu-item');
    menuItems.forEach(item => {
      item.removeEventListener('click', () => {});
    });
    
    document.removeEventListener('click', () => {});
    
    // Remove elements from DOM
    if (this.menuButton && this.menuButton.parentNode) {
      this.menuButton.parentNode.removeChild(this.menuButton);
    }
    
    if (this.menu && this.menu.parentNode) {
      this.menu.parentNode.removeChild(this.menu);
    }
  }
}

module.exports = {
  EducationalMenu
};
