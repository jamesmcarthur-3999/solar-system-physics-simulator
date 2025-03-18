// Physical constants and conversion factors for the solar system simulation

// Gravitational constant (G) in m^3 kg^-1 s^-2
const G = 6.67430e-11;

// Astronomical Unit (AU) in km
const AU = 149597870.7;

// Seconds in a day
const SECONDS_PER_DAY = 86400;

// Scale factors for visualization
const DISTANCE_SCALE = 1 / 1000; // Scale down distances for visualization
const SIZE_SCALE = 1 / 100; // Scale for celestial body sizes (not to actual scale)
const ORBIT_SEGMENTS = 360; // Number of segments to use for orbit lines

// Time scale default (1 = 1 day per second)
const DEFAULT_TIME_SCALE = 1;

// Planet colors for orbit lines
const ORBIT_COLORS = {
  star: 0xFFFF00,
  planet: 0x3399FF,
  dwarf_planet: 0x99CCFF,
  moon: 0xCCCCCC,
  asteroid: 0x666666,
  comet: 0x00FFFF
};

// Mass of the Sun in kg
const SUN_MASS = 1.989e30;

// Earth values (for reference)
const EARTH = {
  mass: 5.972e24, // kg
  radius: 6371,   // km
  semiMajorAxis: 1.0, // AU
  orbitalPeriod: 365.256, // days
  rotationPeriod: 23.9344694, // hours
};

// Texture paths
const TEXTURE_PATH = '../assets/textures/';

// Export all constants for both browser and Node.js environments
if (typeof window !== 'undefined') {
  window.CONSTANTS = {
    G,
    AU,
    SECONDS_PER_DAY,
    DISTANCE_SCALE,
    SIZE_SCALE,
    ORBIT_SEGMENTS,
    DEFAULT_TIME_SCALE,
    ORBIT_COLORS,
    SUN_MASS,
    EARTH,
    TEXTURE_PATH
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    G,
    AU,
    SECONDS_PER_DAY,
    DISTANCE_SCALE,
    SIZE_SCALE,
    ORBIT_SEGMENTS,
    DEFAULT_TIME_SCALE,
    ORBIT_COLORS,
    SUN_MASS,
    EARTH,
    TEXTURE_PATH
  };
}
