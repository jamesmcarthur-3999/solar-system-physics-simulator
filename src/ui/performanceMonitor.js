/**
 * Performance Monitor for Solar System Simulator
 * 
 * This component displays performance metrics and allows toggling
 * optimizations like Barnes-Hut algorithm and level-of-detail rendering.
 */

class PerformanceMonitor {
  /**
   * Create a new performance monitor
   * @param {Object} container - Container element or ID
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    // Get container element
    if (typeof container === 'string') {
      this.container = document.getElementById(container);
    } else {
      this.container = container;
    }
    
    if (!this.container) {
      console.error('Performance monitor container not found');
      return;
    }
    
    // Default options
    this.options = Object.assign({
      updateInterval: 500, // Update interval in ms
      showAverage: true, // Show average frame time
      showFPS: true, // Show FPS
      showObjectCount: true, // Show object count
      showPhysicsTime: true, // Show physics calculation time
      showRenderTime: true, // Show render time
      expanded: false // Whether the panel is expanded by default
    }, options);
    
    // Performance metrics
    this.metrics = {
      fps: 0,
      frameTime: 0,
      avgFrameTime: 0,
      physicsTime: 0,
      renderTime: 0,
      objectCount: 0
    };
    
    // Last update time
    this.lastUpdateTime = 0;
    
    // Frame counter for FPS calculation
    this.frameCount = 0;
    this.lastFPSUpdateTime = performance.now();
    
    // Optimization settings
    this.optimizations = {
      barnesHut: true,
      lod: true,
      orbitOptimization: true,
      adaptivePhysics: true
    };
    
    // Initialize UI
    this.initUI();
    
    // Start update loop
    this.startUpdateLoop();
  }

  /**
   * Initialize the UI components
   */
  initUI() {
    try {
      // Create performance panel
      this.panel = document.createElement('div');
      this.panel.className = 'performance-panel';
      
      // Header with toggle
      const header = document.createElement('div');
      header.className = 'performance-header';
      
      const title = document.createElement('h3');
      title.textContent = 'Performance';
      
      const toggleButton = document.createElement('button');
      toggleButton.className = 'toggle-button';
      toggleButton.textContent = this.options.expanded ? '▼' : '▲';
      toggleButton.addEventListener('click', () => this.togglePanel());
      
      header.appendChild(title);
      header.appendChild(toggleButton);
      this.panel.appendChild(header);
      
      // Create content container
      this.content = document.createElement('div');
      this.content.className = 'performance-content';
      this.content.style.display = this.options.expanded ? 'block' : 'none';
      this.panel.appendChild(this.content);
      
      // Create metrics display
      this.metricsDisplay = document.createElement('div');
      this.metricsDisplay.className = 'metrics-display';
      this.content.appendChild(this.metricsDisplay);
      
      // Create optimization controls
      const optimizationControls = document.createElement('div');
      optimizationControls.className = 'optimization-controls';
      
      // Add toggle switches for optimizations
      this.createOptimizationToggle(optimizationControls, 'Barnes-Hut Algorithm', 'barnesHut');
      this.createOptimizationToggle(optimizationControls, 'Level of Detail', 'lod');
      this.createOptimizationToggle(optimizationControls, 'Orbit Optimization', 'orbitOptimization');
      this.createOptimizationToggle(optimizationControls, 'Adaptive Physics', 'adaptivePhysics');
      
      this.content.appendChild(optimizationControls);
      
      // Add to container
      this.container.appendChild(this.panel);
      
      // Initial render
      this.updateDisplay();
    } catch (error) {
      console.error('Error initializing performance monitor UI:', error);
    }
  }

  /**
   * Create a toggle switch for an optimization option
   * @param {Element} container - Container element
   * @param {String} label - Label text
   * @param {String} option - Optimization option key
   */
  createOptimizationToggle(container, label, option) {
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'toggle-container';
    
    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'toggle-label';
    toggleLabel.textContent = label;
    
    const toggle = document.createElement('label');
    toggle.className = 'toggle-switch';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = this.optimizations[option];
    input.addEventListener('change', () => {
      this.optimizations[option] = input.checked;
      this.onOptimizationChanged(option, input.checked);
    });
    
    const slider = document.createElement('span');
    slider.className = 'slider';
    
    toggle.appendChild(input);
    toggle.appendChild(slider);
    
    toggleContainer.appendChild(toggleLabel);
    toggleContainer.appendChild(toggle);
    
    container.appendChild(toggleContainer);
  }

  /**
   * Toggle the panel expanded/collapsed state
   */
  togglePanel() {
    this.options.expanded = !this.options.expanded;
    this.content.style.display = this.options.expanded ? 'block' : 'none';
    
    // Update toggle button text
    const toggleButton = this.panel.querySelector('.toggle-button');
    if (toggleButton) {
      toggleButton.textContent = this.options.expanded ? '▼' : '▲';
    }
  }

