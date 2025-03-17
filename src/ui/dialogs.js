// dialogs.js - Handles all dialog UI components
const { Vector3 } = require('three');

/**
 * Creates a modal dialog for adding new celestial objects
 * @param {Function} onSubmit - Callback for when the dialog is submitted
 * @param {Function} onCancel - Callback for when the dialog is canceled
 * @returns {HTMLElement} The dialog DOM element
 */
function createObjectDialog(onSubmit, onCancel) {
  // Create dialog container
  const dialog = document.createElement('div');
  dialog.className = 'modal-dialog';
  
  // Create dialog content
  const dialogContent = document.createElement('div');
  dialogContent.className = 'dialog-content';
  dialog.appendChild(dialogContent);
  
  // Create header
  const header = document.createElement('div');
  header.className = 'dialog-header';
  header.innerHTML = `<h2>Create New Celestial Object</h2>`;
  dialogContent.appendChild(header);
  
  // Create form
  const form = document.createElement('form');
  form.className = 'dialog-form';
  dialogContent.appendChild(form);
  
  // Basic properties section
  const basicProps = document.createElement('div');
  basicProps.className = 'form-section';
  basicProps.innerHTML = `
    <h3>Basic Properties</h3>
    <div class="form-row">
      <label for="object-name">Name:</label>
      <input type="text" id="object-name" required>
    </div>
    <div class="form-row">
      <label for="object-type">Type:</label>
      <select id="object-type">
        <option value="planet">Planet</option>
        <option value="star">Star</option>
        <option value="moon">Moon</option>
        <option value="asteroid">Asteroid</option>
        <option value="comet">Comet</option>
      </select>
    </div>
    <div class="form-row">
      <label for="object-mass">Mass (kg):</label>
      <input type="number" id="object-mass" min="1e10" value="5.97e24" required>
      <span class="input-note">Earth = 5.97e24 kg</span>
    </div>
    <div class="form-row">
      <label for="object-radius">Radius (km):</label>
      <input type="number" id="object-radius" min="1" value="6371" required>
      <span class="input-note">Earth = 6371 km</span>
    </div>
    <div class="form-row">
      <label for="object-color">Color:</label>
      <input type="color" id="object-color" value="#3366cc">
      <span class="checkbox-container">
        <input type="checkbox" id="use-texture">
        <label for="use-texture">Use default texture</label>
      </span>
    </div>
  `;
  form.appendChild(basicProps);
  
  // Position and velocity section
  const positionSection = document.createElement('div');
  positionSection.className = 'form-section';
  positionSection.innerHTML = `
    <h3>Position & Velocity</h3>
    <div class="form-row three-col">
      <div>
        <label for="pos-x">Position X (AU):</label>
        <input type="number" id="pos-x" value="1.0" step="0.1" required>
      </div>
      <div>
        <label for="pos-y">Position Y (AU):</label>
        <input type="number" id="pos-y" value="0.0" step="0.1" required>
      </div>
      <div>
        <label for="pos-z">Position Z (AU):</label>
        <input type="number" id="pos-z" value="0.0" step="0.1" required>
      </div>
    </div>
    <div class="form-row three-col">
      <div>
        <label for="vel-x">Velocity X (km/s):</label>
        <input type="number" id="vel-x" value="0.0" step="0.1" required>
      </div>
      <div>
        <label for="vel-y">Velocity Y (km/s):</label>
        <input type="number" id="vel-y" value="29.8" step="0.1" required>
      </div>
      <div>
        <label for="vel-z">Velocity Z (km/s):</label>
        <input type="number" id="vel-z" value="0.0" step="0.1" required>
      </div>
    </div>
    <div class="form-row">
      <span class="input-note">Earth orbits at 1 AU with approx. 29.8 km/s tangential velocity</span>
    </div>
  `;
  form.appendChild(positionSection);
  
  // Advanced properties section (collapsible)
  const advancedSection = document.createElement('div');
  advancedSection.className = 'form-section collapsible collapsed';
  advancedSection.innerHTML = `
    <h3 class="collapsible-header">Advanced Properties <span class="toggle-icon">+</span></h3>
    <div class="collapsible-content">
      <div class="form-row">
        <label for="object-rotation">Rotation Period (hours):</label>
        <input type="number" id="object-rotation" min="0" value="24" step="0.1">
        <span class="input-note">Earth = 24 hours</span>
      </div>
      <div class="form-row">
        <label for="object-tilt">Axial Tilt (degrees):</label>
        <input type="number" id="object-tilt" min="0" max="180" value="23.5" step="0.1">
        <span class="input-note">Earth = 23.5°</span>
      </div>
      <div class="form-row">
        <label for="object-temp">Surface Temperature (K):</label>
        <input type="number" id="object-temp" min="0" value="288" step="1">
        <span class="input-note">Earth = 288 K (15°C)</span>
      </div>
      <div class="form-row">
        <label for="object-atmosphere">Has Atmosphere:</label>
        <input type="checkbox" id="object-atmosphere" checked>
      </div>
    </div>
  `;
  form.appendChild(advancedSection);
  
  // Buttons
  const buttons = document.createElement('div');
  buttons.className = 'dialog-buttons';
  buttons.innerHTML = `
    <button type="button" id="dialog-cancel" class="btn-secondary">Cancel</button>
    <button type="submit" id="dialog-submit" class="btn-primary">Create Object</button>
  `;
  dialogContent.appendChild(buttons);
  
  // Add event listeners
  const cancelButton = buttons.querySelector('#dialog-cancel');
  cancelButton.addEventListener('click', () => {
    onCancel();
    document.body.removeChild(dialog);
  });
  
  // Collapsible section
  const collapsibleHeader = advancedSection.querySelector('.collapsible-header');
  collapsibleHeader.addEventListener('click', () => {
    advancedSection.classList.toggle('collapsed');
    const toggleIcon = collapsibleHeader.querySelector('.toggle-icon');
    toggleIcon.textContent = advancedSection.classList.contains('collapsed') ? '+' : '-';
  });
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const data = {
      name: form.querySelector('#object-name').value,
      type: form.querySelector('#object-type').value,
      mass: parseFloat(form.querySelector('#object-mass').value),
      radius: parseFloat(form.querySelector('#object-radius').value),
      color: form.querySelector('#object-color').value,
      useTexture: form.querySelector('#use-texture').checked,
      position: new Vector3(
        parseFloat(form.querySelector('#pos-x').value),
        parseFloat(form.querySelector('#pos-y').value),
        parseFloat(form.querySelector('#pos-z').value)
      ),
      velocity: new Vector3(
        parseFloat(form.querySelector('#vel-x').value),
        parseFloat(form.querySelector('#vel-y').value),
        parseFloat(form.querySelector('#vel-z').value)
      ),
      rotationPeriod: parseFloat(form.querySelector('#object-rotation').value),
      axialTilt: parseFloat(form.querySelector('#object-tilt').value),
      temperature: parseFloat(form.querySelector('#object-temp').value),
      hasAtmosphere: form.querySelector('#object-atmosphere').checked
    };
    
    onSubmit(data);
    document.body.removeChild(dialog);
  });
  
  // Append dialog to body
  document.body.appendChild(dialog);
  
  // Focus the first input
  setTimeout(() => {
    form.querySelector('#object-name').focus();
  }, 100);
  
  return dialog;
}

module.exports = {
  createObjectDialog
};
