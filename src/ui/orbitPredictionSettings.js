/**
 * Dialog for configuring orbit prediction settings
 */

class OrbitPredictionSettings {
  /**
   * Create a new orbit prediction settings dialog
   * @param {Object} options - Default options for orbit prediction
   * @param {Function} onSave - Callback when settings are saved
   */
  constructor(options = {}, onSave = null) {
    this.options = Object.assign({
      numSteps: 1000,
      timeStepDays: 1,
      opacity: 0.6,
      detail: 1
    }, options);
    
    this.onSave = onSave;
    this.dialogElement = null;
    
    this.createDialog();
  }
  
  /**
   * Create the dialog element
   */
  createDialog() {
    try {
      // Create dialog container
      this.dialogElement = document.createElement('div');
      this.dialogElement.className = 'orbit-settings-dialog';
      this.dialogElement.style.display = 'none';
      
      // Create dialog content
      const content = document.createElement('div');
      content.className = 'orbit-settings-content';
      
      // Add title
      const title = document.createElement('h3');
      title.textContent = 'Orbit Prediction Settings';
      content.appendChild(title);
      
      // Create form for settings
      const form = document.createElement('form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
      
      // Add settings fields
      form.appendChild(this.createSlider('numSteps', 'Prediction Length', 100, 5000, 100, this.options.numSteps));
      form.appendChild(this.createSlider('timeStepDays', 'Time Step (days)', 0.1, 10, 0.1, this.options.timeStepDays));
      form.appendChild(this.createSlider('opacity', 'Line Opacity', 0.1, 1, 0.1, this.options.opacity));
      form.appendChild(this.createSlider('detail', 'Detail Level', 1, 10, 1, this.options.detail));
      
      // Add buttons
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.textContent = 'Cancel';
      cancelButton.addEventListener('click', () => this.hideDialog());
      
      const saveButton = document.createElement('button');
      saveButton.type = 'submit';
      saveButton.textContent = 'Save Settings';
      
      buttonContainer.appendChild(cancelButton);
      buttonContainer.appendChild(saveButton);
      
      form.appendChild(buttonContainer);
      content.appendChild(form);
      
      // Add content to dialog
      this.dialogElement.appendChild(content);
      
      // Add dialog to document
      document.body.appendChild(this.dialogElement);
      
      // Add close button
      const closeButton = document.createElement('span');
      closeButton.className = 'close-button';
      closeButton.innerHTML = '&times;';
      closeButton.addEventListener('click', () => this.hideDialog());
      content.appendChild(closeButton);
      
      // Add click outside to close
      this.dialogElement.addEventListener('click', (e) => {
        if (e.target === this.dialogElement) {
          this.hideDialog();
        }
      });
    } catch (error) {
      console.error('Error creating orbit prediction settings dialog:', error);
    }
  }
  
  /**
   * Create a slider input with label
   * @param {String} id - Input ID
   * @param {String} label - Input label
   * @param {Number} min - Minimum value
   * @param {Number} max - Maximum value
   * @param {Number} step - Step value
   * @param {Number} value - Current value
   * @returns {HTMLElement} - Form group element
   */
  createSlider(id, label, min, max, step, value) {
    const group = document.createElement('div');
    group.className = 'form-group';
    
    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    
    const inputElement = document.createElement('input');
    inputElement.type = 'range';
    inputElement.id = id;
    inputElement.min = min;
    inputElement.max = max;
    inputElement.step = step;
    inputElement.value = value;
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'value-display';
    valueDisplay.textContent = value;
    
    inputElement.addEventListener('input', () => {
      valueDisplay.textContent = inputElement.value;
    });
    
    group.appendChild(labelElement);
    group.appendChild(inputElement);
    group.appendChild(valueDisplay);
    
    return group;
  }
  
  /**
   * Show the dialog
   */
  showDialog() {
    if (this.dialogElement) {
      this.dialogElement.style.display = 'flex';
    }
  }
  
  /**
   * Hide the dialog
   */
  hideDialog() {
    if (this.dialogElement) {
      this.dialogElement.style.display = 'none';
    }
  }
  
  /**
   * Save the settings and call the onSave callback
   */
  saveSettings() {
    try {
      const numSteps = parseInt(document.getElementById('numSteps').value);
      const timeStepDays = parseFloat(document.getElementById('timeStepDays').value);
      const opacity = parseFloat(document.getElementById('opacity').value);
      const detail = parseInt(document.getElementById('detail').value);
      
      this.options = {
        numSteps,
        timeStepDays,
        opacity,
        detail
      };
      
      if (typeof this.onSave === 'function') {
        this.onSave(this.options);
      }
      
      this.hideDialog();
    } catch (error) {
      console.error('Error saving orbit prediction settings:', error);
    }
  }
  
  /**
   * Get the current settings
   * @returns {Object} - Current settings
   */
  getSettings() {
    return { ...this.options };
  }
  
  /**
   * Set new settings
   * @param {Object} options - New settings
   */
  setSettings(options) {
    this.options = Object.assign({}, this.options, options);
    
    // Update form values if dialog exists
    if (this.dialogElement) {
      const numStepsInput = document.getElementById('numSteps');
      const timeStepDaysInput = document.getElementById('timeStepDays');
      const opacityInput = document.getElementById('opacity');
      const detailInput = document.getElementById('detail');
      
      if (numStepsInput) {
        numStepsInput.value = this.options.numSteps;
        numStepsInput.nextElementSibling.textContent = this.options.numSteps;
      }
      
      if (timeStepDaysInput) {
        timeStepDaysInput.value = this.options.timeStepDays;
        timeStepDaysInput.nextElementSibling.textContent = this.options.timeStepDays;
      }
      
      if (opacityInput) {
        opacityInput.value = this.options.opacity;
        opacityInput.nextElementSibling.textContent = this.options.opacity;
      }
      
      if (detailInput) {
        detailInput.value = this.options.detail;
        detailInput.nextElementSibling.textContent = this.options.detail;
      }
    }
  }
  
  /**
   * Dispose of the dialog
   */
  dispose() {
    if (this.dialogElement && this.dialogElement.parentNode) {
      this.dialogElement.parentNode.removeChild(this.dialogElement);
    }
    
    this.dialogElement = null;
    this.onSave = null;
  }
}

module.exports = OrbitPredictionSettings;