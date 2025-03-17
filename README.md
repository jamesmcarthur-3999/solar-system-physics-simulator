# Solar System Physics Simulator

An interactive educational desktop application that simulates our solar system with accurate physics. Users can manipulate celestial objects and observe the effects on the system, including gravity's impact on spacetime, planetary conditions, and habitability parameters.

## Project Status

This project is in active development. See [Project Status](docs/PROJECT_STATUS.md) for current progress. The project has advanced significantly with many core features completed and educational features implemented.

⚠️ **Note for Developers**: Please review the [Known Issues](docs/KNOWN_ISSUES.md) document before continuing development. Also see the [Next Steps](NEXT_STEPS_UPDATED.md) for detailed information on upcoming features.

### Recent Updates (March 17, 2025)

- ✅ Fixed ES Module loading issues in preload.js using dynamic imports
- ✅ Added missing constants.js file for physics calculations
- ✅ Updated Content Security Policy to allow dynamic module loading
- ✅ Improved error handling and documentation

See [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md) for technical details on these fixes.

## Features

- **Realistic Physics Engine**: N-body simulation calculating gravitational forces between all objects using the optimized Barnes-Hut algorithm
- **Interactive Object Management**: Add, modify, and remove celestial bodies with custom parameters
- **Educational Features**: Guided tours, information panels, and real-time data display
- **3D Visualization**: Interactive rendering with high-quality textures and realistic effects
- **Time Controls**: Pause, accelerate, slow down, or reverse simulation time
- **Save/Load System**: Save and load custom solar system configurations
- **Multiple Configurations**: Switch between different solar system configurations (full system, inner planets, etc.)

## Educational Features

The simulator includes several educational components:

- **Guided Tours**: Step-by-step tours explaining solar system concepts
- **Information Panels**: Detailed information about celestial bodies and astronomical concepts
- **Educational Menu**: Easy access to all educational features
- **Scientific Data**: Comprehensive information about each celestial body
- **Visual Effects**: Realistic atmospheric effects, ring systems, and lighting

## Physics Model

The simulator uses a sophisticated physics model to accurately represent celestial mechanics:

- **Newtonian Gravity**: Universal gravitational attraction between all bodies
- **Barnes-Hut Algorithm**: Optimized gravity calculations with O(n log n) complexity
- **Adaptive Time Steps**: Maintains stability at high time scales
- **Orbital Mechanics**: Accurately simulates orbital dynamics, including perturbations
- **Collision Detection**: Basic detection and response for object collisions
- **Spacecraft Trajectories**: (Planned) Realistic orbital mechanics for spacecraft

The physics engine models the following forces and phenomena:

- Gravitational attraction between all celestial bodies
- Rotational dynamics of planets and moons
- Atmospheric effects and their visual representation
- Orbital stability and perturbation

## Technical Architecture

- **Electron**: Cross-platform desktop application framework
- **Three.js**: 3D rendering library for WebGL
- **Custom Physics**: Optimized N-body gravity simulation with Barnes-Hut algorithm

## Getting Started

### Prerequisites

