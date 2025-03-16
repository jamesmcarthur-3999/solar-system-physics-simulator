# Developer Guide: Solar System Physics Simulator

This document provides technical guidance for developers working on the Solar System Physics Simulator. It outlines development practices, common tasks, and solutions to known technical challenges.

## Development Setup

1. **Clone the repository**
   ```
   git clone https://github.com/jamesmcarthur-3999/solar-system-physics-simulator.git
   cd solar-system-physics-simulator
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Run the application**
   ```
   npm start
   ```

4. **Development mode** (with auto-reload and DevTools)
   ```
   # In package.json, modify the start script:
   "start": "NODE_ENV=development electron ."
   
   # Then run:
   npm start
   ```

## Module System Standardization

The project currently mixes CommonJS and ES Modules. Here are steps to standardize:

### Option 1: Convert to ES Modules (Recommended)

1. **Update package.json**
   ```json
   {
     "type": "module"
   }
   ```

2. **Convert main.js to ES Modules**
   ```javascript
   // Replace:
   const { app, BrowserWindow } = require('electron');
   const path = require('path');
   
   // With:
   import { app, BrowserWindow } from 'electron';
   import path from 'path';
   import { fileURLToPath } from 'url';
   
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);
   ```

3. **Convert preload.js to ES Modules**
   ```javascript
   // Replace:
   const { contextBridge, ipcRenderer } = require('electron');
   
   // With:
   import { contextBridge, ipcRenderer } from 'electron';
   ```

4. **Update HTML files**
   ```html
   <!-- Add type="module" to script tags -->
   <script src="./renderer.js" type="module"></script>
   ```

### Option 2: Convert to CommonJS

1. **Convert all files to use CommonJS**
   ```javascript
   // Replace:
   import * as THREE from 'three';
   export class SceneManager { ... }
   
   // With:
   const THREE = require('three');
   class SceneManager { ... }
   module.exports = { SceneManager };
   ```

## Asset Path Resolution

Current asset paths won't work correctly in the Electron environment. Here's how to fix:

1. **Expose app paths in preload.js**
   ```javascript
   // Add to preload.js
   contextBridge.exposeInMainWorld('paths', {
     assets: path.join(__dirname, '../assets')
   });
   ```

2. **Update texture loading in CelestialObject.js**
   ```javascript
   // Replace:
   const texture = textureLoader.load(this.texturePath);
   
   // With:
   let texturePath = this.texturePath;
   if (texturePath.startsWith('../')) {
     texturePath = window.paths.assets + texturePath.substring(2);
   }
   const texture = textureLoader.load(texturePath);
   ```

3. **Add error handling**
   ```javascript
   const textureLoader = new THREE.TextureLoader();
   let material;
   
   try {
     const texture = textureLoader.load(texturePath);
     material = new THREE.MeshPhongMaterial({ map: texture });
   } catch (error) {
     console.warn(`Failed to load texture: ${texturePath}`, error);
     material = new THREE.MeshPhongMaterial({ color: this.color });
   }
   ```

## Resource Cleanup and Memory Management

To prevent memory leaks and ensure good performance:

1. **Add cleanup method to SceneManager**
   ```javascript
   cleanup() {
     // Remove event listeners
     window.removeEventListener('resize', this.onWindowResize);
     
     // Dispose Three.js resources
     this.scene.traverse(object => {
       if (object.geometry) object.geometry.dispose();
       if (object.material) {
         if (Array.isArray(object.material)) {
           object.material.forEach(material => material.dispose());
         } else {
           object.material.dispose();
         }
       }
     });
     
     // Dispose renderer
     this.renderer.dispose();
     
     // Remove renderer DOM element
     if (this.renderer.domElement && this.renderer.domElement.parentNode) {
       this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
     }
   }
   ```

2. **Limit orbit history points**
   ```javascript
   // In CelestialObject.js, updateOrbitTrail method:
   updateOrbitTrail() {
     const maxPoints = 500; // Maximum number of points to store
     
     // Add current position to orbit points
     this.orbitPoints.push(new THREE.Vector3().copy(this.position));
     
     // Remove oldest point if we exceed maxPoints
     if (this.orbitPoints.length > maxPoints) {
       this.orbitPoints.shift();
     }
   }
   ```

## Physics Calculation Improvements

To improve physics accuracy and performance:

1. **Scale normalization for better precision**
   ```javascript
   // Add to physics/gravitySimulator.js
   
   // Constants for normalization
   const DISTANCE_SCALE = 1.496e11; // 1 AU in meters
   const MASS_SCALE = 1.989e30; // Solar mass
   const TIME_SCALE = 86400; // 1 day in seconds
   
   // Normalize values for computation
   normalize(vector, scale) {
     return new THREE.Vector3(
       vector.x / scale,
       vector.y / scale,
       vector.z / scale
     );
   }
   
   // Denormalize values for display
   denormalize(vector, scale) {
     return new THREE.Vector3(
       vector.x * scale,
       vector.y * scale,
       vector.z * scale
     );
   }
   ```

2. **Use Verlet integration for more stable orbits**
   ```javascript
   // In CelestialObject.js, replace updatePosition method
   
   // Store previous position for Verlet integration
   constructor(options) {
     // ... existing code ...
     this.previousPosition = new THREE.Vector3().copy(this.position);
   }
   
   // Update position using Verlet integration
   updatePosition(dt) {
     // Store current position for next iteration
     const currentPosition = new THREE.Vector3().copy(this.position);
     
     // Verlet integration formula: x(t+dt) = 2*x(t) - x(t-dt) + a(t)*dt^2
     this.position.x = 2 * this.position.x - this.previousPosition.x + this.acceleration.x * dt * dt;
     this.position.y = 2 * this.position.y - this.previousPosition.y + this.acceleration.y * dt * dt;
     this.position.z = 2 * this.position.z - this.previousPosition.z + this.acceleration.z * dt * dt;
     
     // Calculate velocity (for information, not used in position update)
     this.velocity.x = (this.position.x - this.previousPosition.x) / dt;
     this.velocity.y = (this.position.y - this.previousPosition.y) / dt;
     this.velocity.z = (this.position.z - this.previousPosition.z) / dt;
     
     // Store current position as previous for next iteration
     this.previousPosition.copy(currentPosition);
     
     // Update mesh position
     this.mesh.position.copy(this.position);
     
     // Clear acceleration for next calculation
     this.acceleration.set(0, 0, 0);
     
     // Update orbit trail
     this.updateOrbitTrail();
   }
   ```

## Error Handling

Add comprehensive error handling throughout the application:

1. **General error boundary in renderer.js**
   ```javascript
   // Add to SolarSystemApp class
   
   // Error handler
   handleError(error, context) {
     console.error(`Error in ${context}:`, error);
     
     // Show error in UI
     const errorDiv = document.createElement('div');
     errorDiv.className = 'error-message';
     errorDiv.textContent = `An error occurred: ${error.message}`;
     
     // Add to document body
     document.body.appendChild(errorDiv);
     
     // Auto-remove after 5 seconds
     setTimeout(() => {
       if (errorDiv.parentNode) {
         errorDiv.parentNode.removeChild(errorDiv);
       }
     }, 5000);
   }
   
   // Wrap critical methods with try/catch
   init() {
     try {
       console.log('Solar System Simulator initializing...');
       // ... rest of init code ...
     } catch (error) {
       this.handleError(error, 'initialization');
     }
   }
   ```

2. **Add CSS for error messages**
   ```css
   /* Add to styles.css */
   .error-message {
     position: fixed;
     bottom: 20px;
     left: 20px;
     background-color: #f44336;
     color: white;
     padding: 10px 15px;
     border-radius: 4px;
     z-index: 1000;
     box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
   }
   ```

## Testing

To implement basic testing:

1. **Add Jest for unit testing**
   ```
   npm install --save-dev jest
   ```

2. **Add test script to package.json**
   ```json
   "scripts": {
     "test": "jest"
   }
   ```

3. **Create a sample test file**
   ```javascript
   // tests/physics.test.js
   const { GravitySimulator } = require('../src/physics/gravitySimulator');
   
   describe('GravitySimulator', () => {
     test('should initialize with empty objects array', () => {
       const simulator = new GravitySimulator();
       expect(simulator.objects).toEqual([]);
     });
     
     test('should add objects correctly', () => {
       const simulator = new GravitySimulator();
       const mockObject = { id: 'test' };
       simulator.addObject(mockObject);
       expect(simulator.objects).toContain(mockObject);
     });
   });
   ```

## Development Workflow

Recommended workflow for new features:

1. **Create a feature branch**
   ```
   git checkout -b feature/descriptive-name
   ```

2. **Implement the feature**
   - Follow code style guidelines
   - Add comprehensive error handling
   - Update documentation as needed

3. **Test the feature**
   - Manual testing in development mode
   - Add unit tests where applicable

4. **Submit a pull request**
   - Include clear description of changes
   - Reference any related issues

## Performance Monitoring

To monitor application performance:

1. **Add FPS monitor**
   ```javascript
   // In SceneManager class
   constructor() {
     // ... existing code ...
     this.frameCount = 0;
     this.lastFpsTime = 0;
     this.fps = 0;
   }
   
   // In animate method
   animate(time) {
     requestAnimationFrame(this.animate.bind(this));
     
     // Calculate FPS
     this.frameCount++;
     if (time - this.lastFpsTime > 1000) {
       this.fps = this.frameCount;
       this.frameCount = 0;
       this.lastFpsTime = time;
       
       // Display FPS if element exists
       const fpsElement = document.getElementById('fps');
       if (fpsElement) {
         fpsElement.textContent = `FPS: ${this.fps}`;
       }
     }
     
     // ... rest of animate method ...
   }
   ```

---

## Common Issues and Solutions

### "Cannot find module" errors
- Check path resolution
- Ensure module system consistency (ES Modules vs CommonJS)
- Verify package.json dependencies

### Texture loading failures
- Use absolute paths
- Add error handling for fallback
- Check file existence

### Physics instability
- Reduce time step for more accurate simulation
- Use Verlet integration instead of Euler integration
- Implement adaptive time stepping based on simulation state

### Memory leaks
- Properly dispose Three.js objects
- Remove event listeners when components are destroyed
- Monitor memory usage with Chrome DevTools

### Poor performance
- Reduce the number of orbit trail points
- Implement level-of-detail rendering
- Use object instancing for similar objects
- Consider implementing Barnes-Hut algorithm for N-body physics

## Advanced Optimization Techniques

### Barnes-Hut Algorithm

For larger simulations (many objects), consider implementing the Barnes-Hut algorithm to reduce the complexity from O(n²) to O(n log n):

```javascript
// Basic Barnes-Hut implementation
class Octree {
  constructor(center, size) {
    this.center = center;
    this.size = size;
    this.mass = 0;
    this.centerOfMass = new THREE.Vector3();
    this.children = [];
    this.body = null;
    this.hasChildren = false;
  }

