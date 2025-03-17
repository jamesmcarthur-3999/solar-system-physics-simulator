// Import Three.js using CommonJS syntax
const THREE = require('three');

/**
 * CelestialObject class representing a celestial body such as a star or planet
 * Handles 3D representation, physics, and orbital mechanics
 */
class CelestialObject {
  /**
   * Create a new celestial object
   * @param {Object} params - Configuration parameters
   * @param {String} params.id - Unique identifier
   * @param {String} params.name - Display name
   * @param {Number} params.mass - Mass in kg
   * @param {Number} params.radius - Radius in km
   * @param {Array} params.position - [x, y, z] position in AU
   * @param {Array} params.velocity - [vx, vy, vz] velocity in km/s
   * @param {String} params.color - Hex color code for fallback color
   * @param {String} params.texture - Path to texture file
   * @param {Boolean} params.isStar - Whether this object is a star
   * @param {Object} params.visualOptions - Additional visual options
   */
  constructor({
    id,
    name,
    mass,
    radius,
    position,
    velocity,
    color,
    texture,
    isStar = false,
    visualOptions = {}
  }) {
    // Basic properties
    this.id = id || Math.random().toString(36).substring(2, 9);
    this.name = name;
    this.mass = mass; // kg
    this.radius = radius; // km
    this.position = new THREE.Vector3(...position); // [x, y, z] in AU
    this.velocity = new THREE.Vector3(...velocity); // [vx, vy, vz] in km/s
    this.color = color;
    this.texturePath = texture;
    this.isStar = isStar;
    this.visualOptions = {
      // Default visual options
      emissive: isStar ? 0xffff00 : 0x000000,
      shininess: isStar ? 0 : 30,
      clouds: null,
      atmosphere: null,
      rings: null,
      rotationSpeed: 0.005, // Default rotation speed
      axialTilt: 0, // Default axial tilt in degrees
      // Override with provided options
      ...visualOptions
    };
    
    // Physics properties
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.orbitPoints = [];
    this.orbitLine = null;
    
    // Track object rotation
    this.rotation = 0;
    
    // Create the 3D representation
    this.createMesh();
  }

