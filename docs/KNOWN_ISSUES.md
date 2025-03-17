# Solar System Physics Simulator - Known Issues

This document outlines the current known issues and limitations in the Solar System Physics Simulator project. Developers should review these issues before continuing development work.

## Technical Issues

1. **Module System Inconsistency** (✅ FIXED)
   - The project mixes CommonJS and ES Modules, creating compatibility issues
   - Some files use `import`/`export` while others use `require`/`module.exports`
   - This inconsistency causes issues with Electron's main process
   - **Status**: Fixed by standardizing on CommonJS and using dynamic imports for ES modules in preload.js

2. **ES Module Import Errors** (✅ FIXED)
   - ESM imports in preload.js causing errors when loading THREE.js components
   - `require()` of ES Module files not supported in the current Electron setup
   - **Status**: Fixed by using dynamic `import()` for ES Module files in preload.js

3. **Content Security Policy Blocking Dynamic Code** (✅ FIXED)
   - CSP directives in index.html preventing the use of 'unsafe-eval'
   - This blocked the dynamic module loading system used for constants.js and other files
   - **Status**: Fixed by allowing 'unsafe-eval' in the CSP directives 

4. **Missing Constants File** (✅ FIXED)
   - Missing constants.js file causing errors when initializing the application
   - Physics calculations dependent on values from this file
   - **Status**: Fixed by creating the missing constants.js file with appropriate values

5. **Asset Path Resolution** (✅ FIXED)
   - Texture loading fails due to incorrect path resolution
   - Relative paths don't work properly in the Electron environment
   - **Status**: Fixed by adding proper path resolution in preload.js and celestialObject.js

6. **Poor Error Handling** (✅ FIXED)
   - Limited error handling throughout the application
   - No graceful fallbacks for missing assets or calculation errors
   - No comprehensive error logging system
   - **Status**: Fixed by adding comprehensive try/catch blocks and error logging

7. **Memory Management Issues** (✅ FIXED)
   - Three.js resources aren't properly disposed of when no longer needed
   - Potential memory leaks from event listeners not being removed
   - **Status**: Fixed by adding proper cleanup routines

## Physics Simulation Issues

1. **Gravity Calculation Performance** (⚠️ IN PROGRESS)
   - Current N-body simulation performs O(n²) calculations, becoming slow with many objects
   - No optimization for distant objects with minimal gravitational influence
   - **Status**: Needs to be addressed, possibly using the Barnes-Hut algorithm

2. **Numerical Stability** (⏳ PLANNED)
   - Physics can become unstable at high time scales
   - Orbits can deteriorate over long simulations due to cumulative errors
   - **Status**: Needs to be addressed with more stable numerical integration methods

3. **Collision Detection Limitations** (⏳ PLANNED)
   - Collision detection is very basic and doesn't account for object rotation
   - Collision resolution is overly simplistic
   - **Status**: Basic implementation added, but needs refinement

## UI/UX Issues

1. **Control Limitations** (⏳ PLANNED)
   - Camera controls don't provide options to follow specific objects
   - Limited information display about selected objects
   - **Status**: Basic object selection implemented, needs follow camera mode

2. **Object Creation Interface** (⏳ PLANNED)
   - No interface for creating new celestial objects
   - No validation for physically realistic parameters
   - **Status**: Basic random asteroid creation implemented, needs proper UI

3. **Performance Feedback** (⏳ PLANNED)
   - No indicators for simulation performance issues
   - No way to identify performance bottlenecks
   - **Status**: Basic FPS counter implemented, needs more comprehensive monitoring

## Educational Feature Gaps

1. **Limited Educational Content** (⏳ PLANNED)
   - No information panels explaining astronomical concepts
   - No habitability indicators or scientific explanations
   - **Status**: Planned for next phase

2. **Visualization Limitations** (⏳ PLANNED)
   - No visualization of gravity wells or spacetime distortion
   - Limited visual cues for physical phenomena
   - **Status**: Planned for next phase

## Asset Management

1. **Missing Textures** (⏳ PLANNED)
   - No texture files are currently included in the repository
   - Fallback to color materials is implemented but textures would enhance visual quality
   - **Status**: Need to add free-to-use textures for celestial bodies

2. **Asset Organization** (⏳ PLANNED)
   - Asset directory structure needs to be standardized
   - Need to include attribution for assets
   - **Status**: Planned for next phase

## Documentation

1. **Incomplete Code Documentation** (⏳ PLANNED)
   - Need JSDoc comments for all methods and classes
   - Need API documentation for the main components
   - **Status**: Planned for future update

2. **Missing User Documentation** (⏳ PLANNED)
   - Need user manual explaining application features
   - Need tutorials for common tasks
   - **Status**: Planned for future update

---

This document will be updated as issues are resolved and new issues are identified. Developers should prioritize addressing these issues according to the [Next Steps](../NEXT_STEPS_UPDATED.md) document.