  /**
   * Start the update loop
   */
  startUpdateLoop() {
    // Update at specified interval
    this.updateInterval = setInterval(() => {
      this.updateDisplay();
    }, this.options.updateInterval);
  }

  /**
   * Update the display with current metrics
   */
  updateDisplay() {
    try {
      if (!this.metricsDisplay) return;
      
      // Clear current metrics
      this.metricsDisplay.innerHTML = '';
      
      // Create metrics table
      const table = document.createElement('table');
      
      // Add FPS row
      if (this.options.showFPS) {
        const row = document.createElement('tr');
        const label = document.createElement('td');
        label.textContent = 'FPS:';
        const value = document.createElement('td');
        value.textContent = this.metrics.fps.toFixed(1);
        row.appendChild(label);
        row.appendChild(value);
        table.appendChild(row);
      }
      
      // Add frame time row
      const frameRow = document.createElement('tr');
      const frameLabel = document.createElement('td');
      frameLabel.textContent = 'Frame Time:';
      const frameValue = document.createElement('td');
      frameValue.textContent = `${this.metrics.frameTime.toFixed(2)} ms`;
      frameRow.appendChild(frameLabel);
      frameRow.appendChild(frameValue);
      table.appendChild(frameRow);
      
      // Add average frame time row
      if (this.options.showAverage) {
        const avgRow = document.createElement('tr');
        const avgLabel = document.createElement('td');
        avgLabel.textContent = 'Avg Frame Time:';
        const avgValue = document.createElement('td');
        avgValue.textContent = `${this.metrics.avgFrameTime.toFixed(2)} ms`;
        avgRow.appendChild(avgLabel);
        avgRow.appendChild(avgValue);
        table.appendChild(avgRow);
      }
      
      // Add physics time row
      if (this.options.showPhysicsTime) {
        const physicsRow = document.createElement('tr');
        const physicsLabel = document.createElement('td');
        physicsLabel.textContent = 'Physics Time:';
        const physicsValue = document.createElement('td');
        physicsValue.textContent = `${this.metrics.physicsTime.toFixed(2)} ms`;
        physicsRow.appendChild(physicsLabel);
        physicsRow.appendChild(physicsValue);
        table.appendChild(physicsRow);
      }
      
      // Add render time row
      if (this.options.showRenderTime) {
        const renderRow = document.createElement('tr');
        const renderLabel = document.createElement('td');
        renderLabel.textContent = 'Render Time:';
        const renderValue = document.createElement('td');
        renderValue.textContent = `${this.metrics.renderTime.toFixed(2)} ms`;
        renderRow.appendChild(renderLabel);
        renderRow.appendChild(renderValue);
        table.appendChild(renderRow);
      }
      
      // Add object count row
      if (this.options.showObjectCount) {
        const objectRow = document.createElement('tr');
        const objectLabel = document.createElement('td');
        objectLabel.textContent = 'Objects:';
        const objectValue = document.createElement('td');
        objectValue.textContent = this.metrics.objectCount;
        objectRow.appendChild(objectLabel);
        objectRow.appendChild(objectValue);
        table.appendChild(objectRow);
      }
      
      // Add table to metrics display
      this.metricsDisplay.appendChild(table);
    } catch (error) {
      console.error('Error updating performance display:', error);
    }
  }

  /**
   * Update metrics with the latest data
   * @param {Object} metrics - Performance metrics
   */
  updateMetrics(metrics) {
    // Update metrics
    Object.assign(this.metrics, metrics);
    
    // Update FPS counter
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFPSUpdateTime;
    
    if (elapsed >= 1000) { // Update FPS every second
      this.metrics.fps = (this.frameCount * 1000) / elapsed;
      this.frameCount = 0;
      this.lastFPSUpdateTime = now;
    }
  }

  /**
   * Register an optimization change callback
   * @param {Function} callback - Callback function
   */
  setOptimizationCallback(callback) {
    this.onOptimizationChanged = callback;
  }

  /**
   * Default optimization change handler (override with setOptimizationCallback)
   * @param {String} option - Optimization option key
   * @param {Boolean} enabled - Whether the optimization is enabled
   */
  onOptimizationChanged(option, enabled) {
    console.log(`Optimization ${option} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Show the performance monitor
   */
  show() {
    if (this.panel) {
      this.panel.style.display = 'block';
    }
  }

  /**
   * Hide the performance monitor
   */
  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    // Clear update interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    // Remove event listeners
    const toggleButton = this.panel?.querySelector('.toggle-button');
    if (toggleButton) {
      toggleButton.removeEventListener('click', null);
    }
    
    const toggleInputs = this.panel?.querySelectorAll('input[type="checkbox"]');
    if (toggleInputs) {
      toggleInputs.forEach(input => {
        input.removeEventListener('change', null);
      });
    }
    
    // Remove panel from DOM
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
  }
}

module.exports = PerformanceMonitor;