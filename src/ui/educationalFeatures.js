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
    this.educationalMenu = new EducationalMenu(this.tourManager, this.infoPanelManager, solarSystemApp);
    
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
    
    // Add Lagrange Points information panel if it doesn't exist yet
    if (!this.infoPanelManager.hasPanel('lagrange-points')) {
      this.infoPanelManager.addPanel(
        'lagrange-points',
        'Lagrange Points',
        this.createLagrangePointsContent(),
        'Science'
      );
    }
  }
  
  /**
   * Create content for Lagrange Points information panel
   * @returns {String} HTML content for the panel
   */
  createLagrangePointsContent() {
    return `
      <div class="info-panel-body">
        <h4>What Are Lagrange Points?</h4>
        <p>
          Lagrange points (also called L-points or libration points) are positions in space where objects sent there tend to stay put. 
          At Lagrange points, the gravitational pull of two large masses precisely equals the centripetal force required for a small object to move with them.
        </p>
        
        <h4>The Five Lagrange Points</h4>
        <p>
          In any two-body system (like the Sun and Earth), there are five Lagrange points:
        </p>
        <ul>
          <li>
            <strong>L1</strong> (between the two bodies) - Unstable point where gravity from both bodies balances. 
            Useful for solar observation (like the SOHO spacecraft).
          </li>
          <li>
            <strong>L2</strong> (beyond the smaller body) - Unstable point used for space telescopes 
            (like James Webb Space Telescope) as it provides a stable thermal environment.
          </li>
          <li>
            <strong>L3</strong> (opposite the smaller body) - Unstable point on the opposite side of the larger body.
          </li>
          <li>
            <strong>L4</strong> (60° ahead of the smaller body) - Stable point that leads the smaller body in its orbit.
            In the Sun-Jupiter system, these points host the "Trojan asteroids."
          </li>
          <li>
            <strong>L5</strong> (60° behind the smaller body) - Stable point that trails the smaller body in its orbit.
            Also contains Trojan asteroids in the Sun-Jupiter system.
          </li>
        </ul>
        
        <h4>Stability of Lagrange Points</h4>
        <p>
          L1, L2, and L3 are unstable equilibrium points. Without some form of station-keeping, objects at these 
          locations will drift away. L4 and L5 are stable equilibrium points, making them excellent locations for natural or 
          artificial satellites to remain over long periods.
        </p>
        
        <h4>Mathematical Foundation</h4>
        <p>
          Lagrange points are named after Joseph-Louis Lagrange, who discovered them while studying the restricted three-body problem in 
          celestial mechanics. The restricted three-body problem examines how a small body moves under the influence of two 
          much larger bodies that orbit around their common center of mass.
        </p>
        
        <div class="formula">
          μ = m₂/(m₁ + m₂)
        </div>
        
        <p>
          Where m₁ is the mass of the primary body, m₂ is the mass of the secondary body, and μ is the mass ratio.
          This ratio helps determine the exact positions of the Lagrange points.
        </p>
        
        <h4>Applications</h4>
        <p>
          Lagrange points are valuable for:
        </p>
        <ul>
          <li>Space telescopes that need stable thermal environments (L2)</li>
          <li>Solar observation missions (L1)</li>
          <li>Communication relay stations</li>
          <li>Future space colonies or stations (L4/L5)</li>
          <li>Understanding natural satellite formation and stability</li>
        </ul>
        
        <h4>Visualizing Lagrange Points</h4>
        <p>
          In this simulator, you can visualize Lagrange points for any two-body system:
        </p>
        <ol>
          <li>Use the Lagrange Points control in the interface</li>
          <li>Select a two-body system (like Sun-Earth)</li>
          <li>Click "Show" to display the five Lagrange points</li>
        </ol>
        
        <p>
          The cyan markers indicate the positions of L1 through L5. Note how L4 and L5 form equilateral 
          triangles with the two primary bodies.
        </p>
      </div>
    `;
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
