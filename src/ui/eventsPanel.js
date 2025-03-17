/**
 * Events Panel for displaying astronomical events
 */

class EventsPanel {
  /**
   * Create a new events panel
   * @param {HTMLElement} container - Container element for the panel
   */
  constructor(container) {
    this.container = container;
    this.events = [];
    this.visible = false;
    this.maxEvents = 10; // Maximum number of events to display
    this.filterType = 'all';
    this.lastUpdateTime = 0;
    this.updateInterval = 1000; // Update display every 1000ms
    
    // Initialize the panel
    this.initPanel();
  }
  
  /**
   * Initialize the panel UI elements
   */
  initPanel() {
    try {
      // Create panel elements if they don't exist
      if (!this.panel) {
        // Main panel container
        this.panel = document.createElement('div');
        this.panel.className = 'events-panel';
        this.panel.style.display = this.visible ? 'block' : 'none';
        
        // Panel header
        const header = document.createElement('div');
        header.className = 'events-panel-header';
        
        const title = document.createElement('h3');
        title.textContent = 'Astronomical Events';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.title = 'Close panel';
        closeButton.addEventListener('click', () => this.hide());
        
        header.appendChild(title);
        header.appendChild(closeButton);
        this.panel.appendChild(header);
        
        // Panel controls
        const controls = document.createElement('div');
        controls.className = 'events-panel-controls';
        
        // Filter dropdown
        const filterLabel = document.createElement('label');
        filterLabel.textContent = 'Show: ';
        filterLabel.htmlFor = 'event-filter';
        
        const filterSelect = document.createElement('select');
        filterSelect.id = 'event-filter';
        
        const filterOptions = [
          { value: 'all', text: 'All Events' },
          { value: 'conjunction', text: 'Conjunctions' },
          { value: 'opposition', text: 'Oppositions' },
          { value: 'eclipse', text: 'Eclipses' },
          { value: 'closeApproach', text: 'Close Approaches' }
        ];
        
        filterOptions.forEach(option => {
          const optElement = document.createElement('option');
          optElement.value = option.value;
          optElement.textContent = option.text;
          filterSelect.appendChild(optElement);
        });
        
        filterSelect.addEventListener('change', () => {
          this.filterType = filterSelect.value;
          this.updateDisplay(); // Update display when filter changes
        });
        
        controls.appendChild(filterLabel);
        controls.appendChild(filterSelect);
        this.panel.appendChild(controls);
        
        // Events list container
        this.eventsList = document.createElement('div');
        this.eventsList.className = 'events-list';
        this.panel.appendChild(this.eventsList);
        
        // Empty state message
        this.emptyState = document.createElement('div');
        this.emptyState.className = 'empty-state';
        this.emptyState.textContent = 'No events detected yet. Events will appear here as they occur.';
        this.eventsList.appendChild(this.emptyState);
        
        // Add to container
        this.container.appendChild(this.panel);
      }
    } catch (error) {
      console.error('Error initializing events panel:', error);
    }
  }
  
  /**
   * Update the events list with current events
   * @param {Array} events - Array of astronomical events
   * @param {Number} currentTime - Current time (for throttling updates)
   */
  updateEvents(events, currentTime) {
    try {
      // Store the events
      this.events = events || [];
      
      // Only update the display if enough time has passed or we have no previous events
      if (currentTime - this.lastUpdateTime > this.updateInterval || this.events.length === 0) {
        this.lastUpdateTime = currentTime;
        this.updateDisplay();
      }
    } catch (error) {
      console.error('Error updating events:', error);
    }
  }
  
  /**
   * Update the display with filtered events
   */
  updateDisplay() {
    try {
      // Clear the list
      while (this.eventsList.firstChild) {
        this.eventsList.removeChild(this.eventsList.firstChild);
      }
      
      // Filter events
      const filteredEvents = this.filterEvents();
      
      // Show empty state if no events
      if (filteredEvents.length === 0) {
        this.eventsList.appendChild(this.emptyState);
        return;
      }
      
      // Add events to list
      filteredEvents.forEach(event => {
        const eventElement = this.createEventElement(event);
        this.eventsList.appendChild(eventElement);
      });
    } catch (error) {
      console.error('Error updating events display:', error);
    }
  }
  
  /**
   * Filter events based on current filter type
   * @returns {Array} - Filtered events
   */
  filterEvents() {
    try {
      // Sort events by time (newest first)
      const sortedEvents = [...this.events].sort((a, b) => b.time - a.time);
      
      // Apply filter
      let filteredEvents = sortedEvents;
      if (this.filterType !== 'all') {
        filteredEvents = sortedEvents.filter(event => event.type === this.filterType);
      }
      
      // Limit to max number of events
      return filteredEvents.slice(0, this.maxEvents);
    } catch (error) {
      console.error('Error filtering events:', error);
      return [];
    }
  }
  
