          velocityEl.textContent = `${speed.toFixed(2)} km/s`;
        }
      }
    } catch (error) {
      console.error('Error updating selected object info:', error);
    }
  }
  
  // Clean up resources
  dispose() {
    try {
      // Cancel animation frame
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      // Remove event listeners
      window.removeEventListener('resize', this.resizeHandler);
      
      if (this.playPauseButton) this.playPauseButton.removeEventListener('click', this.togglePlayPause);
      if (this.timeSlowerButton) this.timeSlowerButton.removeEventListener('click', this.decreaseTimeScale);
      if (this.timeFasterButton) this.timeFasterButton.removeEventListener('click', this.increaseTimeScale);
      if (this.resetViewButton) this.resetViewButton.removeEventListener('click', this.resetView);
      if (this.addObjectButton) this.addObjectButton.removeEventListener('click', this.addNewObject);
      
      // Dispose of objects
      for (const object of this.objects) {
        if (object.mesh) {
          // Remove from scene
          this.scene.remove(object.mesh);
          
          // Dispose of geometries and materials
          if (object.mesh.geometry) {
            object.mesh.geometry.dispose();
          }
          
          if (object.mesh.material) {
            if (Array.isArray(object.mesh.material)) {
              object.mesh.material.forEach(material => material.dispose());
            } else {
              object.mesh.material.dispose();
            }
          }
        }
        
        // Dispose of orbit line
        if (object.orbitLine) {
          this.scene.remove(object.orbitLine);
          if (object.orbitLine.geometry) object.orbitLine.geometry.dispose();
          if (object.orbitLine.material) object.orbitLine.material.dispose();
        }
      }
      
      // Clear objects array
      this.objects = [];
      
      // Dispose of stars background
      if (this.stars) {
        this.scene.remove(this.stars);
        if (this.stars.geometry) this.stars.geometry.dispose();
        if (this.stars.material) this.stars.material.dispose();
      }
      
      // Dispose of controls
      if (this.controls) {
        this.controls.dispose();
      }
      
      // Dispose of renderer
      if (this.renderer) {
        this.renderer.dispose();
      }
      
      console.log('Resources disposed');
    } catch (error) {
      console.error('Error disposing resources:', error);
    }
  }
}

// Clean up resources on window unload
window.addEventListener('beforeunload', () => {
  if (window.solarSystemApp) {
    window.solarSystemApp.dispose();
  }
});