  // Insert a body into the tree
  insert(body) {
    if (this.body === null && !this.hasChildren) {
      // If node is empty, add body
      this.body = body;
      this.mass = body.mass;
      this.centerOfMass.copy(body.position);
      return;
    }
    
    if (!this.hasChildren) {
      // If node has one body, create children and move existing body
      this.subdivide();
      this.insertIntoChild(this.body);
      this.body = null;
    }
    
    // Insert new body into appropriate child
    this.insertIntoChild(body);
    
    // Update mass and center of mass
    this.mass += body.mass;
    this.centerOfMass.x = (this.centerOfMass.x * (this.mass - body.mass) + 
                           body.position.x * body.mass) / this.mass;
    this.centerOfMass.y = (this.centerOfMass.y * (this.mass - body.mass) + 
                           body.position.y * body.mass) / this.mass;
    this.centerOfMass.z = (this.centerOfMass.z * (this.mass - body.mass) + 
                           body.position.z * body.mass) / this.mass;
  }
  
  // Create 8 children octants
  subdivide() {
    const halfSize = this.size / 2;
    
    // Create 8 octants
    for (let i = 0; i < 8; i++) {
      const x = this.center.x + (i & 1 ? halfSize : -halfSize) / 2;
      const y = this.center.y + (i & 2 ? halfSize : -halfSize) / 2;
      const z = this.center.z + (i & 4 ? halfSize : -halfSize) / 2;
      
      this.children[i] = new Octree(new THREE.Vector3(x, y, z), halfSize);
    }
    
    this.hasChildren = true;
  }
  
