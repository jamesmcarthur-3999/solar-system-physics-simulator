# Textures for Solar System Physics Simulator

This directory should contain the texture files for the celestial objects in the simulation.

## Required Textures

The following textures are expected by the application:

- `sun.jpg` - Texture for the Sun
- `mercury.jpg` - Texture for Mercury
- `venus.jpg` - Texture for Venus
- `earth.jpg` - Texture for Earth
- `mars.jpg` - Texture for Mars
- `jupiter.jpg` - Texture for Jupiter
- `saturn.jpg` - Texture for Saturn
- `uranus.jpg` - Texture for Uranus
- `neptune.jpg` - Texture for Neptune

## Adding Textures

You can download free textures from the following sources:

- [Solar System Scope](https://www.solarsystemscope.com/textures/) - Provides free planetary textures
- [NASA Visible Earth](https://visibleearth.nasa.gov/) - Contains Earth and planetary textures
- [James Webb Space Telescope](https://webbtelescope.org/) - Contains high-quality images that can be adapted

After downloading textures, rename them according to the names listed above and place them in this directory.

## Using Fallbacks

If textures are not available, the application will automatically fall back to using solid colors for celestial objects. However, textures provide a much more realistic and visually appealing experience.

## Legal Note

Please ensure you have the right to use any textures you add. The textures mentioned above should be used in accordance with their respective licenses.

## Performance Considerations

- Use JPEG format for better performance (PNG files can be converted to JPEG)
- Recommended texture resolution: 2048x1024 pixels (or 1024x512 for smaller planets)
- Higher resolution textures will look better but may affect performance on lower-end systems
