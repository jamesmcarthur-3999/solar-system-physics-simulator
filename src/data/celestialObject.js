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
    this.color = color || (isStar ? 0xffdd44 : 0x999999);
    this.texturePath = texture || (isStar ? 'sun.jpg' : null);
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
      // Create geometry with higher detail for better visual quality
      const geometry = new THREE.SphereGeometry(this.getDisplayRadius(), 64, 64);
      
      // Create material (either with texture or color)
      let material;
      
      // Try to load texture
      if (this.texturePath) {
        try {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.setCrossOrigin('anonymous');
          
          // Use proper path resolution for textures
          const texturePath = window.appPath ? 
            `${window.appPath.assetsPath}/textures/${this.texturePath}` : 
            `assets/textures/${this.texturePath}`;
          
          const texture = textureLoader.load(
            texturePath,
            // On success: enhance texture
            (loadedTexture) => {
              loadedTexture.anisotropy = 16; // Increase texture quality
              this.mesh.material.needsUpdate = true;
            },
            // On progress: do nothing special
            undefined,
            // On error: fall back to color
            (error) => {
              console.warn(`Failed to load texture: ${texturePath}`, error);
              this.mesh.material = new THREE.MeshPhongMaterial({ 
                color: this.color,
                emissive: this.isStar ? new THREE.Color(this.visualOptions.emissive) : null,
                emissiveIntensity: this.isStar ? 0.6 : 0,
                shininess: this.visualOptions.shininess
              });
            }
          );
          
          // Set up material based on body type
          if (this.isStar) {
            // For stars, use emissive material
            material = new THREE.MeshPhongMaterial({ 
              map: texture,
              emissive: new THREE.Color(this.visualOptions.emissive),
              emissiveIntensity: 0.6,
              emissiveMap: texture, // Use same texture for emissive to enhance glow
              shininess: this.visualOptions.shininess
            });
          } else {
            // For planets, use standard material with specular
            material = new THREE.MeshStandardMaterial({ 
              map: texture,
              roughness: 0.7,
              metalness: 0.1,
              normalScale: new THREE.Vector2(1, 1)
            });
          }
        } catch (e) {
          console.warn(`Failed to setup texture: ${this.texturePath}`, e);
          material = new THREE.MeshPhongMaterial({ color: this.color });
        }
      } else {
        // Fallback to color material
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
      } else if (!this.isStar && this.name) {
        // Add default atmospheres for known planets
        if (this.name.toLowerCase() === 'earth') {
          this.visualOptions.atmosphere = 0x6699ff;
          this.addAtmosphere();
        } else if (this.name.toLowerCase() === 'venus') {
          this.visualOptions.atmosphere = 0xffcc66;
          this.addAtmosphere();
        } else if (this.name.toLowerCase() === 'mars') {
          this.visualOptions.atmosphere = 0xff9966;
          this.addAtmosphere();
        } else if (this.name.toLowerCase() === 'jupiter' || 
                 this.name.toLowerCase() === 'saturn' || 
                 this.name.toLowerCase() === 'uranus' || 
                 this.name.toLowerCase() === 'neptune') {
          this.visualOptions.atmosphere = 0xaaccff;
          this.addAtmosphere();
        }
      }
      
      // Add cloud layer if specified
      if (this.visualOptions.clouds) {
        this.addClouds();
      } else if (this.name && this.name.toLowerCase() === 'earth') {
        // Add default clouds for Earth
        this.visualOptions.clouds = 'earth_clouds.jpg';
        this.addClouds();
      }
      
      // Add rings if specified
      if (this.visualOptions.rings) {
        this.addRings();
      } else if (this.name) {
        // Add default rings for Saturn and Uranus
        if (this.name.toLowerCase() === 'saturn') {
          this.visualOptions.rings = {
            texture: 'saturn_rings.jpg',
            innerRadius: 1.1,
            outerRadius: 2.3,
            rotation: { x: 27, y: 0, z: 0 }
          };
          this.addRings();
        } else if (this.name.toLowerCase() === 'uranus') {
          this.visualOptions.rings = {
            texture: 'uranus_rings.jpg', 
            innerRadius: 1.3,
            outerRadius: 1.8,
            rotation: { x: 90, y: 0, z: 0 }
          };
          this.addRings();
        }
      }
      
      // Add glow effect for stars
      if (this.isStar) {
        this.addStarGlow();
      }
      
      // Add light source for stars
      if (this.isStar && this.visualOptions.emitLight !== false) {
        this.addLightSource();
      }
      
      // Add surface detail
      this.addSurfaceDetail();
      
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
   * Add a light source for star objects
   */
  addLightSource() {
    try {
      // Only add light for stars
      if (!this.isStar) return;
      
      // Create point light
      const lightIntensity = this.radius / 6.96e5; // Relative to Sun's radius
      const normalizedIntensity = Math.max(0.5, Math.min(1, lightIntensity));
      
      this.light = new THREE.PointLight(0xffffff, normalizedIntensity, 0, 1);
      this.light.position.copy(this.position);
      
      // Add subtle color to light based on star type
      if (this.visualOptions.spectralType) {
        const spectralColors = {
          O: 0xaabfff, // Blue
          B: 0xbfddff, // Blue-white
          A: 0xddddff, // White
          F: 0xffffff, // White-yellow
          G: 0xffffee, // Yellow (Sun)
          K: 0xffddaa, // Orange
          M: 0xffbb99  // Red
        };
        
        if (spectralColors[this.visualOptions.spectralType]) {
          this.light.color.setHex(spectralColors[this.visualOptions.spectralType]);
        }
      }
    } catch (error) {
      console.error('Error creating light source:', error);
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
        `${window.appPath.assetsPath}/textures/${this.visualOptions.clouds}` : 
        `assets/textures/${this.visualOptions.clouds}`;
      
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
      
      // Inner atmosphere (glow)
      const innerAtmosphereGeometry = new THREE.SphereGeometry(
        this.getDisplayRadius() * 1.025, 
        64, 
        64
      );
      
      const innerAtmosphereMaterial = new THREE.MeshPhongMaterial({
        color: atmosphereColor,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      });
      
      this.innerAtmosphereMesh = new THREE.Mesh(innerAtmosphereGeometry, innerAtmosphereMaterial);
      this.mesh.add(this.innerAtmosphereMesh);
      
      // Outer atmosphere (subtle glow)
      const outerAtmosphereGeometry = new THREE.SphereGeometry(
        this.getDisplayRadius() * 1.1, 
        32, 
        32
      );
      
      const outerAtmosphereMaterial = new THREE.MeshPhongMaterial({
        color: atmosphereColor,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
      });
      
      this.outerAtmosphereMesh = new THREE.Mesh(outerAtmosphereGeometry, outerAtmosphereMaterial);
      this.mesh.add(this.outerAtmosphereMesh);
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
        `${window.appPath.assetsPath}/textures/${this.visualOptions.rings.texture}` : 
        `assets/textures/${this.visualOptions.rings.texture}`;
      
      const ringsTexture = textureLoader.load(ringsPath);
      
      // Create ring geometry
      const innerRadius = this.getDisplayRadius() * this.visualOptions.rings.innerRadius;
      const outerRadius = this.getDisplayRadius() * this.visualOptions.rings.outerRadius;
      
      const ringsGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);
      
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
      
      // Use different glow colors based on star type
      let glowColor = 0xffff00; // Default yellow
      
      if (this.visualOptions.spectralType) {
        const spectralColors = {
          O: 0x9db4ff, // Blue
          B: 0xaabfff, // Blue-white
          A: 0xd8e2ff, // White
          F: 0xfbf8ff, // White-yellow
          G: 0xfff4e8, // Yellow (Sun)
          K: 0xffd2a1, // Orange
          M: 0xffcc6f  // Red
        };
        
        if (spectralColors[this.visualOptions.spectralType]) {
          glowColor = spectralColors[this.visualOptions.spectralType];
        }
      }
      
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          "c": { value: 0.1 },
          "p": { value: 1.2 },
          glowColor: { value: new THREE.Color(glowColor) },
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
      
      // Add subtle pulsing effect for stars
      this.pulseFactor = 0;
      this.pulseDirection = 1;
    } catch (error) {
      console.error('Error creating star glow effect:', error);
      // Continue without glow effect if it fails
    }
  }
  
  /**
   * Add surface detail to planets
   */
  addSurfaceDetail() {
    try {
      // Skip for stars
      if (this.isStar) return;
      
      // Only add detail for planets with significant radius
      if (this.radius < 1000) return;
      
      // Add normal mapping for terrain detail where appropriate
      if (this.name) {
        const planetNormalMaps = {
          'earth': 'earth_normal.jpg',
          'mars': 'mars_normal.jpg',
          'moon': 'moon_normal.jpg',
          'mercury': 'mercury_normal.jpg'
        };
        
        const planetName = this.name.toLowerCase();
        
        if (planetNormalMaps[planetName] && this.mesh.material) {
          const textureLoader = new THREE.TextureLoader();
          const normalMapPath = window.appPath ? 
            `${window.appPath.assetsPath}/textures/${planetNormalMaps[planetName]}` : 
            `assets/textures/${planetNormalMaps[planetName]}`;
          
          textureLoader.load(normalMapPath, (normalMap) => {
            // Convert PhongMaterial to StandardMaterial if needed
            if (this.mesh.material.type === 'MeshPhongMaterial') {
              // Save the current texture
              const diffuseMap = this.mesh.material.map;
              
              // Create new standard material
              const newMaterial = new THREE.MeshStandardMaterial({
                map: diffuseMap,
                normalMap: normalMap,
                normalScale: new THREE.Vector2(1, 1),
                roughness: 0.8,
                metalness: 0.1
              });
              
              // Replace the material
              this.mesh.material.dispose();
              this.mesh.material = newMaterial;
            } else if (this.mesh.material.type === 'MeshStandardMaterial') {
              // Just add the normal map to existing material
              this.mesh.material.normalMap = normalMap;
              this.mesh.material.normalScale = new THREE.Vector2(1, 1);
              this.mesh.material.needsUpdate = true;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error adding surface detail:', error);
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
      
      // Update star pulsing effect if present
      if (this.isStar && this.glowMesh) {
        this.pulseFactor += 0.01 * this.pulseDirection;
        if (this.pulseFactor > 1) {
          this.pulseFactor = 1;
          this.pulseDirection = -1;
        } else if (this.pulseFactor < 0) {
          this.pulseFactor = 0;
          this.pulseDirection = 1;
        }
        
        const scale = 1 + 0.05 * this.pulseFactor;
        this.glowMesh.scale.set(scale, scale, scale);
      }
    }
    
    // Update light position if this is a star
    if (this.light) {
      this.light.position.copy(this.position);
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
      // Skip orbit lines for stars
      if (this.isStar) return;
      
      // Create geometry for orbit line
      const geometry = new THREE.BufferGeometry().setFromPoints(this.orbitPoints);
      
      // Use custom color for orbit line
      const orbitColor = this.visualOptions.orbitColor || this.color;
      
      const material = new THREE.LineBasicMaterial({ 
        color: orbitColor, 
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
      mass: `${(this.mass / 1e24).toFixed(4)} × 10²⁴ kg`,
      radius: `${this.radius.toFixed(0)} km`,
      position: `X: ${this.position.x.toFixed(2)}, Y: ${this.position.y.toFixed(2)}, Z: ${this.position.z.toFixed(2)}`,
      velocity: `${speed.toFixed(2)} km/s`,
      type: this.isStar ? (this.visualOptions.spectralType ? 
                         `Star (Type ${this.visualOptions.spectralType})` : 
                         'Star') : 
                         (this.visualOptions.type || 'Planet'),
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
        undefined,
      // Add composition if available
      composition: this.visualOptions.composition ?
        Object.entries(this.visualOptions.composition)
          .map(([element, percentage]) => `${element}: ${percentage}%`)
          .join(', ') :
        undefined,
      // Add temperature if available
      temperature: this.visualOptions.temperature ?
        `${this.visualOptions.temperature.toFixed(0)} K` :
        undefined,
      // Add atmospheric info if available
      atmosphere: this.visualOptions.atmosphereComposition ?
        Object.entries(this.visualOptions.atmosphereComposition)
          .map(([gas, percentage]) => `${gas}: ${percentage}%`)
          .join(', ') :
        undefined
    };
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Dispose of light
    if (this.light && this.light.parent) {
      this.light.parent.remove(this.light);
    }
    
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
        if (this.mesh.material.normalMap) {
          this.mesh.material.normalMap.dispose();
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
    
    // Clean up atmosphere meshes
    if (this.innerAtmosphereMesh) {
      if (this.innerAtmosphereMesh.geometry) {
        this.innerAtmosphereMesh.geometry.dispose();
      }
      if (this.innerAtmosphereMesh.material) {
        this.innerAtmosphereMesh.material.dispose();
      }
    }
    
    if (this.outerAtmosphereMesh) {
      if (this.outerAtmosphereMesh.geometry) {
        this.outerAtmosphereMesh.geometry.dispose();
      }
      if (this.outerAtmosphereMesh.material) {
        this.outerAtmosphereMesh.material.dispose();
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
