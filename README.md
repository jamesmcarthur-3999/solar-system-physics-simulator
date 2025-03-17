# Solar System Physics Simulator

An interactive educational desktop application that simulates our solar system with accurate physics. Users can manipulate celestial objects and observe the effects on the system, including gravity's impact on spacetime, planetary conditions, and habitability parameters.

## Project Status

This project is in active development. See [Project Status](docs/PROJECT_STATUS.md) for current progress. The project has advanced significantly with many core features completed and educational features implemented.

⚠️ **Note for Developers**: Please review the [Known Issues](docs/KNOWN_ISSUES.md) document before continuing development. Also see the [Next Steps](NEXT_STEPS_UPDATED.md) for detailed information on upcoming features.

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

## Project Documentation

- [Project Guide](docs/PROJECT_GUIDE.md): Overview of project architecture and goals
- [Project Status](docs/PROJECT_STATUS.md): Current development status
- [Data Models](docs/DATA_MODELS.md): Core data structures
- [Known Issues](docs/KNOWN_ISSUES.md): Current limitations and bugs
- [Next Steps](NEXT_STEPS_UPDATED.md): Priority development tasks

## Development Workflow

1. Review the [Known Issues](docs/KNOWN_ISSUES.md) document
2. Choose a task from the [Next Steps](NEXT_STEPS_UPDATED.md) document
3. Create a feature branch for your work
4. Submit a pull request with your changes
5. Update documentation as needed

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