  /**
   * Create an HTML element for an event
   * @param {Object} event - Event object
   * @returns {HTMLElement} - Event element
   */
  createEventElement(event) {
    try {
      const eventElement = document.createElement('div');
      eventElement.className = `event-item event-${event.type}`;
      
      // Event icon
      const icon = document.createElement('div');
      icon.className = 'event-icon';
      
      // Set icon based on event type
      switch (event.type) {
        case 'conjunction':
          icon.innerHTML = '⚡'; // Lightning bolt for conjunction
          break;
        case 'opposition':
          icon.innerHTML = '⊕'; // Circle with dot for opposition
          break;
        case 'eclipse':
          icon.innerHTML = '◍'; // Circle with inner circle for eclipse
          break;
        case 'closeApproach':
          icon.innerHTML = '⊙'; // Target symbol for close approach
          break;
        default:
          icon.innerHTML = '★'; // Star for unknown event
      }
      
      eventElement.appendChild(icon);
      
      // Event content
      const content = document.createElement('div');
      content.className = 'event-content';
      
      // Event title
      const title = document.createElement('div');
      title.className = 'event-title';
      title.textContent = this.formatEventTitle(event);
      content.appendChild(title);
      
      // Event description
      const description = document.createElement('div');
      description.className = 'event-description';
      description.textContent = event.description;
      content.appendChild(description);
      
      // Event time
      const time = document.createElement('div');
      time.className = 'event-time';
      time.textContent = this.formatTime(event.time);
      content.appendChild(time);
      
      eventElement.appendChild(content);
      
      // Focus button
      if (event.objects && event.objects.length > 0) {
        const focusButton = document.createElement('button');
        focusButton.className = 'focus-button';
        focusButton.textContent = 'Focus';
        focusButton.title = 'Focus camera on this event';
        focusButton.dataset.objects = JSON.stringify(event.objects);
        focusButton.addEventListener('click', () => {
          // Emit a custom event that SolarSystemApp can listen for
          const focusEvent = new CustomEvent('focus-event', { 
            detail: { 
              objects: event.objects 
            } 
          });
          document.dispatchEvent(focusEvent);
        });
        
        eventElement.appendChild(focusButton);
      }
      
      return eventElement;
    } catch (error) {
      console.error('Error creating event element:', error);
      
      // Return a basic element as fallback
      const fallbackElement = document.createElement('div');
      fallbackElement.className = 'event-item';
      fallbackElement.textContent = 'Event display error';
      return fallbackElement;
    }
  }
  
  /**
   * Format an event title based on event type
   * @param {Object} event - Event object
   * @returns {String} - Formatted title
   */
  formatEventTitle(event) {
    try {
      switch (event.type) {
        case 'conjunction':
          return `Conjunction: ${event.objects.join(' & ')}`;
        case 'opposition':
          return `Opposition: ${event.objects[1]} opposite to ${event.objects[0]}`;
        case 'eclipse':
          return `${event.subtype === 'total' ? 'Total' : 'Partial'} Eclipse: ${event.objects[0]} eclipses ${event.objects[1]}`;
        case 'closeApproach':
          return `Close Approach: ${event.objects.join(' & ')}`;
        default:
          return `Astronomical Event: ${event.objects.join(', ')}`;
      }
    } catch (error) {
      console.error('Error formatting event title:', error);
      return 'Astronomical Event';
    }
  }
  
  /**
   * Format a timestamp as a readable time
   * @param {Number} timestamp - Timestamp to format
   * @returns {String} - Formatted time
   */
  formatTime(timestamp) {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown time';
    }
  }
  
  /**
   * Show the events panel
   */
  show() {
    this.visible = true;
    if (this.panel) {
      this.panel.style.display = 'block';
    }
  }
  
  /**
   * Hide the events panel
   */
  hide() {
    this.visible = false;
    if (this.panel) {
      this.panel.style.display = 'none';
    }
  }
  
  /**
   * Toggle the visibility of the events panel
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * Set the maximum number of events to display
   * @param {Number} max - Maximum number of events
   */
  setMaxEvents(max) {
    this.maxEvents = max;
    this.updateDisplay();
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    try {
      // Remove event listeners
      const closeButton = this.panel?.querySelector('.close-button');
      if (closeButton) {
        closeButton.removeEventListener('click', this.hide);
      }
      
      const filterSelect = this.panel?.querySelector('#event-filter');
      if (filterSelect) {
        filterSelect.removeEventListener('change', this.updateDisplay);
      }
      
      // Remove focus button event listeners
      const focusButtons = this.panel?.querySelectorAll('.focus-button');
      if (focusButtons) {
        focusButtons.forEach(button => {
          button.removeEventListener('click', null);
        });
      }
      
      // Remove panel from container
      if (this.panel && this.panel.parentNode) {
        this.panel.parentNode.removeChild(this.panel);
      }
      
      // Clean up references
      this.panel = null;
      this.eventsList = null;
      this.emptyState = null;
      this.events = [];
    } catch (error) {
      console.error('Error disposing events panel:', error);
    }
  }
}

module.exports = EventsPanel;