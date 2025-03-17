#!/usr/bin/env node
/**
 * Texture Downloader
 * 
 * This script downloads high-quality textures for celestial bodies
 * from reliable sources and places them in the assets/textures directory.
 * 
 * Usage: node download-textures.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

// Define texture sources
// Using the Solar System Scope textures which are free for non-commercial use
const TEXTURE_SOURCES = {
  // Base URL for Solar System Scope textures (2k versions)
  baseUrl: 'https://www.solarsystemscope.com/textures',
  
  // Celestial body textures - required textures
  textures: [
    {
      name: 'sun.jpg',
      url: '/sun.jpg',
      description: 'The Sun texture',
      required: true
    },
    {
      name: 'mercury.jpg',
      url: '/mercury.jpg',
      description: 'Mercury texture',
      required: true
    },
    {
      name: 'venus.jpg',
      url: '/venus_atmosphere.jpg',
      description: 'Venus texture with atmosphere',
      required: true
    },
    {
      name: 'earth.jpg',
      url: '/earth_daymap.jpg',
      description: 'Earth daylight texture',
      required: true
    },
    {
      name: 'earth_night.jpg',
      url: '/earth_nightmap.jpg',
      description: 'Earth nighttime lights texture',
      required: false // Optional texture
    },
    {
      name: 'earth_specular.jpg',
      url: '/earth_specular_map.jpg',
      description: 'Earth specular map for water reflections',
      required: false // Optional texture
    },
    {
      name: 'earth_clouds.jpg',
      url: '/earth_clouds.jpg',
      description: 'Earth cloud layer texture',
      required: false // Optional texture
    },
    {
      name: 'moon.jpg',
      url: '/moon.jpg',
      description: 'Moon texture',
      required: true
    },
    {
      name: 'mars.jpg',
      url: '/mars.jpg',
      description: 'Mars texture',
      required: true
    },
    {
      name: 'jupiter.jpg',
      url: '/jupiter.jpg',
      description: 'Jupiter texture',
      required: true
    },
    {
      name: 'saturn.jpg',
      url: '/saturn.jpg',
      description: 'Saturn texture',
      required: true
    },
    {
      name: 'saturn_rings.png',
      url: '/saturn_ring_alpha.png',
      description: 'Saturn rings texture with alpha transparency',
      required: true
    },
    {
      name: 'uranus.jpg',
      url: '/uranus.jpg',
      description: 'Uranus texture',
      required: true
    },
    {
      name: 'neptune.jpg',
      url: '/neptune.jpg',
      description: 'Neptune texture',
      required: true
    },
    {
      name: 'pluto.jpg',
      url: '/pluto.jpg',
      description: 'Pluto texture',
      required: true
    },
    {
      name: 'starfield.jpg',
      url: '/starfield.jpg',
      description: 'Background starfield texture',
      required: true
    }
  ]
};

// Create the textures directory if it doesn't exist
const textureDir = path.join(__dirname, '..', 'assets', 'textures');
if (!fs.existsSync(textureDir)) {
  console.log(`Creating directory: ${textureDir}`);
  fs.mkdirSync(textureDir, { recursive: true });
}

// Download a file from a URL
function downloadFile(url, destination, required = true) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    console.log(`Downloading ${url} to ${destination}...`);
    
    https.get(url, (response) => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destination, () => {});
        
        if (required) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
        } else {
          console.warn(`Warning: Optional texture ${url} not available (${response.statusCode} ${response.statusMessage})`);
          resolve();
        }
        return;
      }
      
      // Pipe the response to the file
      response.pipe(file);
      
      // Handle file completion
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${destination}`);
        resolve();
      });
    }).on('error', (err) => {
      // Remove the file on error
      fs.unlink(destination, () => {});
      
      if (required) {
        reject(err);
      } else {
        console.warn(`Warning: Failed to download optional texture ${url}: ${err.message}`);
        resolve();
      }
    });
    
    // Handle write stream error
    file.on('error', (err) => {
      fs.unlink(destination, () => {});
      
      if (required) {
        reject(err);
      } else {
        console.warn(`Warning: Error writing optional texture ${destination}: ${err.message}`);
        resolve();
      }
    });
  });
}

// Create a fallback texture for missing optional textures
function createFallbackTexture(destination, color = '#000000') {
  return new Promise((resolve, reject) => {
    try {
      // Simple 2x2 pixel PNG - just a placeholder
      console.log(`Creating fallback texture at ${destination}`);
      
      // Write a simple colored 16x16 texture
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(16, 16);
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 16, 16);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(destination, buffer);
      
      console.log(`Created fallback texture at ${destination}`);
      resolve();
    } catch (err) {
      console.warn(`Warning: Could not create fallback texture: ${err.message}`);
      console.log('Continuing without fallback texture');
      resolve();
    }
  });
}

// Download all textures
async function downloadAllTextures() {
  console.log('Starting texture downloads...');
  
  // Create an array of promises for all downloads
  const downloads = TEXTURE_SOURCES.textures.map((texture) => {
    const url = `${TEXTURE_SOURCES.baseUrl}${texture.url}`;
    const destination = path.join(textureDir, texture.name);
    
    // Skip if file already exists
    if (fs.existsSync(destination)) {
      console.log(`Skipping ${texture.name} (already exists)`);
      return Promise.resolve();
    }
    
    return downloadFile(url, destination, texture.required)
      .catch(err => {
        if (!texture.required) {
          console.warn(`Could not download optional texture ${texture.name}, using fallback`);
          return createFallbackTexture(destination);
        }
        throw err;
      });
  });
  
  // Keep track of successful and failed downloads
  const results = { succeeded: [], failed: [] };
  
  // Process each download
  for (let i = 0; i < TEXTURE_SOURCES.textures.length; i++) {
    const texture = TEXTURE_SOURCES.textures[i];
    try {
      await downloads[i];
      results.succeeded.push(texture.name);
    } catch (error) {
      if (texture.required) {
        results.failed.push({ name: texture.name, error: error.message });
      }
    }
  }
  
  // Log results
  console.log(`\nTexture download summary:`);
  console.log(`- Successfully downloaded or skipped ${results.succeeded.length} textures`);
  
  if (results.failed.length > 0) {
    console.error(`- Failed to download ${results.failed.length} required textures:`);
    results.failed.forEach(failure => {
      console.error(`  - ${failure.name}: ${failure.error}`);
    });
    console.error('Required textures could not be downloaded. Application may not display correctly.');
    
    // Exit with error code if required textures failed
    process.exit(1);
  } else {
    console.log('All required textures downloaded successfully!');
    
    // Create an attribution file
    const attributionPath = path.join(textureDir, 'ATTRIBUTION.md');
    const attributionContent = `# Texture Attributions

The textures in this directory are sourced from Solar System Scope:
https://www.solarsystemscope.com/textures/

These textures are provided for educational and non-commercial use.
They are licensed under a Creative Commons Attribution 4.0 International License:
https://creativecommons.org/licenses/by/4.0/

## Included Textures

${TEXTURE_SOURCES.textures.map(texture => `- ${texture.name}: ${texture.description}`).join('\n')}

Downloaded on: ${new Date().toISOString().split('T')[0]}
`;
    
    fs.writeFileSync(attributionPath, attributionContent);
    console.log(`Created attribution file: ${attributionPath}`);
  }
}

// Execute the download function
downloadAllTextures();