  /**
   * Create the 3D mesh for this celestial object
   */
  createMesh() {
    try {
      // Create geometry
      const geometry = new THREE.SphereGeometry(this.getDisplayRadius(), 64, 64);
      
      // Create material (either with texture or color)
      let material;
      if (this.texturePath) {
        try {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.setCrossOrigin('anonymous');
          
          // Use proper path resolution for textures
          const texturePath = window.appPath ? 
            `${window.appPath.assetsPath}/textures/${this.texturePath.split('/').pop()}` : 
            this.texturePath;
          
          const texture = textureLoader.load(
            texturePath,
            // On success: do nothing special
            undefined,
            // On progress: do nothing special
            undefined,
            // On error: fall back to color
            (error) => {
              console.warn(`Failed to load texture: ${texturePath}`, error);
              this.mesh.material = new THREE.MeshPhongMaterial({ color: this.color });
            }
          );
          
          // Apply emissive for stars
          material = new THREE.MeshPhongMaterial({ 
            map: texture,
            emissive: this.isStar ? new THREE.Color(this.visualOptions.emissive) : null,
            emissiveIntensity: this.isStar ? 0.6 : 0,
            shininess: this.visualOptions.shininess
          });
        } catch (e) {
          console.warn(`Failed to setup texture: ${this.texturePath}`, e);
          material = new THREE.MeshPhongMaterial({ color: this.color });
        }
      } else {
        material = new THREE.MeshPhongMaterial({ color: this.color });
      }
      
      // Create mesh
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.copy(this.position);
      this.mesh.userData.objectId = this.id;
      
      // Apply axial tilt
      if (this.visualOptions.axialTilt) {
        this.mesh.rotation.z = THREE.MathUtils.degToRad(this.visualOptions.axialTilt);
      }
      
      // Add atmosphere if specified
      if (this.visualOptions.atmosphere) {
        this.addAtmosphere();
      }
      
      // Add cloud layer if specified
      if (this.visualOptions.clouds) {
        this.addClouds();
      }
      
      // Add rings if specified
      if (this.visualOptions.rings) {
        this.addRings();
      }
      
      // Add glow effect for stars
      if (this.isStar) {
        this.addStarGlow();
      }
    } catch (error) {
      console.error('Error creating celestial object mesh:', error);
      // Create fallback representation
      const geometry = new THREE.SphereGeometry(this.getDisplayRadius(), 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: this.color || 0xff0000 });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.copy(this.position);
      this.mesh.userData.objectId = this.id;
    }
  }

  /**
   * Add a cloud layer to the planet
   */
  addClouds() {
    try {
      if (!this.visualOptions.clouds) return;
      
      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin('anonymous');
      
      // Use proper path resolution for textures
      const cloudsPath = window.appPath ? 
        `${window.appPath.assetsPath}/textures/${this.visualOptions.clouds.split('/').pop()}` : 
        this.visualOptions.clouds;
      
      const cloudsTexture = textureLoader.load(cloudsPath);
      
      // Create slightly larger sphere for clouds
      const cloudsGeometry = new THREE.SphereGeometry(
        this.getDisplayRadius() * 1.01, 
        64, 
        64
      );
      
      const cloudsMaterial = new THREE.MeshPhongMaterial({
        map: cloudsTexture,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      this.cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
      this.mesh.add(this.cloudsMesh);
      
      // Store rotation speed
      this.cloudsRotationSpeed = this.visualOptions.cloudsRotationSpeed || this.visualOptions.rotationSpeed * 1.1;
    } catch (error) {
      console.error('Error creating clouds:', error);
    }
  }

  /**
   * Add an atmosphere effect to the planet
   */
  addAtmosphere() {
    try {
      if (!this.visualOptions.atmosphere) return;
      
      const atmosphereColor = new THREE.Color(this.visualOptions.atmosphere);
      const atmosphereGeometry = new THREE.SphereGeometry(
        this.getDisplayRadius() * 1.025, 
        64, 
        64
      );
      
      const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: atmosphereColor,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      });
      
      this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      this.mesh.add(this.atmosphereMesh);
    } catch (error) {
      console.error('Error creating atmosphere:', error);
    }
  }

  /**
   * Add planetary rings like Saturn or Uranus
   */
  addRings() {
    try {
      if (!this.visualOptions.rings) return;
      
      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin('anonymous');
      
      // Use proper path resolution for textures
      const ringsPath = window.appPath ? 
        `${window.appPath.assetsPath}/textures/${this.visualOptions.rings.texture.split('/').pop()}` : 
        this.visualOptions.rings.texture;
      
      const ringsTexture = textureLoader.load(ringsPath);
      
      // Create ring geometry
      const innerRadius = this.getDisplayRadius() * this.visualOptions.rings.innerRadius;
      const outerRadius = this.getDisplayRadius() * this.visualOptions.rings.outerRadius;
      
      const ringsGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
      
      // Need to modify UVs to map texture correctly to ring
      const pos = ringsGeometry.attributes.position;
      const uv = ringsGeometry.attributes.uv;
      
      for (let i = 0; i < pos.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(pos, i);
        
        // Normalize vertex position to calculate UV
        vertex.normalize();
        const u = (vertex.x + 1) / 2;
        const v = (vertex.y + 1) / 2;
        
        uv.setXY(i, u, v);
      }
      
      const ringsMaterial = new THREE.MeshBasicMaterial({
        map: ringsTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      
      this.ringsMesh = new THREE.Mesh(ringsGeometry, ringsMaterial);
      
      // Rotate rings to correct orientation
      this.ringsMesh.rotation.x = Math.PI / 2;
      
      // Apply any additional rotation from visual options
      if (this.visualOptions.rings.rotation) {
        const rotation = this.visualOptions.rings.rotation;
        this.ringsMesh.rotation.x += THREE.MathUtils.degToRad(rotation.x || 0);
        this.ringsMesh.rotation.y += THREE.MathUtils.degToRad(rotation.y || 0);
        this.ringsMesh.rotation.z += THREE.MathUtils.degToRad(rotation.z || 0);
      }
      
      this.mesh.add(this.ringsMesh);
    } catch (error) {
      console.error('Error creating rings:', error);
    }
  }

  /**
   * Add a glow effect for star objects
   */
  addStarGlow() {
    try {
      const glowGeometry = new THREE.SphereGeometry(this.getDisplayRadius() * 1.2, 32, 32);
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          "c": { value: 0.1 },
          "p": { value: 1.2 },
          glowColor: { value: new THREE.Color(0xffff00) },
          viewVector: { value: new THREE.Vector3(0, 0, 0) }
        },
        vertexShader: `
          uniform vec3 viewVector;
          uniform float c;
          uniform float p;
          varying float intensity;
          void main() {
            vec3 vNormal = normalize(normal);
            vec3 vNormel = normalize(viewVector);
            intensity = pow(c - dot(vNormal, vNormel), p);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying float intensity;
          void main() {
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4(glow, 1.0);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });
      
      this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      this.mesh.add(this.glowMesh);
    } catch (error) {
      console.error('Error creating star glow effect:', error);
      // Continue without glow effect if it fails
    }
  }

  /**
   * Get display radius (scaled for visualization)
   * @returns {Number} Display radius in scene units
   */
  getDisplayRadius() {
    // Scale radius for display (planets would be too small otherwise)
    return this.isStar
      ? Math.log10(this.radius) * 2
      : Math.log10(this.radius) * 4;
  }

  /**
   * Update position based on velocity and acceleration
   * @param {Number} dt - Time delta in days
   */
  updatePosition(dt) {
    // Update position based on velocity
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;
    
    // Update velocity based on acceleration
    this.velocity.x += this.acceleration.x * dt;
    this.velocity.y += this.acceleration.y * dt;
    this.velocity.z += this.acceleration.z * dt;
    
    // Update mesh position
    if (this.mesh) {
      this.mesh.position.copy(this.position);
      
      // Update rotation
      if (this.visualOptions.rotationSpeed) {
        // Convert days to realistic rotation (scaled for visualization)
        const rotationAmount = this.visualOptions.rotationSpeed * dt * 10;
        this.rotation += rotationAmount;
        this.mesh.rotation.y = this.rotation;
      }
      
      // Update cloud rotation if present
      if (this.cloudsMesh && this.cloudsRotationSpeed) {
        const cloudsRotationAmount = this.cloudsRotationSpeed * dt * 10;
        this.cloudsMesh.rotation.y += cloudsRotationAmount;
      }
    }
    
    // Clear acceleration for next calculation
    this.acceleration.set(0, 0, 0);
    
    // Update orbit trail
    this.updateOrbitTrail();
  }

  /**
   * Update the orbit trail with current position
   */
  updateOrbitTrail() {
    // Add current position to orbit points (keeping only the most recent points)
    const maxPoints = 500;
    this.orbitPoints.push(new THREE.Vector3().copy(this.position));
    if (this.orbitPoints.length > maxPoints) {
      this.orbitPoints.shift();
    }
  }

  /**
   * Create or update the orbit line visualization
   * @param {THREE.Scene} scene - Three.js scene to add the orbit line to
   */
  createOrbitLine(scene) {
    if (!scene) return;
    
    try {
      // Create geometry for orbit line
      const geometry = new THREE.BufferGeometry().setFromPoints(this.orbitPoints);
      const material = new THREE.LineBasicMaterial({ 
        color: this.color, 
        opacity: 0.5, 
        transparent: true 
      });
      
      // Create line
      if (this.orbitLine) {
        scene.remove(this.orbitLine);
        
        // Dispose of old resources
        if (this.orbitLine.geometry) {
          this.orbitLine.geometry.dispose();
        }
        if (this.orbitLine.material) {
          this.orbitLine.material.dispose();
        }
      }
      
      this.orbitLine = new THREE.Line(geometry, material);
      scene.add(this.orbitLine);
    } catch (error) {
      console.error('Error creating orbit line:', error);
    }
  }

  /**
   * Apply a force to this object (affects acceleration)
   * @param {THREE.Vector3} force - Force vector to apply
   */
  applyForce(force) {
    // Calculate acceleration: a = F / m
    const ax = force.x / this.mass;
    const ay = force.y / this.mass;
    const az = force.z / this.mass;
    
    // Add to current acceleration
    this.acceleration.x += ax;
    this.acceleration.y += ay;
    this.acceleration.z += az;
  }

  /**
   * Get formatted information about this object
   * @returns {Object} Object information
   */
  getInfo() {
    // Calculate orbital velocity
    const speed = Math.sqrt(
      this.velocity.x ** 2 + 
      this.velocity.y ** 2 + 
      this.velocity.z ** 2
    );
    
    return {
      name: this.name,
      mass: `${(this.mass / 1e24).toFixed(2)} × 10²⁴ kg`,
      radius: `${this.radius.toFixed(0)} km`,
      position: `X: ${this.position.x.toFixed(2)}, Y: ${this.position.y.toFixed(2)}, Z: ${this.position.z.toFixed(2)}`,
      velocity: `${speed.toFixed(2)} km/s`,
      type: this.isStar ? 'Star' : 'Planet',
      // Additional details if available
      rotationPeriod: this.visualOptions.rotationPeriod ? 
        `${this.visualOptions.rotationPeriod.toFixed(2)} Earth days` : 
        'Unknown',
      axialTilt: this.visualOptions.axialTilt ? 
        `${this.visualOptions.axialTilt.toFixed(1)}°` : 
        'Unknown',
      // Add habitability info if present
      habitability: this.visualOptions.habitability !== undefined ?
        this.visualOptions.habitability.toFixed(2) :
        undefined
    };
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    if (this.mesh) {
      // Dispose of geometry
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      
      // Dispose of material
      if (this.mesh.material) {
        if (this.mesh.material.map) {
          this.mesh.material.map.dispose();
        }
        this.mesh.material.dispose();
      }
    }
    
    // Clean up clouds mesh
    if (this.cloudsMesh) {
      if (this.cloudsMesh.geometry) {
        this.cloudsMesh.geometry.dispose();
      }
      if (this.cloudsMesh.material) {
        if (this.cloudsMesh.material.map) {
          this.cloudsMesh.material.map.dispose();
        }
        this.cloudsMesh.material.dispose();
      }
    }
    
    // Clean up atmosphere mesh
    if (this.atmosphereMesh) {
      if (this.atmosphereMesh.geometry) {
        this.atmosphereMesh.geometry.dispose();
      }
      if (this.atmosphereMesh.material) {
        this.atmosphereMesh.material.dispose();
      }
    }
    
    // Clean up rings mesh
    if (this.ringsMesh) {
      if (this.ringsMesh.geometry) {
        this.ringsMesh.geometry.dispose();
      }
      if (this.ringsMesh.material) {
        if (this.ringsMesh.material.map) {
          this.ringsMesh.material.map.dispose();
        }
        this.ringsMesh.material.dispose();
      }
    }
    
    // Clean up glow mesh
    if (this.glowMesh) {
      if (this.glowMesh.geometry) {
        this.glowMesh.geometry.dispose();
      }
      if (this.glowMesh.material) {
        this.glowMesh.material.dispose();
      }
    }
    
    // Clean up orbit line
    if (this.orbitLine) {
      if (this.orbitLine.geometry) {
        this.orbitLine.geometry.dispose();
      }
      if (this.orbitLine.material) {
        this.orbitLine.material.dispose();
      }
    }
  }
}

// Export using CommonJS syntax
module.exports = CelestialObject;
