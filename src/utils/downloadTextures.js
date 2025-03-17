// downloadTextures.js - Utility script to download celestial body textures
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

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

// Target directory for textures
const TEXTURE_DIR = path.join(__dirname, '../../assets/textures');

/**
 * Downloads a file from a URL to a local path
 * @param {string} url - The URL to download from
 * @param {string} dest - The destination file path
 * @returns {Promise<void>}
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
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
}

/**
 * Downloads all textures
 */
async function downloadAllTextures() {
  try {
    // Create texture directory if it doesn't exist
    if (!fs.existsSync(TEXTURE_DIR)) {
      fs.mkdirSync(TEXTURE_DIR, { recursive: true });
    }
    
    // Download each texture
    const downloads = Object.entries(TEXTURE_URLS).map(([filename, url]) => {
      const filePath = path.join(TEXTURE_DIR, filename);
      
      // Skip if file already exists
      if (fs.existsSync(filePath)) {
        console.log(`Skipping ${filename} (already exists)`);
        return Promise.resolve();
      }
      
      return downloadFile(url, filePath);
    });
    
    // Wait for all downloads to complete
    await Promise.all(downloads);
    
    console.log('All textures downloaded successfully!');
  } catch (error) {
    console.error('Error downloading textures:', error);
  }
}

// If running this script directly
if (require.main === module) {
  downloadAllTextures();
}

module.exports = {
  downloadAllTextures
};
