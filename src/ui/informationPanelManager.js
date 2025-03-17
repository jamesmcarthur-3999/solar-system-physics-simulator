// InformationPanelManager.js - Manages educational information panels
const THREE = require('three');

/**
 * Manages educational information panels
 * Provides detailed information about celestial bodies and astronomical concepts
 */
class InformationPanelManager {
  /**
   * Creates a new InformationPanelManager
   */
  constructor() {
    this.panels = {};
    this.activePanel = null;
    this.createPanelContainer();
  }
  
  /**
   * Create the panel container
   */
  createPanelContainer() {
    this.container = document.createElement('div');
    this.container.className = 'info-panels-container';
    document.body.appendChild(this.container);
    
    // Create panel selector
    this.selector = document.createElement('div');
    this.selector.className = 'info-panel-selector';
    
    const selectorTitle = document.createElement('h4');
    selectorTitle.textContent = 'Educational Content';
    this.selector.appendChild(selectorTitle);
    
    this.categoryContainer = document.createElement('div');
    this.categoryContainer.className = 'info-panel-categories';
    this.selector.appendChild(this.categoryContainer);
    
    document.body.appendChild(this.selector);
  }
  
  /**
   * Add a new information panel
   * @param {String} id - Unique identifier for the panel
   * @param {String} title - Title of the panel
   * @param {String} content - HTML content of the panel
   * @param {String} category - Category of the panel
   * @returns {Object} - The created panel
   */
  addPanel(id, title, content, category) {
    const panel = {
      id,
      title,
      content,
      category,
      element: this.createPanelElement(id, title, content)
    };
    
    this.panels[id] = panel;
    this.container.appendChild(panel.element);
    panel.element.style.display = 'none';
    
    // Add to category list
    this.updateCategoryList();
    
    return panel;
  }
  
  /**
   * Check if a panel exists with the given ID
   * @param {String} id - ID to check
   * @returns {Boolean} - True if the panel exists
   */
  hasPanel(id) {
    return !!this.panels[id];
  }
  
  /**
   * Create a panel element
   * @param {String} id - Unique identifier for the panel
   * @param {String} title - Title of the panel
   * @param {String} content - HTML content of the panel
   * @returns {HTMLElement} - The created panel element
   */
  createPanelElement(id, title, content) {
    const panel = document.createElement('div');
    panel.className = 'info-panel';
    panel.id = `info-panel-${id}`;
    
    const header = document.createElement('div');
    header.className = 'info-panel-header';
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'info-panel-close';
    closeButton.addEventListener('click', () => this.hidePanel(id));
    
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    
    const contentElement = document.createElement('div');
    contentElement.className = 'info-panel-content';
    contentElement.innerHTML = content;
    
    panel.appendChild(header);
    panel.appendChild(contentElement);
    
    return panel;
  }
  
  /**
   * Update the category list in the selector
   */
  updateCategoryList() {
    // Clear current list
    this.categoryContainer.innerHTML = '';
    
    // Get unique categories
    const categories = [...new Set(Object.values(this.panels).map(panel => panel.category))];
    
    // Create category sections
    categories.forEach(category => {
      const categorySection = document.createElement('div');
      categorySection.className = 'info-panel-category-section';
      
      const categoryTitle = document.createElement('h5');
      categoryTitle.textContent = category;
      categorySection.appendChild(categoryTitle);
      
      // Add panels in this category
      const panelList = document.createElement('ul');
      
      const panelsInCategory = Object.values(this.panels)
        .filter(panel => panel.category === category)
        .sort((a, b) => a.title.localeCompare(b.title));
      
      panelsInCategory.forEach(panel => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = panel.title;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.showPanel(panel.id);
        });
        
        item.appendChild(link);
        panelList.appendChild(item);
      });
      
