# Solar System Physics Simulator

An interactive educational desktop application that simulates our solar system with accurate physics. Users can manipulate celestial objects and observe the effects on the system, including gravity's impact on spacetime, planetary conditions, and habitability parameters.

## Project Status

This project is in active development. See [Project Status](docs/PROJECT_STATUS.md) for current progress. The project has advanced significantly with many core features completed and educational features in progress.

⚠️ **Note for Developers**: Please review the [Known Issues](docs/KNOWN_ISSUES.md) document before continuing development. Also see the [Next Steps](NEXT_STEPS_UPDATED.md) for detailed information on upcoming features.

## Features

- **Realistic Physics Engine**: N-body simulation calculating gravitational forces between all objects using the optimized Barnes-Hut algorithm
- **Interactive Object Management**: Add, modify, and remove celestial bodies with custom parameters
- **Educational Features**: Real-time data display, astronomical event detection, and orbit prediction
- **3D Visualization**: Interactive rendering with level-of-detail rendering for optimal performance
- **Time Controls**: Pause, accelerate, slow down, or reverse simulation time
- **Save/Load System**: Save and load custom solar system configurations

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

Before running the application, be aware of these key technical issues that need addressing:

1. **Asset Integration**: The project currently lacks proper textures - see [Next Steps](NEXT_STEPS_UPDATED.md) for details
2. **Feature Integration**: Several features have been implemented in separate branches and need final integration

See [Next Steps](NEXT_STEPS_UPDATED.md) for detailed fixes and development plans.

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
│   └── data/              # Data models and storage logic
├── assets/                # Static resources
│   ├── textures/          # Planet and star textures
│   └── icons/             # Application icons
├── docs/                  # Documentation
└── package.json           # Project configuration
```

## Technical Priorities

Current technical priorities for the next development phase:

1. **Educational Features**: Implement guided tours and more educational content
2. **Visual Enhancements**: Add high-quality textures and more realistic effects
3. **User Experience**: Create comprehensive help system and tutorials
4. **Deployment Preparation**: Configure cross-platform builds and packaging

See [Next Steps](NEXT_STEPS_UPDATED.md) for detailed implementation guidance.

## Recent Achievements

1. **Performance Optimization**:
   - Implemented Barnes-Hut algorithm reducing physics calculations from O(n²) to O(n log n)
   - Added level-of-detail rendering for distant objects
   - Optimized orbit line generation based on distance
   - Added performance monitoring UI with toggleable optimizations

2. **Educational Features**:
   - Added astronomical event detection for conjunctions, oppositions, eclipses, and close approaches
   - Implemented events panel with filtering and focus capabilities
   - Added orbit prediction visualization for educational purposes

3. **User Experience**:
   - Implemented save/load functionality for custom solar system configurations
   - Added adaptive physics resolution for better stability at high time scales
   - Improved camera controls with focus functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details.
