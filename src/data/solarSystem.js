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
      rotationPeriod: 27, // Earth days (equatorial)
      spectralType: 'G', // G-type star (yellow dwarf)
      temperature: 5778, // Surface temperature in Kelvin
      composition: {
        'Hydrogen': 73.46,
        'Helium': 24.85,
        'Oxygen': 0.77,
        'Carbon': 0.29,
        'Iron': 0.16,
        'Others': 0.47
      },
      emitLight: true // Emits light in the scene
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
      habitability: 0.1, // Very low habitability
      temperature: 440, // Average temperature in Kelvin
      type: 'Terrestrial Planet',
      composition: {
        'Iron': 70,
        'Silicate': 30
      },
      atmosphereComposition: {
        'Oxygen': 42, 
        'Sodium': 29,
        'Hydrogen': 22,
        'Helium': 6,
        'Potassium': 1
      }
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
      habitability: 0.2, // Low habitability due to extreme conditions
      temperature: 737, // Surface temperature in Kelvin
      type: 'Terrestrial Planet',
      orbitColor: 0xffbb77,
      composition: {
        'Rock': 65,
        'Iron': 35
      },
      atmosphereComposition: {
        'Carbon Dioxide': 96.5,
        'Nitrogen': 3.5,
        'Sulfur Dioxide': 0.015,
        'Water Vapor': 0.002
      }
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
      habitability: 1.0, // Perfect habitability (reference)
      temperature: 288, // Average temperature in Kelvin
      type: 'Terrestrial Planet',
      orbitColor: 0x4488ff,
      composition: {
        'Iron': 32.1,
        'Oxygen': 30.1,
        'Silicon': 15.1,
        'Magnesium': 13.9,
        'Sulfur': 2.9,
        'Nickel': 1.8,
        'Calcium': 1.5,
        'Aluminum': 1.4,
        'Others': 1.2
      },
      atmosphereComposition: {
        'Nitrogen': 78.08,
        'Oxygen': 20.95,
        'Argon': 0.93,
        'Carbon Dioxide': 0.04
      }
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
      habitability: 0.5, // Moderate habitability potential
      temperature: 210, // Average temperature in Kelvin
      type: 'Terrestrial Planet',
      orbitColor: 0xdd5544,
      composition: {
        'Iron': 30.8,
        'Oxygen': 27.0,
        'Silicon': 14.1,
        'Magnesium': 12.7,
        'Calcium': 9.2,
        'Aluminum': 2.5,
        'Others': 3.7
      },
      atmosphereComposition: {
        'Carbon Dioxide': 95.32,
        'Nitrogen': 2.7,
        'Argon': 1.6,
        'Oxygen': 0.13
      }
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
      habitability: 0.0, // Gas giant, not habitable
      temperature: 165, // Average temperature in Kelvin (cloud top)
      type: 'Gas Giant',
      orbitColor: 0xddaa66,
      composition: {
        'Hydrogen': 75,
        'Helium': 24,
        'Others': 1
      },
      atmosphereComposition: {
        'Hydrogen': 89,
        'Helium': 10,
        'Methane': 0.3,
        'Ammonia': 0.1,
        'Others': 0.6
      }
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
      temperature: 134, // Average temperature in Kelvin (cloud top)
      type: 'Gas Giant',
      orbitColor: 0xccbb77,
      composition: {
        'Hydrogen': 73,
        'Helium': 25,
        'Others': 2
      },
      atmosphereComposition: {
        'Hydrogen': 96.3,
        'Helium': 3.25,
        'Methane': 0.45
      },
      rings: {
        texture: 'saturn_rings.jpg',
        innerRadius: 1.2, // Relative to planet radius
        outerRadius: 2.3, // Relative to planet radius
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
      temperature: 76, // Average temperature in Kelvin
      type: 'Ice Giant',
      orbitColor: 0x77ccdd,
      composition: {
        'Hydrogen': 25,
        'Helium': 5,
        'Water': 25,
        'Methane': 25,
        'Ammonia': 20
      },
      atmosphereComposition: {
        'Hydrogen': 82.5,
        'Helium': 15.2,
        'Methane': 2.3
      },
      rings: {
        texture: 'uranus_rings.jpg',
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
      habitability: 0.0, // Ice giant, not habitable
      temperature: 72, // Average temperature in Kelvin
      type: 'Ice Giant',
      orbitColor: 0x3366dd,
      composition: {
        'Hydrogen': 22,
        'Helium': 6,
        'Water': 32,
        'Methane': 20,
        'Ammonia': 20
      },
      atmosphereComposition: {
        'Hydrogen': 80,
        'Helium': 19,
        'Methane': 1
      }
    }
  },
  
  pluto: {
    name: 'Pluto',
    mass: 1.303e22, // kg
    radius: 1188.3, // km
    position: [39.482, 0, 0], // AU
    velocity: [0, 4.67, 0], // km/s
    color: 0xafa097,
    texture: 'pluto.jpg',
    visualOptions: {
      rotationSpeed: 0.0031, // Very slow rotation
      rotationPeriod: 6.387, // Earth days
      axialTilt: 119.51, // degrees (retrograde)
      shininess: 5,
      habitability: 0.0, // Dwarf planet, not habitable
      temperature: 44, // Average temperature in Kelvin
      type: 'Dwarf Planet',
      orbitColor: 0x999999,
      composition: {
        'Nitrogen Ice': 55,
        'Methane Ice': 25,
        'Water Ice': 20
      },
      atmosphereComposition: {
        'Nitrogen': 90,
        'Methane': 10
      }
    }
  },
  
  moon: {
    name: 'Moon',
    mass: 7.342e22, // kg
    radius: 1737.4, // km
    position: [1.0025, 0, 0], // AU (Earth + distance to Moon)
    velocity: [0, 29.78 + 1.022, 0], // km/s (Earth + Moon's orbital velocity)
    color: 0xbbbbbb,
    texture: 'moon.jpg',
    visualOptions: {
      rotationSpeed: 0.002, // Synchronous with orbit
      rotationPeriod: 27.32, // Earth days
      axialTilt: 1.54, // degrees
      shininess: 5,
      habitability: 0.0, // Not habitable
      temperature: 250, // Average temperature in Kelvin
      type: 'Natural Satellite',
      orbitColor: 0xaaaaaa,
      composition: {
        'Oxygen': 42.5,
        'Silicon': 21,
        'Aluminum': 13,
        'Calcium': 8,
        'Iron': 6,
        'Magnesium': 5.5,
        'Others': 4
      }
    }
  }
};