  // Insert a body into the appropriate child
  insertIntoChild(body) {
    const index = this.getOctantIndex(body.position);
    this.children[index].insert(body);
  }
  
  // Determine which octant a position belongs to
  getOctantIndex(position) {
    let index = 0;
    if (position.x >= this.center.x) index |= 1;
    if (position.y >= this.center.y) index |= 2;
    if (position.z >= this.center.z) index |= 4;
    return index;
  }
  
  // Calculate force on a body using Barnes-Hut approximation
  calculateForce(body, theta, force) {
    if (this.body === body || (this.mass === 0)) {
      return;
    }
    
    const dx = this.centerOfMass.x - body.position.x;
    const dy = this.centerOfMass.y - body.position.y;
    const dz = this.centerOfMass.z - body.position.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    const dist = Math.sqrt(distSq);
    
    // If distance is 0, skip this calculation
    if (dist === 0) return;
    
    // Check if node is far enough for approximation
    if (!this.hasChildren || (this.size / dist < theta)) {
      // Use approximation - calculate force using node's center of mass
      const f = G * body.mass * this.mass / (distSq * dist);
      force.x += dx * f;
      force.y += dy * f;
      force.z += dz * f;
    } else {
      // Node is too close, traverse children
      for (let i = 0; i < 8; i++) {
        if (this.children[i]) {
          this.children[i].calculateForce(body, theta, force);
        }
      }
    }
  }
}
```

### Implementing the Barnes-Hut algorithm in the GravitySimulator

```javascript
calculateGravitationalForces(dt) {
  // Create octree for Barnes-Hut algorithm
  // Find bounds of all objects
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  
  for (const obj of this.objects) {
    minX = Math.min(minX, obj.position.x);
    minY = Math.min(minY, obj.position.y);
    minZ = Math.min(minZ, obj.position.z);
    maxX = Math.max(maxX, obj.position.x);
    maxY = Math.max(maxY, obj.position.y);
    maxZ = Math.max(maxZ, obj.position.z);
  }
  
  // Create root octree to encompass all objects
  const center = new THREE.Vector3(
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    (minZ + maxZ) / 2
  );
  
  const size = Math.max(
    maxX - minX,
    maxY - minY,
    maxZ - minZ
  ) * 1.1; // Add 10% margin
  
  const octree = new Octree(center, size);
  
  // Insert all objects into octree
  for (const obj of this.objects) {
    octree.insert(obj);
  }
  
  // Calculate forces using Barnes-Hut approximation
  for (const obj of this.objects) {
    const force = new THREE.Vector3(0, 0, 0);
    octree.calculateForce(obj, 0.5, force); // 0.5 is theta parameter
    obj.applyForce(force);
  }
}
```

## Educational Features

To implement educational features as planned:

### 1. Spacetime Visualization

```javascript
// Create a grid to represent spacetime
createSpacetimeGrid() {
  const size = 100;
  const divisions = 20;
  
  const gridHelper = new THREE.GridHelper(size, divisions);
  gridHelper.position.y = -10;
  this.scene.add(gridHelper);
  
  // Store grid points for distortion
  this.gridPoints = [];
  
  const halfSize = size / 2;
  const step = size / divisions;
  
  for (let x = -halfSize; x <= halfSize; x += step) {
    for (let z = -halfSize; z <= halfSize; z += step) {
      this.gridPoints.push({
        original: new THREE.Vector3(x, -10, z),
        current: new THREE.Vector3(x, -10, z),
        mesh: null
      });
    }
  }
  
  // Create visual representation of each grid point
  const geometry = new THREE.SphereGeometry(0.2, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0x444444 });
  
  for (const point of this.gridPoints) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(point.original);
    this.scene.add(mesh);
    point.mesh = mesh;
  }
}

