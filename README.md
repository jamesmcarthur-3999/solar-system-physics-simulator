# Solar System Physics Simulator

An interactive educational desktop application that simulates our solar system with accurate physics. Users can manipulate celestial objects and observe the effects on the system, including gravity's impact on spacetime, planetary conditions, and habitability parameters.

## Project Status

This project is in active development. See [Project Status](docs/PROJECT_STATUS.md) for current progress.

⚠️ **Note for Developers**: Please review the [Known Issues](docs/KNOWN_ISSUES.md) document before continuing development.

## Features

- **Realistic Physics Engine**: N-body simulation calculating gravitational forces between all objects
- **Interactive Object Management**: Add, modify, and remove celestial bodies with custom parameters
- **Educational Features**: Real-time data display, habitability indicators, and scientific explanations
- **3D Visualization**: Interactive rendering with realistic textures and effects
- **Time Controls**: Pause, accelerate, slow down, or reverse simulation time

## Technical Architecture

- **Electron**: Cross-platform desktop application framework
- **Three.js**: 3D rendering library for WebGL
- **Custom Physics**: N-body gravity simulation with Newtonian physics

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

1. **Module System**: Project mixes CommonJS and ES Modules, which requires standardization
2. **Asset Paths**: Texture loading will fail with current path resolution approach
3. **Error Handling**: Limited error handling throughout the application

See [Next Steps](NEXT_STEPS.md) for detailed fixes and development plans.

## Project Documentation

- [Project Guide](docs/PROJECT_GUIDE.md): Overview of project architecture and goals
- [Project Status](docs/PROJECT_STATUS.md): Current development status
- [Data Models](docs/DATA_MODELS.md): Core data structures
- [Known Issues](docs/KNOWN_ISSUES.md): Current limitations and bugs
- [Next Steps](NEXT_STEPS.md): Priority development tasks

## Development Workflow

1. Review the [Known Issues](docs/KNOWN_ISSUES.md) document
2. Choose a task from the [Next Steps](NEXT_STEPS.md) document
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

1. **Fix Module System**: Standardize on ES Modules or CommonJS
2. **Asset Loading**: Implement proper path resolution for texture loading
3. **Physics Improvements**: Enhance accuracy and performance of gravity calculations
4. **Memory Management**: Add proper cleanup for Three.js resources
5. **Error Handling**: Implement robust error handling throughout

See [Next Steps](NEXT_STEPS.md) for detailed implementation guidance.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
