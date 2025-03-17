// Import Three.js using CommonJS syntax
const THREE = require('three');

// CelestialObject class representing a celestial body
class CelestialObject {
  constructor({
    id,
    name,
    mass,
    radius,
    position,
    velocity,
    color,
    texture,
    isStar = false
  }) {
    this.id = id || Math.random().toString(36).substring(2, 9);
    this.name = name;
    this.mass = mass; // kg
    this.radius = radius; // km
    this.position = new THREE.Vector3(...position); // [x, y, z] in AU
    this.velocity = new THREE.Vector3(...velocity); // [vx, vy, vz] in km/s
    this.color = color;
    this.texturePath = texture;
    this.isStar = isStar;
    
    // Additional properties
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.orbitPoints = [];
    this.orbitLine = null;
    
    // Create the 3D representation
    this.createMesh();
  }

  createMesh() {
    try {
      // Create geometry
      const geometry = new THREE.SphereGeometry(this.getDisplayRadius(), 32, 32);
      
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
          material = new THREE.MeshPhongMaterial({ map: texture });
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
      
      // Add glow effect for stars
      if (this.isStar) {
        this.addStarGlow();
      }
    } catch (error) {
      console.error('Error creating celestial object mesh:', error);
      // Create fallback representation
      const geometry = new THREE.SphereGeometry(this.getDisplayRadius(), 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: this.color || 0xff0000 });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.copy(this.position);
      this.mesh.userData.objectId = this.id;
    }
  }

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

  getDisplayRadius() {
    // Scale radius for display (planets would be too small otherwise)
    return this.isStar
      ? Math.log10(this.radius) * 2
      : Math.log10(this.radius) * 4;
  }

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
    }
    
    // Clear acceleration for next calculation
    this.acceleration.set(0, 0, 0);
    
    // Update orbit trail
    this.updateOrbitTrail();
  }

  updateOrbitTrail() {
    // Add current position to orbit points (keeping only the most recent points)
    const maxPoints = 500;
    this.orbitPoints.push(new THREE.Vector3().copy(this.position));
    if (this.orbitPoints.length > maxPoints) {
      this.orbitPoints.shift();
    }
  }

  createOrbitLine(scene) {
    if (!scene) return;
    
    try {
      // Create geometry for orbit line
      const geometry = new THREE.BufferGeometry().setFromPoints(this.orbitPoints);
      const material = new THREE.LineBasicMaterial({ color: this.color, opacity: 0.5, transparent: true });
      
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

  getInfo() {
    return {
      name: this.name,
      mass: `${(this.mass / 1e24).toFixed(2)} × 10²⁴ kg`,
      radius: `${this.radius.toFixed(0)} km`,
      position: `X: ${this.position.x.toFixed(2)}, Y: ${this.position.y.toFixed(2)}, Z: ${this.position.z.toFixed(2)}`,
      velocity: `${Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2 + this.velocity.z ** 2).toFixed(2)} km/s`,
      type: this.isStar ? 'Star' : 'Planet'
    };
  }
  
  // Clean up resources
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