// Update grid distortion based on objects
updateSpacetimeDistortion() {
  for (const point of this.gridPoints) {
    // Reset to original position
    point.current.copy(point.original);
    
    // Apply distortion from each massive object
    for (const obj of this.objects) {
      // Calculate distance
      const dx = obj.position.x - point.original.x;
      const dz = obj.position.z - point.original.z;
      const distSq = dx * dx + dz * dz;
      const dist = Math.sqrt(distSq);
      
      // Skip if too close to prevent extreme distortion
      if (dist < 1) continue;
      
      // Calculate distortion (proportional to mass, inverse to distance)
      const distortionFactor = obj.mass / (dist * dist) * 1e-30;
      
      // Apply distortion to Y coordinate (depth)
      point.current.y -= distortionFactor;
    }
    
    // Update mesh position
    point.mesh.position.copy(point.current);
  }
}
```

### 2. Habitability Indicator

```javascript
// Add to CelestialObject class
calculateHabitability() {
  // Only applicable to planets
  if (this.isStar) return 0;
  
  // Find the star the planet is orbiting
  const star = this.findOrbitalParent();
  if (!star || !star.isStar) return 0;
  
  // Calculate distance to star
  const dx = this.position.x - star.position.x;
  const dy = this.position.y - star.position.y;
  const dz = this.position.z - star.position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  // Convert distance to AU
  const distanceAU = distance / 149597870.7;
  
  // Calculate temperature based on distance and star luminosity
  // Assuming star.luminosity is relative to Sun's luminosity
  const temperature = 278 * Math.sqrt(star.luminosity) / Math.sqrt(distanceAU);
  
  // Calculate habitability score (0-1)
  // Earth-like conditions are around 288K
  const habitabilityScore = 1 - Math.min(1, Math.abs(temperature - 288) / 100);
  
  return habitabilityScore;
}