/**
 * Get the default solar system as an array of celestial objects
 * @returns {Object} Solar system data with objects array
 */
function getDefaultSystem() {
  return {
    id: 'default-solar-system',
    name: 'Solar System',
    objects: Object.values(solarSystemData)
  };
}

/**
 * Get a simplified solar system with fewer objects for better performance
 * @returns {Object} Simplified solar system data with objects array
 */
function getSimplifiedSystem() {
  // Only include Sun and planets (no moons or dwarf planets)
  const simplifiedObjects = ['sun', 'mercury', 'venus', 'earth', 'mars', 
                            'jupiter', 'saturn', 'uranus', 'neptune'];
  
  return {
    id: 'simplified-solar-system',
    name: 'Simplified Solar System',
    objects: simplifiedObjects.map(name => solarSystemData[name])
  };
}

/**
 * Get an inner solar system setup with just the Sun and inner planets
 * @returns {Object} Inner solar system data with objects array
 */
function getInnerSolarSystem() {
  const innerPlanets = ['sun', 'mercury', 'venus', 'earth', 'mars'];
  
  return {
    id: 'inner-solar-system',
    name: 'Inner Solar System',
    objects: innerPlanets.map(name => solarSystemData[name])
  };
}

/**
 * Get the Earth-Moon system
 * @returns {Object} Earth-Moon system data with objects array
 */
function getEarthMoonSystem() {
  return {
    id: 'earth-moon-system',
    name: 'Earth-Moon System',
    objects: ['sun', 'earth', 'moon'].map(name => solarSystemData[name])
  };
}

// Export using CommonJS syntax
module.exports = {
  solarSystemData,
  getDefaultSystem,
  getSimplifiedSystem,
  getInnerSolarSystem,
  getEarthMoonSystem,
  AUtoKm,
  kmToAU,
  G
};
