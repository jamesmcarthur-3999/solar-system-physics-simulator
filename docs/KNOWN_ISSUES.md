# Solar System Physics Simulator - Known Issues

This document outlines the current known issues and limitations in the Solar System Physics Simulator project. Developers should review these issues before continuing development work.

## Technical Issues

1. **Module System Inconsistency** (Partially Fixed)
   - The project mixes CommonJS and ES Modules, creating compatibility issues
   - Some files use `import`/`export` while others use `require`/`module.exports`
   - This inconsistency causes issues with Electron's main process
   - **Status**: Being addressed by standardizing on CommonJS

2. **Asset Path Resolution** (Partially Fixed)
   - Texture loading fails due to incorrect path resolution
   - Relative paths don't work properly in the Electron environment
   - **Status**: Being addressed by adding proper path resolution for the Electron environment

3. **Poor Error Handling**
   - Limited error handling throughout the application
   - No graceful fallbacks for missing assets or calculation errors
   - No comprehensive error logging system
   - **Status**: Needs to be addressed

4. **Memory Management Issues**
   - Three.js resources aren't properly disposed of when no longer needed
   - Potential memory leaks from event listeners not being removed
   - **Status**: Being addressed with proper cleanup routines

## Physics Simulation Issues

1. **Gravity Calculation Performance**
   - Current N-body simulation performs O(n²) calculations, becoming slow with many objects
   - No optimization for distant objects with minimal gravitational influence
   - **Status**: Needs to be addressed, possibly using the Barnes-Hut algorithm

2. **Numerical Stability**
   - Physics can become unstable at high time scales
   - Orbits can deteriorate over long simulations due to cumulative errors
   - **Status**: Needs to be addressed with more stable numerical integration methods

3. **Collision Detection Limitations**
   - Collision detection is very basic and doesn't account for object rotation
   - Collision resolution is overly simplistic
   - **Status**: Needs to be addressed

## UI/UX Issues

1. **Control Limitations**
   - Camera controls don't provide options to follow specific objects
   - Limited information display about selected objects
   - **Status**: Needs to be addressed

2. **Object Creation Interface**
   - No interface for creating new celestial objects
   - No validation for physically realistic parameters
   - **Status**: Needs to be implemented

3. **Performance Feedback**
   - No indicators for simulation performance issues
   - No way to identify performance bottlenecks
   - **Status**: Needs to be addressed

## Educational Feature Gaps

1. **Limited Educational Content**
   - No information panels explaining astronomical concepts
   - No habitability indicators or scientific explanations
   - **Status**: Needs to be implemented

2. **Visualization Limitations**
   - No visualization of gravity wells or spacetime distortion
   - Limited visual cues for physical phenomena
   - **Status**: Needs to be implemented

---

This document will be updated as issues are resolved and new issues are identified. Developers should prioritize addressing these issues according to the [Next Steps](../NEXT_STEPS.md) document.