// Default solar system data

// Update texture paths to use filenames only (full paths will be resolved at runtime)
const solarSystemData = {
  sun: {
    name: 'Sun',
    mass: 1.989e30, // kg
    radius: 696340, // km
    position: [0, 0, 0], // AU
    velocity: [0, 0, 0], // km/s
    color: 0xffff00,
    texture: 'sun.jpg',
    isStar: true
  },
  
  mercury: {
    name: 'Mercury',
    mass: 3.285e23, // kg
    radius: 2439.7, // km
    position: [0.387, 0, 0], // AU
    velocity: [0, 47.87, 0], // km/s
    color: 0x8a8a8a,
    texture: 'mercury.jpg'
  },
  
  venus: {
    name: 'Venus',
    mass: 4.867e24, // kg
    radius: 6051.8, // km
    position: [0.723, 0, 0], // AU
    velocity: [0, 35.02, 0], // km/s
    color: 0xe3bb76,
    texture: 'venus.jpg'
  },
  
  earth: {
    name: 'Earth',
    mass: 5.972e24, // kg
    radius: 6371, // km
    position: [1, 0, 0], // AU
    velocity: [0, 29.78, 0], // km/s
    color: 0x2b5aad,
    texture: 'earth.jpg'
  },
  
  mars: {
    name: 'Mars',
    mass: 6.39e23, // kg
    radius: 3389.5, // km
    position: [1.524, 0, 0], // AU
    velocity: [0, 24.13, 0], // km/s
    color: 0xc1440e,
    texture: 'mars.jpg'
  },
  
  jupiter: {
    name: 'Jupiter',
    mass: 1.898e27, // kg
    radius: 69911, // km
    position: [5.203, 0, 0], // AU
    velocity: [0, 13.07, 0], // km/s
    color: 0xd8ca9d,
    texture: 'jupiter.jpg'
  },
  
  saturn: {
    name: 'Saturn',
    mass: 5.683e26, // kg
    radius: 58232, // km
    position: [9.537, 0, 0], // AU
    velocity: [0, 9.69, 0], // km/s
    color: 0xead6b8,
    texture: 'saturn.jpg'
  },
  
  uranus: {
    name: 'Uranus',
    mass: 8.681e25, // kg
    radius: 25362, // km
    position: [19.191, 0, 0], // AU
    velocity: [0, 6.81, 0], // km/s
    color: 0x82b3d1,
    texture: 'uranus.jpg'
  },
  
  neptune: {
    name: 'Neptune',
    mass: 1.024e26, // kg
    radius: 24622, // km
    position: [30.069, 0, 0], // AU
    velocity: [0, 5.43, 0], // km/s
    color: 0x2a7de1,
    texture: 'neptune.jpg'
  }
};

// Helper functions to convert between AU and kilometers
const AUtoKm = 149597870.7; // 1 AU in kilometers
const kmToAU = 1 / AUtoKm; // 1 km in AU

// Physical constants
const G = 6.67430e-11; // Gravitational constant in m^3 kg^-1 s^-2

// Export using CommonJS syntax
module.exports = {
  solarSystemData,
  AUtoKm,
  kmToAU,
  G
};