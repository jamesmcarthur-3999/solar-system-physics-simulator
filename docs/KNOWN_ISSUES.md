# Known Issues and Limitations

This document outlines known issues, limitations, and technical considerations for the Solar System Physics Simulator project. This will help onboarding developers understand current challenges and areas that need attention.

## Technical Issues

### 1. Module System Inconsistency

The project currently mixes CommonJS (require/exports) and ES Modules (import/export) syntax:
- `main.js` and `preload.js` use CommonJS
- Other files use ES Modules
- This can lead to compatibility issues when running the application

**Priority**: High
**Solution**: Standardize on either CommonJS throughout or properly configure Electron to support ES Modules in all contexts.

### 2. Asset Path Resolution

Texture paths in `solarSystem.js` use relative paths that won't resolve correctly in the Electron runtime environment:
- Paths like `'../assets/textures/sun.jpg'` won't work reliably
- Electron requires absolute paths or specially handled relative paths

**Priority**: High
**Solution**: Use `path.join(__dirname, ...)` or a dedicated asset loading utility.

### 3. Physics Calculation Accuracy

The physics simulation may experience issues with numerical precision due to the vast scales involved in astronomical calculations:
- Distances, masses, and times in space vary by many orders of magnitude
- JavaScript's floating-point precision may be insufficient for some calculations
- Current time scaling approach may cause orbit instability

**Priority**: Medium
**Solution**: Implement normalization functions and consider using alternative computation approaches for critical calculations.

### 4. Missing Error Handling

Error handling throughout the application is minimal, particularly in areas like:
- Texture loading
- Physics calculations
- Asset initialization

**Priority**: Medium
**Solution**: Add comprehensive try/catch blocks and error states in the UI.

### 5. Memory Management

The application may accumulate memory over time due to:
- Unbounded growth of orbit history points
- Event listeners not being properly cleaned up
- Three.js resources not being disposed

**Priority**: Medium
**Solution**: Implement proper cleanup methods and resource disposal.

## UX Limitations

### 1. Limited Object Interaction

Currently, the application only supports selecting objects, not modifying them:
- No UI for adjusting object properties
- No way to add custom objects with custom parameters

**Priority**: High
**Solution**: Implement the planned object creation and modification dialogs.

### 2. Visualization Scaling

Visual representation of celestial bodies is not to scale:
- Planets appear much larger relative to distances than in reality
- This is intentional for usability but should be made clear to users

**Priority**: Low
**Solution**: Add UI controls to toggle "realistic" vs. "educational" scaling.

### 3. Missing Educational Content

The educational aspects of the simulation are not yet implemented:
- No information panels about celestial objects
- No explanations of physical phenomena
- No habitability indicators

**Priority**: Medium
**Solution**: Implement the information panel system outlined in the project guide.

## Development Considerations

### 1. Cross-Platform Compatibility

The application needs testing on multiple platforms:
- Windows, macOS, and Linux have different path handling
- GPU performance varies across platforms
- Electron behavior may differ slightly between operating systems

**Priority**: Medium
**Solution**: Establish automated testing and ensure testing happens across multiple platforms.

### 2. Performance Optimization

The application may struggle with performance when many objects are present:
- N-body calculations scale poorly (O(n²) complexity)
- Rendering many high-poly objects can affect framerate

**Priority**: Medium
**Solution**: Implement physics optimization strategies (Barnes-Hut algorithm, etc.) and level-of-detail rendering.

---

This document should be updated as issues are resolved and new ones are discovered.
