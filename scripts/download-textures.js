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
  
  // Celestial body textures
  textures: [
    {
      name: 'sun.jpg',
      url: '/sun.jpg',
      description: 'The Sun texture'
    },
    {
      name: 'mercury.jpg',
      url: '/mercury.jpg',
      description: 'Mercury texture'
    },
    {
      name: 'venus.jpg',
      url: '/venus_atmosphere.jpg',
      description: 'Venus texture with atmosphere'
    },
    {
      name: 'earth.jpg',
      url: '/earth_daymap.jpg',
      description: 'Earth daylight texture'
    },
    {
      name: 'earth_night.jpg',
      url: '/earth_nightmap.jpg',
      description: 'Earth nighttime lights texture'
    },
    {
      name: 'earth_specular.jpg',
      url: '/earth_specular_map.jpg',
      description: 'Earth specular map for water reflections'
    },
    {
      name: 'earth_clouds.jpg',
      url: '/earth_clouds.jpg',
      description: 'Earth cloud layer texture'
    },
    {
      name: 'moon.jpg',
      url: '/moon.jpg',
      description: 'Moon texture'
    },
    {
      name: 'mars.jpg',
      url: '/mars.jpg',
      description: 'Mars texture'
    },
    {
      name: 'jupiter.jpg',
      url: '/jupiter.jpg',
      description: 'Jupiter texture'
    },
    {
      name: 'saturn.jpg',
      url: '/saturn.jpg',
      description: 'Saturn texture'
    },
    {
      name: 'saturn_rings.png',
      url: '/saturn_ring_alpha.png',
      description: 'Saturn rings texture with alpha transparency'
    },
    {
      name: 'uranus.jpg',
      url: '/uranus.jpg',
      description: 'Uranus texture'
    },
    {
      name: 'neptune.jpg',
      url: '/neptune.jpg',
      description: 'Neptune texture'
    },
    {
      name: 'pluto.jpg',
      url: '/pluto.jpg',
      description: 'Pluto texture'
    },
    {
      name: 'starfield.jpg',
      url: '/starfield.jpg',
      description: 'Background starfield texture'
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
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    console.log(`Downloading ${url} to ${destination}...`);
    
    https.get(url, (response) => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
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
      reject(err);
    });
    
    // Handle write stream error
    file.on('error', (err) => {
      fs.unlink(destination, () => {});
      reject(err);
    });
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
    
    return downloadFile(url, destination);
  });
  
  // Wait for all downloads to complete
  try {
    await Promise.all(downloads);
    console.log('All textures downloaded successfully!');
    
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
    
  } catch (error) {
    console.error('Error downloading textures:', error);
    process.exit(1);
  }
}

// Execute the download function
downloadAllTextures();