- Node.js (14.x or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/jamesmcarthur-3999/solar-system-physics-simulator.git
```

2. Install dependencies
```
npm install
```

3. Run the application
```
npm start
```

### Immediate Technical Notes

Before running the application, be aware of these key technical issues:

1. **Textures**: The application will automatically download required textures on first run
2. **Feature Integration**: Several features have been implemented and are now available through the UI
3. **Module System**: The application uses a mixed module system (CommonJS for main process, ES modules for renderer)

See [Next Steps](NEXT_STEPS_UPDATED.md) for detailed development plans.

## Using the Simulator

### Basic Controls

- **Play/Pause**: Start or stop the simulation (Space bar)
- **Time Scale**: Adjust simulation speed using buttons or up/down arrow keys
- **Camera**: Left-click and drag to rotate, right-click and drag to pan, scroll to zoom
- **Reset View**: Reset camera to default position (R key)
- **System Selection**: Choose different solar system configurations from the dropdown

### Educational Features

- **Educational Menu**: Click the ? button in the bottom-right corner
- **Guided Tours**: Select from available tours in the educational menu
- **Information Panels**: Access detailed information about celestial bodies and concepts

### Adding Objects

- Click "Add Object" to create new celestial bodies
- Configure parameters such as mass, radius, position, and velocity
- Advanced options allow setting custom textures, atmospheres, and other properties

## Performance Considerations

The application is optimized for performance in several ways:

- **Barnes-Hut Algorithm**: Reduces gravity calculations from O(n²) to O(n log n)
- **Level-of-Detail Rendering**: Adjusts detail based on distance for better performance
- **Adaptive Physics Resolution**: Adjusts calculation precision based on time scale
- **Optimized Textures**: Uses efficient texture formats and resolutions
- **Selective Rendering**: Only renders what's visible in the current view

For optimal performance:

- Limit the number of objects to fewer than 100 for most systems
- Use simpler configurations for less powerful hardware
- Consider reducing texture quality in the settings if needed

## Project Documentation

- [Project Guide](docs/PROJECT_GUIDE.md): Overview of project architecture and goals
- [Project Status](docs/PROJECT_STATUS.md): Current development status
- [Data Models](docs/DATA_MODELS.md): Core data structures
- [Known Issues](docs/KNOWN_ISSUES.md): Current limitations and bugs
- [Next Steps](NEXT_STEPS_UPDATED.md): Priority development tasks
- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md): Technical details of recent implementations

## Development Workflow

1. Review the [Known Issues](docs/KNOWN_ISSUES.md) document
2. Choose a task from the [Next Steps](NEXT_STEPS_UPDATED.md) document
3. Create a feature branch for your work
4. Submit a pull request with your changes
5. Update documentation as needed

## Contributing

Contributions to this project are welcome! Here's how you can contribute:

1. **Bug Reports**: Submit issues for any bugs or problems you encounter
2. **Feature Requests**: Suggest new features or improvements
3. **Code Contributions**: Submit pull requests for bug fixes or new features
4. **Documentation**: Help improve or expand the documentation
5. **Testing**: Test the application on different platforms and report issues

Please follow these guidelines when contributing:

- Follow the existing code style and conventions
- Write clear commit messages that explain your changes
- Update documentation to reflect any changes
- Add tests for new features when possible
- Ensure your changes don't break existing functionality

## Directory Structure

```
/
├── src/                   # Source code
│   ├── main.js            # Electron main process
│   ├── preload.js         # Electron preload script
│   ├── renderer/          # 3D visualization components
│   ├── physics/           # Physics simulation engine
│   ├── ui/                # User interface components
│   ├── data/              # Data models and storage logic
│   └── utils/             # Utility functions
├── assets/                # Static resources
│   ├── textures/          # Planet and star textures
│   └── icons/             # Application icons
├── docs/                  # Documentation
└── package.json           # Project configuration
```

## Extending the Application

The simulator is designed to be extensible. Here are some ways to extend its functionality:

### Adding New Celestial Body Types

1. Extend the `CelestialObject` class in `src/data/celestialObject.js`
2. Add new properties and methods specific to the new type
3. Update the UI to support creating and editing the new type

### Creating New Educational Content

1. Add new tours in `src/ui/tourManager.js`
2. Add new information panels in `src/ui/informationPanelManager.js`
3. Update the educational menu in `src/ui/educationalMenu.js`

### Adding Custom Physics

1. Modify the physics engine in `src/physics/gravitySimulator.js`
2. Add new force calculations or interactions
3. Update the visualization to represent the new physics

## Future Roadmap

Beyond the immediate next steps, the project roadmap includes:

1. **Advanced Educational Features**:
   - Interactive experiments with modifiable parameters
   - Comparative visualization of different physical models
   - Scenario-based learning modules

2. **Extended Simulation Capabilities**:
   - Exoplanet system simulation
   - Star formation and evolution
   - Galaxy-scale simulations

3. **Integration with External Data**:
   - Import real astronomical data from NASA, ESA, etc.
   - Integration with sky observation tools
   - Real-time updates based on current astronomical events

4. **Community Features**:
   - Shared simulation configurations
   - User-created educational content
   - Classroom-focused features for educators

## Technical Priorities

Current technical priorities for the next development phase:

1. **Educational Features**: Add more guided tours and educational content
2. **Visual Enhancements**: Implement more realistic effects for educational purposes
3. **User Experience**: Create comprehensive help system and tutorials
4. **Deployment Preparation**: Configure cross-platform builds and packaging

See [Next Steps](NEXT_STEPS_UPDATED.md) for detailed implementation guidance.

## Recent Achievements

1. **Educational Feature Implementation**:
   - Added guided tour system for explaining solar system concepts
   - Implemented educational information panels with detailed content
   - Created educational menu for easy access to educational features

2. **Visual Enhancement**:
   - Added high-quality texture support with automatic downloading
   - Implemented realistic lighting effects for stars
   - Added atmospheric effects for planets

3. **User Experience Improvements**:
   - Added system selector for switching between configurations
   - Implemented keyboard shortcuts for common actions
   - Enhanced camera controls and navigation

4. **Technical Improvements**:
   - Fixed module system inconsistencies with dynamic imports
   - Added proper error handling throughout the application
   - Implemented CSP adjustments for module loading
   - Created missing physics constants file

## Acknowledgments

- Planet and star textures are sourced from [Solar System Scope](https://www.solarsystemscope.com/textures/)
- Solar system data is based on NASA's fact sheets and the [NASA Solar System Exploration](https://solarsystem.nasa.gov/) website
- The Barnes-Hut algorithm implementation is inspired by the paper "A Hierarchical O(N log N) Force-Calculation Algorithm" by J. Barnes and P. Hut

## FAQ

### Does the simulator use actual astronomical data?
Yes, the default solar system is based on real astronomical data for the Sun, planets, and major moons.

### Can I create fictional solar systems?
Yes, you can add, remove, and modify celestial bodies to create your own custom solar systems.

### How accurate is the physics simulation?
The simulator uses Newtonian gravitational physics with high accuracy. It doesn't currently model relativistic effects or quantum phenomena.

### What are the system requirements?
A modern computer with WebGL support should be sufficient. For best performance, a dedicated GPU is recommended.

### Can I use this for educational purposes?
Yes, the simulator is designed for educational use and is freely available under the MIT license.

### How do I report bugs or request features?
Please submit issues on the GitHub repository with detailed information about bugs or feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
