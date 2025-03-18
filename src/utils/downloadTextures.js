// downloadTextures.js - Utility script to download celestial body textures
// Handle both Node.js and browser environments
const isNode = typeof window === 'undefined';
const fs = isNode ? require('fs') : window.fs || {};
const path = isNode ? require('path') : window.path || {};

/**
 * Downloads high-quality textures for the solar system from reliable sources
 * Can be run as a standalone script to populate the textures directory
 */

// URLs for free textures from Solar System Scope
// Source: https://www.solarsystemscope.com/textures/
const TEXTURE_URLS = {
  'sun.jpg': 'https://www.solarsystemscope.com/textures/download/2k_sun.jpg',
  'mercury.jpg': 'https://www.solarsystemscope.com/textures/download/2k_mercury.jpg',
  'venus.jpg': 'https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg',
  'earth.jpg': 'https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg',
  'mars.jpg': 'https://www.solarsystemscope.com/textures/download/2k_mars.jpg',
  'jupiter.jpg': 'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg',
  'saturn.jpg': 'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg',
  'uranus.jpg': 'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg',
  'neptune.jpg': 'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg',
  'pluto.jpg': 'https://www.solarsystemscope.com/textures/download/2k_pluto.jpg',
  'moon.jpg': 'https://www.solarsystemscope.com/textures/download/2k_moon.jpg',
  'stars.jpg': 'https://www.solarsystemscope.com/textures/download/2k_stars.jpg',
  'stars_milky_way.jpg': 'https://www.solarsystemscope.com/textures/download/2k_stars_milky_way.jpg',
};

// Target directory for textures - different handling for Node.js vs browser
const TEXTURE_DIR = isNode 
  ? path.join(__dirname, '../../assets/textures')
  : (window.appPath ? window.appPath.assetsPath + '/textures' : '../assets/textures');

/**
 * Checks if a file exists (works in both Node.js and browser)
 * @param {string} filePath - Path to check
 * @returns {boolean} - Whether the file exists
 */
function fileExists(filePath) {
  if (isNode) {
    return fs.existsSync(filePath);
  } else if (fs && typeof fs.existsSync === 'function') {
    // Use existsSync from preload if available
    return fs.existsSync(filePath);
  } else {
    // Fallback for browser - just assume files don't exist for now
    console.warn('Cannot check if file exists in browser environment');
    return false;
  }
}

/**
 * Creates a directory if it doesn't exist (works in both Node.js and browser)
 * @param {string} dirPath - Path to create
 */
function createDirectoryIfNeeded(dirPath) {
  if (isNode) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } else {
    // In browser, we can't easily create directories
    console.log('Directory creation not implemented in browser');
  }
}

/**
 * Downloads a file from a URL to a local path
 * @param {string} url - The URL to download from
 * @param {string} dest - The destination file path
 * @returns {Promise<void>}
 */
function downloadFile(url, dest) {
  if (isNode) {
    // Node.js environment
    return new Promise((resolve, reject) => {
      const https = require('https');
      const file = fs.createWriteStream(dest);
      
      console.log(`Downloading ${url}...`);
      
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded ${dest}`);
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {}); // Delete the file if there was an error
        reject(err);
      });
    });
  } else {
    // Browser environment - use fetch
    return new Promise((resolve, reject) => {
      console.log(`Would download ${url} in Node environment`);
      // In the browser, we can't easily save files, so just log the attempt
      resolve();
    });
  }
}

/**
 * Downloads all textures
 */
async function downloadAllTextures() {
  try {
    console.log("Starting texture check/download process...");
    console.log("Texture directory:", TEXTURE_DIR);
    
    // Create texture directory if it doesn't exist
    createDirectoryIfNeeded(TEXTURE_DIR);
    
    // In browser, we don't actually download files, just log attempts
    if (!isNode) {
      console.log("Running in browser environment - textures would be downloaded by the Node.js script");
      console.log("Texture paths are expected to exist already in browser environment");
      return [];
    }
    
    // Download each texture in Node.js environment
    const downloads = Object.entries(TEXTURE_URLS).map(([filename, url]) => {
      const filePath = isNode 
        ? path.join(TEXTURE_DIR, filename)
        : `${TEXTURE_DIR}/${filename}`;
      
      // Skip if file already exists
      if (fileExists(filePath)) {
        console.log(`Skipping ${filename} (already exists)`);
        return Promise.resolve();
      }
      
      return downloadFile(url, filePath);
    });
    
    // Wait for all downloads to complete
    await Promise.all(downloads);
    
    console.log('All textures downloaded successfully!');
    return downloads;
  } catch (error) {
    console.error('Error downloading textures:', error);
    return [];
  }
}

// If running this script directly in Node.js
if (isNode && require.main === module) {
  downloadAllTextures();
}

// Export for both Node.js and browser environments
if (isNode) {
  module.exports = {
    downloadAllTextures
  };
} else {
  if (typeof window !== 'undefined') {
    window.downloadAllTextures = downloadAllTextures;
  }
}
