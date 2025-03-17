// Solar system data with enhanced visual options and accurate physical parameters

// Helper functions to convert between AU and kilometers
const AUtoKm = 149597870.7; // 1 AU in kilometers
const kmToAU = 1 / AUtoKm; // 1 km in AU

// Physical constants
const G = 6.67430e-11; // Gravitational constant in m^3 kg^-1 s^-2

/**
 * Default solar system data with enhanced visual options
 * Includes accurate:
 * - Physical parameters (mass, radius)
 * - Orbital parameters (distance, velocity)
 * - Rotation periods and axial tilts
 * - Special visual features (rings, atmospheres, clouds)
 */
const solarSystemData = {
  sun: {
    name: 'Sun',
    mass: 1.989e30, // kg
    radius: 696340, // km
    position: [0, 0, 0], // AU
    velocity: [0, 0, 0], // km/s
    color: 0xffff00,
    texture: 'sun.jpg',
    isStar: true,
    visualOptions: {
      emissive: 0xffaa00,
      shininess: 0,
      rotationSpeed: 0.001, // Slow rotation
      rotationPeriod: 27 // Earth days (equatorial)
    }
  },
  
  mercury: {
    name: 'Mercury',
    mass: 3.285e23, // kg
    radius: 2439.7, // km
    position: [0.387, 0, 0], // AU
    velocity: [0, 47.87, 0], // km/s
    color: 0x8a8a8a,
    texture: 'mercury.jpg',
    visualOptions: {
      rotationSpeed: 0.0029, // Very slow rotation
      rotationPeriod: 58.646, // Earth days
      axialTilt: 0.034, // degrees
      shininess: 10, // Low shininess
      habitability: 0.1 // Very low habitability
    }
  },
  
  venus: {
    name: 'Venus',
    mass: 4.867e24, // kg
    radius: 6051.8, // km
    position: [0.723, 0, 0], // AU
    velocity: [0, 35.02, 0], // km/s
    color: 0xe3bb76,
    texture: 'venus.jpg',
    visualOptions: {
      rotationSpeed: -0.0007, // Retrograde rotation (very slow)
      rotationPeriod: -243, // Earth days (negative for retrograde)
      axialTilt: 177.4, // Nearly upside down (retrograde)
      atmosphere: 0xffeecc, // Thick atmosphere
      shininess: 20,
      habitability: 0.2 // Low habitability due to extreme conditions
    }
  },
  
  earth: {
    name: 'Earth',
    mass: 5.972e24, // kg
    radius: 6371, // km
    position: [1, 0, 0], // AU
    velocity: [0, 29.78, 0], // km/s
    color: 0x2b5aad,
    texture: 'earth.jpg',
    visualOptions: {
      rotationSpeed: 0.05, // Full rotation in reasonable time for visualization
      rotationPeriod: 1, // Earth days
      axialTilt: 23.44, // degrees
      clouds: 'earth_clouds.jpg',
      cloudsRotationSpeed: 0.055, // Clouds move slightly faster than surface
      shininess: 30, // Ocean reflectivity
      atmosphere: 0x6b93d6, // Pale blue atmosphere
      habitability: 1.0 // Perfect habitability (reference)
    }
  },
  
  mars: {
    name: 'Mars',
    mass: 6.39e23, // kg
    radius: 3389.5, // km
    position: [1.524, 0, 0], // AU
    velocity: [0, 24.13, 0], // km/s
    color: 0xc1440e,
    texture: 'mars.jpg',
    visualOptions: {
      rotationSpeed: 0.048, // Similar to Earth
      rotationPeriod: 1.026, // Earth days
      axialTilt: 25.19, // degrees
      atmosphere: 0xc1785a, // Thin reddish atmosphere
      shininess: 15,
      habitability: 0.5 // Moderate habitability potential
    }
  },
  
  jupiter: {
    name: 'Jupiter',
    mass: 1.898e27, // kg
    radius: 69911, // km
    position: [5.203, 0, 0], // AU
    velocity: [0, 13.07, 0], // km/s
    color: 0xd8ca9d,
    texture: 'jupiter.jpg',
    visualOptions: {
      rotationSpeed: 0.12, // Fast rotation
      rotationPeriod: 0.41, // Earth days (9.93 hours)
      axialTilt: 3.13, // degrees
      shininess: 10,
      habitability: 0.0 // Gas giant, not habitable
    }
  },
  
  saturn: {
    name: 'Saturn',
    mass: 5.683e26, // kg
    radius: 58232, // km
    position: [9.537, 0, 0], // AU
    velocity: [0, 9.69, 0], // km/s
    color: 0xead6b8,
    texture: 'saturn.jpg',
    visualOptions: {
      rotationSpeed: 0.108, // Fast rotation
      rotationPeriod: 0.444, // Earth days (10.656 hours)
      axialTilt: 26.73, // degrees
      shininess: 10,
      habitability: 0.0, // Gas giant, not habitable
      rings: {
        texture: 'saturn_rings.png',
        innerRadius: 1.5, // Relative to planet radius
        outerRadius: 2.5, // Relative to planet radius
        rotation: { x: 0, y: 0, z: 0 } // Additional rotation if needed
      }
    }
  },
  
  uranus: {
    name: 'Uranus',
    mass: 8.681e25, // kg
    radius: 25362, // km
    position: [19.191, 0, 0], // AU
    velocity: [0, 6.81, 0], // km/s
    color: 0x82b3d1,
    texture: 'uranus.jpg',
    visualOptions: {
      rotationSpeed: 0.071, // Medium rotation
      rotationPeriod: 0.718, // Earth days (17.24 hours)
      axialTilt: 97.77, // Extreme tilt - almost on its side
      shininess: 20,
      habitability: 0.0, // Ice giant, not habitable
      rings: {
        texture: 'saturn_rings.png', // Temporary - should create Uranus rings texture
        innerRadius: 1.4, // Relative to planet radius
        outerRadius: 2.0, // Relative to planet radius
        rotation: { x: 0, y: 0, z: 0 } // Additional rotation if needed
      }
    }
  },
  
  neptune: {
    name: 'Neptune',
    mass: 1.024e26, // kg
    radius: 24622, // km
    position: [30.069, 0, 0], // AU
    velocity: [0, 5.43, 0], // km/s
    color: 0x2a7de1,
    texture: 'neptune.jpg',
    visualOptions: {
      rotationSpeed: 0.067, // Similar to Uranus
      rotationPeriod: 0.671, // Earth days (16.11 hours)
      axialTilt: 28.32, // degrees
      shininess: 20,
      habitability: 0.0 // Ice giant, not habitable
    }
  }
};

/**
 * Function to get the default solar system as an array of celestial objects
 * @returns {Array} Array of celestial object data
 */
function getDefaultSystem() {
  return {
    id: 'default-solar-system',
    name: 'Solar System',
    objects: Object.values(solarSystemData)
  };
}

// Export using CommonJS syntax
module.exports = {
  solarSystemData,
  getDefaultSystem,
  AUtoKm,
  kmToAU,
  G
};
