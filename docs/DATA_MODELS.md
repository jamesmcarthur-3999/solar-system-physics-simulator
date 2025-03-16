# Solar System Simulation - Data Models

This document describes the core data structures that are used throughout the application.

## CelestialObject

The fundamental data model representing any celestial body in the simulation.

```javascript
{
  // Basic Properties
  id: String,              // Unique identifier
  name: String,            // Display name
  type: String,            // "star", "planet", "moon", "asteroid", "comet", etc.
  
  // Physical Properties
  mass: Number,            // In kilograms
  radius: Number,          // In kilometers
  density: Number,         // In kg/m³
  composition: {           // Material composition percentages
    hydrogen: Number,
    helium: Number,
    water: Number,
    rock: Number,
    metal: Number,
    // etc.
  },
  atmosphere: {            // Atmospheric composition if applicable
    // Gases and percentages
  },
  surfaceTemperature: Number, // In Kelvin
  
  // Visual Properties
  color: String,           // Base color (hex)
  texture: String,         // Path to texture image
  emissive: Boolean,       // Whether it emits light (true for stars)
  
  // Orbital Properties
  position: {              // 3D position in simulation space
    x: Number,
    y: Number,
    z: Number
  },
  velocity: {              // Velocity vector
    x: Number,
    y: Number,
    z: Number
  },
  orbiting: String,        // ID of object it's orbiting (null if none)
  
  // Calculated Properties (updated during simulation)
  orbitalPeriod: Number,   // In Earth days
  eccentricity: Number,    // Orbital eccentricity
  inclination: Number,     // Orbital inclination in degrees
  habitabilityIndex: Number, // 0-1 scale of potential habitability
  
  // Additional properties for specific types
  luminosity: Number,      // For stars, in watts
  magneticField: Number,   // Strength of magnetic field
  rotationPeriod: Number,  // In Earth days
  axialTilt: Number,       // In degrees
  rings: Boolean,          // Whether the object has rings
  
  // Metadata
  isUserCreated: Boolean,  // Whether this was added by the user
  notes: String            // User notes about this object
}
```

## SolarSystem

A collection of celestial objects that form a complete system.

```javascript
{
  id: String,              // Unique identifier
  name: String,            // Display name
  objects: Array,          // Array of CelestialObject ids
  primaryStar: String,     // ID of the main star
  
  // System properties
  age: Number,             // In billions of years
  size: Number,            // Approximate radius in AU
  
  // Metadata
  isDefault: Boolean,      // Whether this is a built-in system
  createdAt: Date,         // When this system was created
  modifiedAt: Date,        // When this system was last modified
  notes: String            // User notes about this system
}
```

## SimulationState

The complete state of the current simulation.

```javascript
{
  currentSystem: String,   // ID of current solar system
  timeScale: Number,       // Simulation speed (1.0 = real time)
  elapsedTime: Number,     // Simulation time elapsed in days
  paused: Boolean,         // Whether simulation is paused
  
  // Camera settings
  camera: {
    position: {x, y, z},
    target: String,        // ID of object camera is focused on
    mode: String           // "free", "orbit", "follow", etc.
  },
  
  // Visualization settings
  showOrbits: Boolean,     // Show orbital paths
  showLabels: Boolean,     // Show object labels
  showForces: Boolean,     // Show force vectors
  showGrid: Boolean,       // Show reference grid
  showSpacetime: Boolean,  // Show spacetime distortion
  
  // Physics settings
  gravitationalConstant: Number,  // Can be adjusted for experiments
  collisionsEnabled: Boolean,     // Whether objects can collide
  
  // UI state
  selectedObject: String,  // ID of currently selected object
  uiPanelOpen: String      // Which UI panel is currently open
}
```

## UserSettings

User preferences that persist between sessions.

```javascript
{
  graphicsQuality: String, // "low", "medium", "high", "ultra"
  autoSave: Boolean,       // Whether to automatically save
  autoSaveInterval: Number, // In minutes
  defaultSystem: String,   // ID of system to load at startup
  theme: String,           // UI theme: "light", "dark", "system"
  units: {                 // Preferred units
    distance: String,      // "km", "au", "lightyears"
    mass: String,          // "kg", "earthMasses", "solarMasses"
    temperature: String    // "kelvin", "celsius", "fahrenheit"
  }
}
```

## Current Implementation

The current implementation of these models is simplified for the MVP version:

1. **CelestialObject**: Basic properties like position, velocity, mass, and radius are implemented. Visual representation via Three.js meshes is working.
   
2. **GravitySimulator**: Handles the N-body physics simulation with realistic gravitational interactions.

3. **SolarSystem**: Currently implemented as a simple data object that holds celestial body information.

The full data models described above represent the target for the complete application and will be implemented incrementally as development progresses.