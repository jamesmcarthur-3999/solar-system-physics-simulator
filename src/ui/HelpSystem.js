/**
 * HelpSystem class
 * Provides context-sensitive assistance to users through a panel and tooltips
 */
class HelpSystem {
  /**
   * Constructor for HelpSystem
   */
  constructor() {
    this.helpTopics = new Map();
    this.activeTooltips = [];
    this.createHelpPanel();
    this.registerDefaultTopics();
    this.activeTopic = null;
  }
  
  /**
   * Create the help panel UI
   */
  createHelpPanel() {
    // Create main panel
    this.panel = document.createElement('div');
    this.panel.className = 'help-panel';
    
    // Create header with title and close button
    const header = document.createElement('div');
    header.className = 'help-panel-header';
    
    const title = document.createElement('h3');
    title.textContent = 'Help Center';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'help-panel-close';
    closeButton.setAttribute('aria-label', 'Close help panel');
    closeButton.addEventListener('click', () => this.hidePanel());
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create search box
    this.searchBox = document.createElement('input');
    this.searchBox.type = 'text';
    this.searchBox.placeholder = 'Search help topics...';
    this.searchBox.className = 'help-search-box';
    this.searchBox.addEventListener('input', () => this.searchTopics());
    
    // Create container for topics list
    this.topicsContainer = document.createElement('div');
    this.topicsContainer.className = 'help-container';
    
    // Create topics list
    this.topicsList = document.createElement('div');
    this.topicsList.className = 'help-topics-list';
    
    // Create content area
    this.topicContent = document.createElement('div');
    this.topicContent.className = 'help-topic-content';
    
    // Assemble panel
    this.topicsContainer.appendChild(this.topicsList);
    this.topicsContainer.appendChild(this.topicContent);
    
    this.panel.appendChild(header);
    this.panel.appendChild(this.searchBox);
    this.panel.appendChild(this.topicsContainer);
    
    // Add panel to body but keep it hidden initially
    document.body.appendChild(this.panel);
    this.panel.style.display = 'none';
    
    // Add keyboard handler for escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.panel.style.display !== 'none') {
        this.hidePanel();
      }
    });
  }
  
  /**
   * Register default help topics
   */
  registerDefaultTopics() {
    // Basic Controls
    this.registerTopic(
      'basic-controls',
      'Basic Controls',
      `
        <h4>Navigating the Solar System</h4>
        <p>Control the camera to explore the solar system:</p>
        <ul>
          <li><strong>Rotate View:</strong> Left-click and drag</li>
          <li><strong>Pan View:</strong> Right-click and drag</li>
          <li><strong>Zoom:</strong> Mouse wheel or pinch gesture</li>
          <li><strong>Reset View:</strong> Press the "Reset View" button or R key</li>
        </ul>
        
        <h4>Time Controls</h4>
        <p>Manage simulation time:</p>
        <ul>
          <li><strong>Play/Pause:</strong> Space bar or Play/Pause button</li>
          <li><strong>Increase Speed:</strong> Up arrow or "+" button</li>
          <li><strong>Decrease Speed:</strong> Down arrow or "-" button</li>
        </ul>
        
        <h4>Keyboard Shortcuts</h4>
        <table class="help-shortcuts">
          <tr>
            <td><kbd>Space</kbd></td>
            <td>Play/Pause simulation</td>
          </tr>
          <tr>
            <td><kbd>R</kbd></td>
            <td>Reset camera view</td>
          </tr>
          <tr>
            <td><kbd>↑</kbd></td>
            <td>Increase time scale</td>
          </tr>
          <tr>
            <td><kbd>↓</kbd></td>
            <td>Decrease time scale</td>
          </tr>
          <tr>
            <td><kbd>H</kbd></td>
            <td>Toggle this help panel</td>
          </tr>
          <tr>
            <td><kbd>Esc</kbd></td>
            <td>Close panels and dialogs</td>
          </tr>
        </table>
      `,
      ['controls', 'navigation', 'camera', 'keyboard', 'shortcuts'],
      'Getting Started'
    );
    
    // Adding Objects
    this.registerTopic(
      'adding-objects',
      'Adding Celestial Objects',
      `
        <h4>Creating New Objects</h4>
        <p>Add new planets, moons, or stars to your simulation:</p>
        <ol>
          <li>Click the "Add Object" button in the footer</li>
          <li>Enter basic properties in the dialog:
            <ul>
              <li><strong>Name:</strong> Identify your object</li>
              <li><strong>Type:</strong> Star, Planet, Moon, or Custom</li>
              <li><strong>Mass:</strong> Object's mass (in kg)</li>
              <li><strong>Radius:</strong> Physical size (in km)</li>
            </ul>
          </li>
          <li>Set position and velocity to define the orbit</li>
          <li>Configure advanced properties if desired</li>
          <li>Click "Create" to add the object to the simulation</li>
        </ol>
        
        <h4>Position & Velocity</h4>
        <p>An object's orbit is determined by its:</p>
        <ul>
          <li><strong>Position:</strong> Starting location (X, Y, Z coordinates)</li>
          <li><strong>Velocity:</strong> Starting speed and direction</li>
        </ul>
        <p>For stable orbits, ensure the velocity is perpendicular to the radius vector from the central body, with magnitude = √(GM/r) where G is the gravitational constant, M is the mass of the central body, and r is the distance.</p>
      `,
      ['objects', 'adding', 'celestial', 'planets', 'stars', 'create'],
      'Objects'
    );
    
    // Physics Model
    this.registerTopic(
      'physics-model',
      'Physics Model',
      `
        <h4>Gravitational Simulation</h4>
        <p>This simulator uses Newtonian gravity with these key features:</p>
        <ul>
          <li><strong>N-body Simulation:</strong> All objects exert gravitational forces on each other</li>
          <li><strong>Barnes-Hut Algorithm:</strong> Optimized gravity calculation for many objects</li>
          <li><strong>Adaptive Time Steps:</strong> Maintains stability at high time scales</li>
        </ul>
        
        <h4>The Gravity Equation</h4>
        <div class="formula">
          F = G × (m₁m₂)/r²
        </div>
        <p>Where:</p>
        <ul>
          <li>F = gravitational force between objects</li>
          <li>G = gravitational constant (6.67430 × 10⁻¹¹ m³/kg/s²)</li>
          <li>m₁, m₂ = masses of the two objects</li>
          <li>r = distance between the objects</li>
        </ul>
        
        <h4>Limitations</h4>
        <p>Be aware of these physical model limitations:</p>
        <ul>
          <li>Relativistic effects are not modeled</li>
          <li>Tidal forces are simplified</li>
          <li>Collision physics are basic</li>
          <li>Radiation pressure is not included</li>
        </ul>
      `,
      ['physics', 'gravity', 'simulation', 'forces', 'newton', 'barnes-hut'],
      'Science'
    );
    
    // Lagrange Points
    this.registerTopic(
      'lagrange-points',
      'Lagrange Points',
      `
        <h4>What Are Lagrange Points?</h4>
        <p>Lagrange points are special positions where a small object can maintain a stable position relative to two larger objects (like the Sun and Earth).</p>
        
        <h4>The Five Lagrange Points</h4>
        <ul>
          <li><strong>L1:</strong> Located between the two large bodies. Unstable but useful for observing the larger body (e.g., SOHO spacecraft observes the Sun from the Sun-Earth L1)</li>
          <li><strong>L2:</strong> Located beyond the smaller body. Unstable but useful for observing deep space (e.g., James Webb Space Telescope at Sun-Earth L2)</li>
          <li><strong>L3:</strong> Located on the opposite side of the larger body. Unstable.</li>
          <li><strong>L4:</strong> Located 60° ahead of the smaller body in its orbit. Stable. (e.g., Trojan asteroids at Sun-Jupiter L4)</li>
          <li><strong>L5:</strong> Located 60° behind the smaller body in its orbit. Stable. (e.g., Trojan asteroids at Sun-Jupiter L5)</li>
        </ul>
        
        <h4>Visualizing Lagrange Points</h4>
        <p>To view Lagrange points in the simulator:</p>
        <ol>
          <li>Select a two-body system (e.g., Sun and Earth)</li>
          <li>Open the educational menu (? button in bottom-right)</li>
          <li>Select "Show Lagrange Points"</li>
        </ol>
        <p>The five Lagrange points will be displayed as cyan markers with L1-L5 labels.</p>
      `,
      ['lagrange', 'points', 'stability', 'orbits', 'trojan', 'libration'],
      'Science'
    );
    
    // Educational Features
    this.registerTopic(
      'educational-features',
      'Educational Features',
      `
        <h4>Guided Tours</h4>
        <p>Take step-by-step tours explaining various solar system concepts:</p>
        <ol>
          <li>Click the ? button in the bottom-right corner</li>
          <li>Select "Take a Tour" from the menu</li>
          <li>Choose a tour from the list</li>
          <li>Follow the on-screen prompts to navigate through the tour</li>
        </ol>
        
        <h4>Information Panels</h4>
        <p>Access detailed information about celestial objects and astronomical concepts:</p>
        <ul>
          <li><strong>Object Info:</strong> Click on any object to view its details</li>
          <li><strong>Concept Explanations:</strong> Click the ? button and select "Information Panels"</li>
        </ul>
        
        <h4>Visualization Tools</h4>
        <p>Enable various visualization tools to better understand celestial mechanics:</p>
        <ul>
          <li><strong>Orbit Paths:</strong> Display the trajectories of objects</li>
          <li><strong>Velocity Vectors:</strong> Show speed and direction of objects</li>
          <li><strong>Lagrange Points:</strong> Display the five Lagrange points for selected two-body systems</li>
          <li><strong>Gravity Visualization:</strong> Show the gravitational influence of massive objects</li>
        </ul>
        <p>Access these tools through the ? menu or the visualization controls.</p>
      `,
      ['education', 'learning', 'tours', 'information', 'visualization'],
      'Getting Started'
    );
    
    // Troubleshooting
    this.registerTopic(
      'troubleshooting',
      'Troubleshooting',
      `
        <h4>Performance Issues</h4>
        <p>If the simulation is running slowly:</p>
        <ul>
          <li>Reduce the number of objects (fewer than 100 is recommended)</li>
          <li>Turn off orbit path visualization for objects</li>
          <li>Disable gravity visualization</li>
          <li>Use simpler system configurations</li>
          <li>Ensure your graphics drivers are up to date</li>
        </ul>
        
        <h4>Physics Anomalies</h4>
        <p>If objects behave unexpectedly:</p>
        <ul>
          <li>Ensure time scale isn't too high (can cause calculation errors)</li>
          <li>Check object masses are in realistic proportion</li>
          <li>Verify initial velocities are appropriate for stable orbits</li>
          <li>Reset the system and try again with adjusted parameters</li>
        </ul>
        
        <h4>Display Problems</h4>
        <p>If visual elements aren't rendering correctly:</p>
        <ul>
          <li>Reset the view (R key or Reset View button)</li>
          <li>Reload the application</li>
          <li>Check for WebGL support in your browser</li>
          <li>Update your graphics drivers</li>
        </ul>
        
        <h4>Application Crashes</h4>
        <p>If the application crashes or freezes:</p>
        <ul>
          <li>Restart the application</li>
          <li>Reduce system complexity</li>
          <li>Check system requirements</li>
          <li>Update to the latest version</li>
        </ul>
      `,
      ['problems', 'issues', 'bugs', 'crashes', 'slow', 'performance'],
      'Support'
    );
  }
  
  /**
   * Register a help topic
   * @param {String} id - Unique identifier for the topic
   * @param {String} title - Display title for the topic
   * @param {String} content - HTML content for the topic
   * @param {Array} keywords - Keywords for search
   * @param {String} category - Category for grouping
   */
  registerTopic(id, title, content, keywords = [], category = 'General') {
    this.helpTopics.set(id, {
      id,
      title,
      content,
      keywords,
      category
    });
    
    this.rebuildTopicsList();
  }
  
  /**
   * Rebuild the topics list
   */
  rebuildTopicsList() {
    this.topicsList.innerHTML = '';
    
    // Group by category
    const categories = new Map();
    
    this.helpTopics.forEach(topic => {
      if (!categories.has(topic.category)) {
        categories.set(topic.category, []);
      }
      
      categories.get(topic.category).push(topic);
    });
    
    // Create category groups
    categories.forEach((topics, category) => {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'help-category';
      
      const categoryTitle = document.createElement('h4');
      categoryTitle.textContent = category;
      categoryEl.appendChild(categoryTitle);
      
      const topicsList = document.createElement('ul');
      
      topics.forEach(topic => {
        const topicItem = document.createElement('li');
        const topicLink = document.createElement('a');
        topicLink.href = '#';
        topicLink.textContent = topic.title;
        topicLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.showTopic(topic.id);
        });
        
        topicItem.appendChild(topicLink);
        topicsList.appendChild(topicItem);
      });
      
      categoryEl.appendChild(topicsList);
      this.topicsList.appendChild(categoryEl);
    });
  }
  
  /**
   * Search topics by keyword
   */
  searchTopics() {
    const query = this.searchBox.value.toLowerCase().trim();
    
    if (!query) {
      this.rebuildTopicsList();
      return;
    }
    
    // Filter topics by search query
    const matchingTopics = Array.from(this.helpTopics.values())
      .filter(topic => {
        return topic.title.toLowerCase().includes(query) ||
               topic.keywords.some(keyword => keyword.toLowerCase().includes(query)) ||
               topic.content.toLowerCase().includes(query);
      });
    
    // Show search results
    this.topicsList.innerHTML = '';
    
    if (matchingTopics.length === 0) {
      const noResults = document.createElement('p');
      noResults.className = 'help-no-results';
      noResults.textContent = 'No matching topics found. Try different keywords.';
      this.topicsList.appendChild(noResults);
      return;
    }
    
    const resultsList = document.createElement('ul');
    
    matchingTopics.forEach(topic => {
      const topicItem = document.createElement('li');
      const topicLink = document.createElement('a');
      topicLink.href = '#';
      topicLink.textContent = topic.title;
      topicLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showTopic(topic.id);
      });
      
      topicItem.appendChild(topicLink);
      resultsList.appendChild(topicItem);
    });
    
    this.topicsList.appendChild(resultsList);
  }
  
  /**
   * Show a specific help topic
   * @param {String} id - ID of the topic to show
   */
  showTopic(id) {
    const topic = this.helpTopics.get(id);
    
    if (!topic) return;
    
    // Mark links as active/inactive
    const allLinks = this.topicsList.querySelectorAll('a');
    allLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = Array.from(allLinks).find(link => link.textContent === topic.title);
    if (activeLink) activeLink.classList.add('active');
    
    this.topicContent.innerHTML = '';
    
    const title = document.createElement('h3');
    title.textContent = topic.title;
    title.className = 'help-topic-title';
    
    const content = document.createElement('div');
    content.className = 'help-topic-body';
    content.innerHTML = topic.content;
    
    this.topicContent.appendChild(title);
    this.topicContent.appendChild(content);
    
    // Store the active topic
    this.activeTopic = id;
    
    // Show the panel if it's not already visible
    this.showPanel();
  }
  
  /**
   * Show the help panel
   */
  showPanel() {
    // Update any links to this/current page
    document.querySelectorAll('a[href="#"]').forEach(link => {
      link.addEventListener('click', (e) => e.preventDefault());
    });
    
    this.panel.style.display = 'block';
    
    // If no topic is active, show the first one
    if (!this.activeTopic && this.helpTopics.size > 0) {
      this.showTopic(this.helpTopics.values().next().value.id);
    }
  }
  
  /**
   * Hide the help panel
   */
  hidePanel() {
    this.panel.style.display = 'none';
  }
  
  /**
   * Toggle the help panel visibility
   */
  togglePanel() {
    if (this.panel.style.display === 'none') {
      this.showPanel();
    } else {
      this.hidePanel();
    }
  }
  
  /**
   * Show context-sensitive help tooltip
   * @param {String} elementId - ID of the element to attach tooltip to
   * @param {String} content - Content for the tooltip
   */
  showTooltip(elementId, content) {
    const element = document.getElementById(elementId);
    
    if (!element) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'help-tooltip';
    tooltip.innerHTML = content;
    
    const rect = element.getBoundingClientRect();
    
    // Position the tooltip near the element
    tooltip.style.position = 'absolute';
    
    // Determine best position (right, left, top, bottom)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Default to right position
    let left = rect.right + 10;
    let top = rect.top;
    
    // Check if tooltip would go off-screen to the right
    if (left + 250 > viewportWidth) {
      // Try left position
      left = rect.left - 260;
      
      // If that's still off-screen, center horizontally
      if (left < 10) {
        left = Math.max(10, Math.min(viewportWidth - 260, rect.left - 130 + rect.width / 2));
        
        // If we're centering, position below or above
        if (rect.bottom + 10 + 100 < viewportHeight) {
          top = rect.bottom + 10;
        } else {
          top = Math.max(10, rect.top - 100);
        }
      }
    }
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    
    document.body.appendChild(tooltip);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'tooltip-close';
    closeButton.addEventListener('click', () => this.hideTooltip(tooltip));
    tooltip.appendChild(closeButton);
    
    this.activeTooltips.push(tooltip);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      this.hideTooltip(tooltip);
    }, 8000);
    
    return tooltip;
  }
  
  /**
   * Hide a specific tooltip
   * @param {HTMLElement} tooltip - Tooltip element to hide
   */
  hideTooltip(tooltip) {
    if (tooltip && document.body.contains(tooltip)) {
      tooltip.classList.add('tooltip-hiding');
      
      // Add fade-out animation
      setTimeout(() => {
        if (document.body.contains(tooltip)) {
          document.body.removeChild(tooltip);
          this.activeTooltips = this.activeTooltips.filter(t => t !== tooltip);
        }
      }, 300);
    }
  }
  
  /**
   * Hide all tooltips
   */
  hideAllTooltips() {
    const tooltips = [...this.activeTooltips];
    tooltips.forEach(tooltip => {
      this.hideTooltip(tooltip);
    });
  }
  
  /**
   * Add help context for an element
   * @param {String} elementId - ID of the element to add context for
   * @param {String} helpContent - HTML content for the tooltip
   * @param {String} relatedTopicId - ID of related help topic
   */
  addContextHelp(elementId, helpContent, relatedTopicId = null) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Add help indicator
    const indicator = document.createElement('span');
    indicator.className = 'help-indicator';
    indicator.innerHTML = '?';
    indicator.title = 'Click for help';
    
    // Position the indicator
    const rect = element.getBoundingClientRect();
    indicator.style.position = 'absolute';
    indicator.style.left = `${rect.right + 5}px`;
    indicator.style.top = `${rect.top}px`;
    
    document.body.appendChild(indicator);
    
    // Show tooltip on click
    indicator.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Hide any existing tooltips
      this.hideAllTooltips();
      
      // Show a new tooltip
      const tooltip = this.showTooltip(elementId, helpContent);
      
      // If there's a related topic, add a link to it
      if (relatedTopicId && this.helpTopics.has(relatedTopicId)) {
        const moreLink = document.createElement('a');
        moreLink.href = '#';
        moreLink.className = 'help-more-link';
        moreLink.textContent = 'More about this...';
        moreLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.hideTooltip(tooltip);
          this.showTopic(relatedTopicId);
        });
        
        tooltip.appendChild(moreLink);
      }
    });
    
    return indicator;
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    this.hideAllTooltips();
    
    if (this.panel && document.body.contains(this.panel)) {
      document.body.removeChild(this.panel);
    }
    
    this.helpTopics.clear();
  }
}

// Export using CommonJS syntax
module.exports = HelpSystem;