// Add visual indicator to object
updateHabitabilityIndicator() {
  const habitability = this.calculateHabitability();
  
  // Remove existing indicator if any
  if (this.habitabilityIndicator) {
    this.mesh.remove(this.habitabilityIndicator);
    this.habitabilityIndicator = null;
  }
  
  // Only show for potentially habitable planets
  if (habitability > 0.3) {
    // Create ring indicator
    const geometry = new THREE.RingGeometry(
      this.getDisplayRadius() * 1.2,
      this.getDisplayRadius() * 1.3,
      32
    );
    
    // Color based on habitability (green = habitable, red = not)
    const color = new THREE.Color();
    color.r = 1 - habitability;
    color.g = habitability;
    color.b = 0;
    
    const material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    
    this.habitabilityIndicator = new THREE.Mesh(geometry, material);
    this.habitabilityIndicator.rotation.x = Math.PI / 2;
    this.mesh.add(this.habitabilityIndicator);
  }
}
```

## Advanced User Interface

### Object Creation Dialog

```javascript
// Add to renderer.js
addNewObjectDialog() {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Create New Object</h2>
      <form id="new-object-form">
        <div class="form-group">
          <label for="object-name">Name:</label>
          <input type="text" id="object-name" value="New Object">
        </div>
        
        <div class="form-group">
          <label for="object-type">Type:</label>
          <select id="object-type">
            <option value="planet">Planet</option>
            <option value="moon">Moon</option>
            <option value="asteroid">Asteroid</option>
            <option value="comet">Comet</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="object-mass">Mass (kg):</label>
          <input type="number" id="object-mass" value="1e24">
        </div>
        
        <div class="form-group">
          <label for="object-radius">Radius (km):</label>
          <input type="number" id="object-radius" value="6000">
        </div>
        
        <div class="form-group">
          <label for="object-distance">Distance from Sun (AU):</label>
          <input type="number" id="object-distance" value="1.5" step="0.1">
        </div>
        
        <div class="form-group">
          <label for="object-velocity">Orbital Velocity (km/s):</label>
          <input type="number" id="object-velocity" value="30">
        </div>
        
        <div class="form-group">
          <label for="object-color">Color:</label>
          <input type="color" id="object-color" value="#a0a0a0">
        </div>
        
        <div class="form-buttons">
          <button type="button" id="cancel-object">Cancel</button>
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('cancel-object').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  document.getElementById('new-object-form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('object-name').value;
    const type = document.getElementById('object-type').value;
    const mass = parseFloat(document.getElementById('object-mass').value);
    const radius = parseFloat(document.getElementById('object-radius').value);
    const distance = parseFloat(document.getElementById('object-distance').value);
    const velocity = parseFloat(document.getElementById('object-velocity').value);
    const color = document.getElementById('object-color').value;
    
    // Calculate position and velocity vectors
    const angle = Math.random() * Math.PI * 2;
    const x = distance * Math.cos(angle);
    const z = distance * Math.sin(angle);
    
    const vx = -velocity * Math.sin(angle);
    const vz = velocity * Math.cos(angle);
    
    // Create the new object
    const newObject = new CelestialObject({
      name: name,
      mass: mass,
      radius: radius,
      position: [x, 0, z],
      velocity: [vx, 0, vz],
      color: parseInt(color.substring(1), 16)
    });
    
    // Add to simulation
    this.sceneManager.addObject(newObject);
    this.physicsEngine.addObject(newObject);
    
    // Update body count
    const count = this.physicsEngine.objects.length;
    this.bodyCountDisplay.textContent = `Bodies: ${count}`;
    
    // Close modal
    document.body.removeChild(modal);
  });
}
```

Add CSS for the modal:

```css
/* Add to styles.css */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: #2a2a3a;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  background-color: #1a1a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
```

These additional implementations should provide the next developer with solid guidance for addressing the technical issues and implementing new features in the Solar System Physics Simulator.