      categorySection.appendChild(panelList);
      this.categoryContainer.appendChild(categorySection);
    });
  }
  
  /**
   * Show a specific panel
   * @param {String} id - ID of the panel to show
   */
  showPanel(id) {
    // Hide current panel
    if (this.activePanel) {
      this.panels[this.activePanel].element.style.display = 'none';
    }
    
    // Show the requested panel
    if (this.panels[id]) {
      this.panels[id].element.style.display = 'block';
      this.activePanel = id;
    }
  }
  
  /**
   * Hide a specific panel
   * @param {String} id - ID of the panel to hide
   */
  hidePanel(id) {
    if (this.panels[id]) {
      this.panels[id].element.style.display = 'none';
      
      if (this.activePanel === id) {
        this.activePanel = null;
      }
    }
  }
  
  /**
   * Get panels by category
   * @param {String} category - Category to filter by
   * @returns {Array} - Array of panels in the category
   */
  getPanelsByCategory(category) {
    return Object.values(this.panels).filter(panel => panel.category === category);
  }
  
  /**
   * Create default educational panels
   */
  createDefaultPanels() {
    // Celestial Bodies Category
    this.addPanel(
      'sun',
      'The Sun',
      `
        <div class="info-panel-body">
          <img src="../assets/textures/sun.jpg" alt="The Sun" class="info-panel-image">
          <h4>Our Star</h4>
          <p>The Sun is a G-type main-sequence star (G2V) at the center of our Solar System. 
          It formed approximately 4.6 billion years ago and is expected to remain stable for another 5 billion years.</p>
          
          <h4>Key Facts</h4>
          <ul>
            <li><strong>Mass:</strong> 1.989 × 10^30 kg (333,000 Earth masses)</li>
            <li><strong>Radius:</strong> 696,340 km (109 Earth radii)</li>
            <li><strong>Surface Temperature:</strong> 5,778 K (5,505°C)</li>
            <li><strong>Core Temperature:</strong> ~15 million K</li>
            <li><strong>Classification:</strong> G-type main-sequence star (Yellow Dwarf)</li>
            <li><strong>Composition:</strong> 73% hydrogen, 25% helium, 2% heavier elements</li>
          </ul>
          
          <h4>Energy Production</h4>
          <p>The Sun produces energy through nuclear fusion in its core, converting hydrogen into helium. 
          This process releases enormous amounts of energy that radiates outward as heat and light.</p>
          
          <p>Every second, the Sun converts 600 million tons of hydrogen into helium, releasing energy 
          equivalent to 91.6 billion megatons of TNT.</p>
          
          <h4>Solar Structure</h4>
          <ul>
            <li><strong>Core:</strong> The fusion reactor where hydrogen is converted to helium</li>
            <li><strong>Radiative Zone:</strong> Energy slowly travels outward via radiation</li>
            <li><strong>Convective Zone:</strong> Energy moves outward via convection currents</li>
            <li><strong>Photosphere:</strong> The visible "surface" of the Sun</li>
            <li><strong>Chromosphere:</strong> A thin layer above the photosphere</li>
            <li><strong>Corona:</strong> The extended outer atmosphere, visible during eclipses</li>
          </ul>
          
          <h4>Solar Phenomena</h4>
          <p>The Sun exhibits various dynamic features:</p>
          <ul>
            <li><strong>Sunspots:</strong> Temporary dark spots that are cooler regions on the photosphere</li>
            <li><strong>Solar Flares:</strong> Sudden releases of energy from the Sun's surface</li>
            <li><strong>Coronal Mass Ejections:</strong> Large expulsions of plasma and magnetic field</li>
            <li><strong>Solar Wind:</strong> A stream of charged particles flowing outward from the Sun</li>
          </ul>
          
          <h4>Importance to Life</h4>
          <p>The Sun provides the energy necessary for almost all life on Earth. It drives our weather, 
          ocean currents, seasons, and climate. Without the Sun, life as we know it would not exist.</p>
        </div>
      `,
      'Celestial Bodies'
    );
    
    this.addPanel(
      'earth',
      'Earth',
      `
        <div class="info-panel-body">
          <img src="../assets/textures/earth.jpg" alt="Earth" class="info-panel-image">
          <h4>Our Home Planet</h4>
          <p>Earth is the third planet from the Sun and the only astronomical object known to harbor life. 
          It formed approximately 4.5 billion years ago.</p>
          
          <h4>Key Facts</h4>
          <ul>
            <li><strong>Mass:</strong> 5.972 × 10^24 kg</li>
            <li><strong>Radius:</strong> 6,371 km</li>
            <li><strong>Surface Area:</strong> 510 million km²</li>
            <li><strong>Distance from Sun:</strong> 149.6 million km (1 AU)</li>
            <li><strong>Orbital Period:</strong> 365.256 days</li>
            <li><strong>Rotation Period:</strong> 23 hours, 56 minutes</li>
            <li><strong>Axial Tilt:</strong> 23.5 degrees</li>
            <li><strong>Surface Temperature Range:</strong> -88°C to 58°C</li>
          </ul>
          
          <h4>Earth's Structure</h4>
          <ul>
            <li><strong>Inner Core:</strong> Solid iron-nickel alloy, ~5,700°C</li>
            <li><strong>Outer Core:</strong> Liquid iron-nickel alloy</li>
            <li><strong>Mantle:</strong> Semi-solid rock, mostly silicates</li>
            <li><strong>Crust:</strong> Thin, solid outer layer</li>
          </ul>
          
          <h4>Earth's Atmosphere</h4>
          <p>Earth's atmosphere consists of:</p>
          <ul>
            <li>78% Nitrogen</li>
            <li>21% Oxygen</li>
            <li>0.9% Argon</li>
            <li>0.04% Carbon Dioxide</li>
            <li>Trace amounts of other gases</li>
          </ul>
          
          <p>The atmosphere protects life by filtering harmful solar radiation, retaining heat 
          (greenhouse effect), and reducing temperature extremes between day and night.</p>
          
          <h4>Earth's Water</h4>
          <p>Water covers about 71% of Earth's surface, with oceans containing 97.5% of this water. 
          The presence of liquid water is essential for life as we know it.</p>
          
          <h4>Life on Earth</h4>
          <p>Earth is home to millions of species, with estimates ranging from 8.7 million to 
          trillions of species, most of which have not been discovered or cataloged.</p>
          
          <p>Life has shaped Earth's atmosphere and surface through processes like 
          photosynthesis, which increased oxygen levels around 2.4 billion years ago.</p>
          
          <h4>Earth's Uniqueness</h4>
          <p>Earth's combination of distance from the Sun, magnetic field, plate tectonics, 
          large moon, and atmospheric composition create conditions that are (so far) 
          uniquely suitable for complex life.</p>
        </div>
      `,
      'Celestial Bodies'
    );
    
    // Astronomical Concepts Category
    this.addPanel(
      'gravity',
      'Gravity',
      `
        <div class="info-panel-body">
          <h4>Understanding Gravity</h4>
          <p>Gravity is one of the four fundamental forces of nature. It is the force that attracts 
          bodies with mass toward each other. In the context of our solar system, gravity is 
          responsible for keeping planets in orbit around the Sun and moons around planets.</p>
          
          <h4>Newton's Law of Universal Gravitation</h4>
          <p>Isaac Newton's law states that every mass attracts every other mass with a force 
          that is directly proportional to the product of their masses and inversely proportional 
          to the square of the distance between them.</p>
          
          <div class="formula">
            F = G × (m₁ × m₂) / r²
          </div>
          
          <p>Where:</p>
          <ul>
            <li>F is the gravitational force between masses</li>
            <li>G is the gravitational constant (6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻²)</li>
            <li>m₁ and m₂ are the masses of the objects</li>
            <li>r is the distance between the centers of the masses</li>
          </ul>
          
          <h4>Einstein's Theory of General Relativity</h4>
          <p>Albert Einstein's theory redefined our understanding of gravity. Rather than being a 
          force, gravity is described as the curvature of spacetime caused by mass and energy.</p>
          
          <p>According to general relativity, massive objects distort the fabric of spacetime, creating 
          a "gravity well." Other objects follow the curved paths of this distorted spacetime, which 
          we perceive as the force of gravity.</p>
          
          <h4>Gravity in Our Solar System</h4>
          <p>The Sun, containing 99.8% of the total mass in our solar system, creates a deep 
          gravity well that determines the orbits of planets, asteroids, and comets.</p>
          
          <p>The stronger the gravitational pull, the faster an object must travel to maintain its orbit. 
          Mercury, the closest planet to the Sun, travels at about 47 km/s, while Neptune, the farthest 
          planet, travels at only 5.4 km/s.</p>
          
          <h4>Gravity and Escape Velocity</h4>
          <p>Escape velocity is the minimum speed needed for an object to escape the gravitational 
          influence of a celestial body. It depends on the mass and radius of the body:</p>
          
          <div class="formula">
            v_e = √(2GM/r)
          </div>
          
          <p>Some escape velocities in our solar system:</p>
          <ul>
            <li>Earth: 11.2 km/s</li>
            <li>Moon: 2.4 km/s</li>
            <li>Mars: 5.0 km/s</li>
            <li>Jupiter: 59.5 km/s</li>
            <li>Sun: 617.5 km/s</li>
          </ul>
          
          <h4>Gravity and Tides</h4>
          <p>Tides on Earth are primarily caused by the Moon's gravitational pull. As the Moon orbits 
          Earth, its gravity pulls the nearest ocean waters slightly toward it, creating a bulge. 
          A similar bulge occurs on the opposite side of Earth due to inertia.</p>
          
          <p>The Sun also influences tides, but its effect is less than half that of the Moon 
          despite its much greater mass, because tidal forces decrease with the cube of distance.</p>
        </div>
      `,
      'Astronomical Concepts'
    );
    
    this.addPanel(
      'orbital-mechanics',
      'Orbital Mechanics',
      `
        <div class="info-panel-body">
          <h4>Understanding Orbits</h4>
          <p>Orbital mechanics is the study of the motion of artificial satellites and space vehicles 
          moving under the influence of gravitational forces, such as those from the Sun, Earth, 
          and other celestial bodies.</p>
          
          <h4>Kepler's Laws of Planetary Motion</h4>
          <p><strong>First Law (Law of Ellipses):</strong> The orbit of a planet is an ellipse with the 
          Sun at one of the two foci.</p>
          
          <p><strong>Second Law (Law of Equal Areas):</strong> A line segment connecting a planet and the 
          Sun sweeps out equal areas during equal intervals of time. This means planets move faster when 
          they're closer to the Sun and slower when they're farther away.</p>
          
          <p><strong>Third Law (Law of Harmonies):</strong> The square of the orbital period of a planet 
          is directly proportional to the cube of the semi-major axis of its orbit.</p>
          
          <div class="formula">
            P² ∝ a³
          </div>
          
          <h4>Orbital Elements</h4>
          <p>Six parameters completely describe an orbit:</p>
          <ul>
            <li><strong>Semi-major axis (a):</strong> Half the longest diameter of an elliptical orbit</li>
            <li><strong>Eccentricity (e):</strong> Measure of how much the orbit deviates from a circle</li>
            <li><strong>Inclination (i):</strong> Angular distance of the orbital plane from the reference plane</li>
            <li><strong>Longitude of the ascending node (Ω):</strong> Angle from reference direction to the ascending node</li>
            <li><strong>Argument of periapsis (ω):</strong> Angle from the ascending node to the periapsis</li>
            <li><strong>True anomaly (ν):</strong> Angle from periapsis to the object's current position</li>
          </ul>
          
          <h4>Types of Orbits</h4>
          <p>Based on eccentricity:</p>
          <ul>
            <li><strong>Circular (e = 0):</strong> A perfect circle</li>
            <li><strong>Elliptical (0 < e < 1):</strong> An ellipse</li>
            <li><strong>Parabolic (e = 1):</strong> A parabola (escape orbit)</li>
            <li><strong>Hyperbolic (e > 1):</strong> A hyperbola (escape orbit)</li>
          </ul>
          
          <h4>Special Points in Orbits</h4>
          <p><strong>Apoapsis:</strong> The point in an orbit farthest from the central body</p>
          <p><strong>Periapsis:</strong> The point in an orbit closest to the central body</p>
          
          <p>These points have specific names depending on the central body:</p>
          <ul>
            <li>Earth: Apogee/Perigee</li>
            <li>Sun: Aphelion/Perihelion</li>
            <li>Mars: Apoareion/Periareion</li>
            <li>Jupiter: Apojove/Perijove</li>
          </ul>
          
          <h4>Lagrange Points</h4>
          <p>Lagrange points are positions in space where the gravitational forces of two large bodies 
          (like the Earth and Sun) produce enhanced regions of attraction and repulsion. These points 
          are useful for placing satellites or observatories.</p>
          
          <p>There are five Lagrange points (L1-L5) in any two-body system:</p>
          <ul>
            <li><strong>L1, L2, L3:</strong> Unstable equilibrium points along the line connecting the two bodies</li>
            <li><strong>L4, L5:</strong> Stable equilibrium points forming equilateral triangles with the two bodies</li>
          </ul>
        </div>
      `,
      'Astronomical Concepts'
    );
    
    // Add the Lagrange Points panel if it doesn't exist yet
    if (!this.hasPanel('lagrange-points')) {
      this.addPanel(
        'lagrange-points',
        'Lagrange Points',
        `
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
        `,
        'Astronomical Concepts'
      );
    }
    
    // Space Exploration Category
    this.addPanel(
      'space-exploration',
      'Space Exploration History',
      `
        <div class="info-panel-body">
          <h4>The Dawn of Space Exploration</h4>
          <p>Humanity's journey beyond Earth began in the mid-20th century, driven by technological 
          advances and the geopolitical competition of the Cold War.</p>
          
          <h4>Key Milestones</h4>
          <ul>
            <li><strong>October 4, 1957:</strong> Sputnik 1 (USSR) becomes the first artificial satellite to orbit Earth</li>
            <li><strong>April 12, 1961:</strong> Yuri Gagarin (USSR) becomes the first human in space</li>
            <li><strong>May 5, 1961:</strong> Alan Shepard becomes the first American in space</li>
            <li><strong>February 20, 1962:</strong> John Glenn becomes the first American to orbit Earth</li>
            <li><strong>June 16, 1963:</strong> Valentina Tereshkova (USSR) becomes the first woman in space</li>
            <li><strong>March 18, 1965:</strong> Alexei Leonov (USSR) conducts the first spacewalk</li>
            <li><strong>July 20, 1969:</strong> Apollo 11 astronauts Neil Armstrong and Buzz Aldrin become the first humans to walk on the Moon</li>
            <li><strong>April 19, 1971:</strong> Salyut 1 (USSR) becomes the first space station</li>
            <li><strong>July 20, 1976:</strong> Viking 1 lands on Mars, sending back the first images from the Martian surface</li>
            <li><strong>1977:</strong> Voyager 1 and 2 are launched to study outer planets and eventually enter interstellar space</li>
            <li><strong>April 12, 1981:</strong> First Space Shuttle (Columbia) is launched</li>
            <li><strong>1990:</strong> Hubble Space Telescope is deployed</li>
            <li><strong>1998:</strong> Assembly of the International Space Station begins</li>
            <li><strong>2004:</strong> SpaceShipOne becomes the first privately developed spacecraft to reach space</li>
            <li><strong>2012:</strong> Curiosity rover lands on Mars</li>
            <li><strong>2015:</strong> New Horizons spacecraft flies by Pluto</li>
            <li><strong>2020:</strong> SpaceX becomes the first private company to send astronauts to the ISS</li>
          </ul>
          
          <h4>Major Space Agencies</h4>
          <ul>
            <li><strong>NASA (USA):</strong> Founded in 1958, responsible for the Apollo Moon landings, Space Shuttle, Mars rovers, and numerous scientific missions</li>
            <li><strong>Roscosmos (Russia):</strong> Successor to the Soviet space program, operates the Soyuz spacecraft and collaborates on the ISS</li>
            <li><strong>ESA (Europe):</strong> Collaborative effort of European nations, known for Ariane rockets, Rosetta mission, and Mars Express</li>
            <li><strong>CNSA (China):</strong> Rapidly expanding program with its own space station (Tiangong), lunar missions, and Mars rover</li>
            <li><strong>ISRO (India):</strong> Known for cost-effective missions including Mars Orbiter Mission and Chandrayaan lunar missions</li>
            <li><strong>JAXA (Japan):</strong> Specializes in space science, Earth observation, and asteroid sample return missions</li>
          </ul>
          
          <h4>Private Space Companies</h4>
          <ul>
            <li><strong>SpaceX:</strong> Pioneered reusable rocket technology, Falcon 9, Dragon spacecraft, Starlink satellite network</li>
            <li><strong>Blue Origin:</strong> Developing New Shepard for suborbital tourism and New Glenn orbital rocket</li>
            <li><strong>Virgin Galactic:</strong> Focused on suborbital space tourism</li>
            <li><strong>Rocket Lab:</strong> Specializes in small satellite launches</li>
          </ul>
          
          <h4>Future of Space Exploration</h4>
          <p>Current goals in space exploration include:</p>
          <ul>
            <li>Returning humans to the Moon (NASA's Artemis program)</li>
            <li>Establishing a sustained human presence on Mars</li>
            <li>Exploring ocean worlds like Europa and Enceladus for signs of life</li>
            <li>Developing space resource utilization and in-space manufacturing</li>
            <li>Expanding human presence beyond Low Earth Orbit</li>
            <li>Deploying next-generation space telescopes for astronomical discoveries</li>
          </ul>
        </div>
      `,
      'Space Exploration'
    );
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove event listeners from panel close buttons
    const closeButtons = document.querySelectorAll('.info-panel-close');
    closeButtons.forEach(button => {
      button.removeEventListener('click', () => {});
    });
    
    // Remove event listeners from panel selector links
    const links = this.selector.querySelectorAll('a');
    links.forEach(link => {
      link.removeEventListener('click', () => {});
    });
    
    // Remove panels from DOM
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Remove selector from DOM
    if (this.selector && this.selector.parentNode) {
      this.selector.parentNode.removeChild(this.selector);
    }
  }
}

module.exports = {
  InformationPanelManager
};
