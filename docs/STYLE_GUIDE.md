# Solar System Physics Simulator - Style Guide

This document outlines coding standards, naming conventions, and best practices for the Solar System Physics Simulator project. Following these guidelines helps maintain code consistency and quality.

## JavaScript Coding Standards

### Code Structure and Formatting

- Use CommonJS module format (require/module.exports) consistently
- Use 2-space indentation
- Use semicolons at the end of statements
- Keep line length under 100 characters
- Use single quotes for strings
- Add a blank line at the end of files
- Remove trailing whitespace

### Naming Conventions

- **Files**: Use camelCase for file names (e.g., `celestialObject.js`)
- **Classes**: Use PascalCase for class names (e.g., `CelestialObject`)
- **Variables/Functions**: Use camelCase (e.g., `applyForce`, `timeScale`)
- **Constants**: Use UPPER_SNAKE_CASE for truly constant values (e.g., `MAX_OBJECTS`)
- **Private Properties/Methods**: Prefix with underscore (e.g., `_privateMethod`)

### Code Organization

- Group related functionality in the same file/module
- Keep files under 500 lines; consider splitting if larger
- Organize class methods in logical groups:
  - Constructor and initialization
  - Public methods
  - Private methods
  - Event handlers
  - Static methods
  - Disposal/cleanup methods

### Comments and Documentation

- Use JSDoc style comments for classes and methods:

```javascript
/**
 * Calculate gravitational force between two objects
 * @param {CelestialObject} obj1 - First celestial object
 * @param {CelestialObject} obj2 - Second celestial object
 * @returns {THREE.Vector3} Force vector in newtons
 */
function calculateGravity(obj1, obj2) {
  // Implementation
}
```

- Comment complex logic or non-obvious code
- Use TODO comments for future work: `// TODO: Implement collision handling`
- Keep comments up-to-date with code changes

## Three.js Best Practices

### Resource Management

- Always dispose of geometries, materials, and textures when no longer needed
- Use shared materials and geometries when possible
- Implement proper cleanup in dispose() methods
- Monitor memory usage during development

### Performance Optimization

- Use appropriate levels of geometry detail (fewer vertices for distant objects)
- Implement frustum culling for large scenes
- Batch similar draw calls when possible
- Use appropriate material types (e.g., MeshBasicMaterial for simple objects)

### Scene Organization

- Group related objects in THREE.Group containers
- Use meaningful names for scene objects
- Establish a consistent coordinate system (e.g., XYZ for right-handed system)

## Physics Engine Standards

- Use SI units internally for calculations
- Document unit conversions clearly
- Implement error handling for edge cases
- Validate inputs to prevent unstable simulations
- Comment complex physics algorithms

## UI Component Guidelines

### Component Structure

- Each UI component should follow a consistent pattern:
  - Constructor with initialization
  - createUI() method for creating DOM elements
  - Event binding methods
  - Update methods
  - dispose() method for cleanup

### Event Handling

- Use explicit binding in constructor: `this.handleClick = this.handleClick.bind(this)`
- Or use arrow functions: `handleClick = () => { /* implementation */ }`
- Remove event listeners in dispose() method
- Use descriptive names for event handler methods (e.g., `handleButtonClick`)

### DOM Manipulation

- Create elements programmatically (not innerHTML where possible)
- Use CSS classes rather than inline styles
- Cache DOM references for elements accessed frequently
- Clean up DOM elements in dispose() method

## CSS Style Guidelines

### Naming Conventions

- Use kebab-case for class names (e.g., `celestial-object-panel`)
- Use specific class names that reflect the component's purpose
- Avoid IDs for styling; use them only for JavaScript references
- Use BEM (Block Element Modifier) naming convention for related elements:
  - Block: `info-panel`
  - Element: `info-panel__title`
  - Modifier: `info-panel--large`

### Organization

- Group related styles together
- Order properties consistently (positioning, dimensions, appearance, etc.)
- Use CSS variables for shared values (colors, dimensions, etc.)
- Comment sections of CSS files

```css
/* Main container styles */
.container {
  /* Positioning */
  position: relative;
  z-index: 10;
  
  /* Dimensions */
  width: 100%;
  height: 100%;
  
  /* Appearance */
  background-color: var(--background-color);
  color: var(--text-color);
}
```

## Testing Standards

- Write tests for complex logic
- Test edge cases and error conditions
- Clearly name test cases to describe what they're testing
- Use consistent test structure (setup, execute, verify)
- Mock external dependencies

## Git Workflow

### Branching Strategy

- `main`: Stable, production-ready code
- `feature/*`: New features (e.g., `feature/guided-tours`)
- `bugfix/*`: Bug fixes (e.g., `bugfix/texture-loading`)
- `refactor/*`: Code refactoring (e.g., `refactor/physics-engine`)

### Commit Messages

- Use descriptive, action-oriented messages
- Begin with a verb in the present tense
- Keep the first line under 72 characters
- Add details in the commit body if needed

Examples:
- "Add guided tour system for educational features"
- "Fix texture loading issue on macOS"
- "Optimize Barnes-Hut algorithm for better performance"

### Pull Requests

- Reference related issues in pull requests
- Include a clear description of changes
- Add testing instructions
- Request review from appropriate team members

## Documentation Standards

- Keep documentation up-to-date with code changes
- Use Markdown for all documentation files
- Include code examples where appropriate
- Use consistent structure across documentation files
- Link related documents together

## Examples

### Good JavaScript Example

```javascript
/**
 * Represents a celestial body with physics and rendering capabilities
 */
class CelestialObject {
  /**
   * Create a new celestial object
   * @param {Object} params - Configuration parameters
   */
  constructor(params) {
    this.id = params.id || Math.random().toString(36).substring(2, 9);
    this.name = params.name || 'Unknown Object';
    this.mass = params.mass || 1e24; // kg
    this.position = new THREE.Vector3(...(params.position || [0, 0, 0]));
    
    // Initialize 3D representation
    this._createMesh();
  }
  
  /**
   * Apply a force to this object
   * @param {THREE.Vector3} force - Force vector in newtons
   */
  applyForce(force) {
    // Calculate acceleration (F = ma)
    const acceleration = force.clone().divideScalar(this.mass);
    this.velocity.add(acceleration);
  }
  
  /**
   * Create the 3D mesh for this object
   * @private
   */
  _createMesh() {
    const geometry = new THREE.SphereGeometry(this._getDisplayRadius(), 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(geometry, material);
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) this.mesh.material.dispose();
    }
  }
}

module.exports = CelestialObject;
```

## Conclusion

Following these style guidelines will help maintain a consistent, high-quality codebase. These standards should evolve with the project, so suggestions for improvements are welcome.

All team members should review this guide before contributing to the project.
