# Vertimage - Photo to Drone Light Show Converter

Vertimage is a web application that converts uploaded photos into drone light show configurations. Event planners can upload images and automatically generate optimal drone placement coordinates with corresponding RGB and brightness values for each drone.

## Features

- 📸 **Image Upload**: Support for JPG, PNG, and WebP formats
- 🎯 **Configurable Drone Count**: 10-1000 drones with real-time visualization
- 🌟 **Smart Placement Algorithm**: Two distribution modes:
  - Standard grid distribution
  - "Avoid Dark Areas" mode for focusing drones on bright regions
- 🎨 **Real-time Visual Preview**: Interactive canvas with multiple view options
- 🔍 **Zoom Controls**: 0.5x to 3x zoom with smooth scaling
- 👁️ **View Controls**: Toggle image preview, vertices, details, and brightness mask
- 📊 **CSV Export**: Download drone configurations (ID, X, Y, Z, R, G, B, Brightness)
- 🎛️ **Advanced Controls**:
  - Brightness threshold adjustment
  - Sampling radius for color averaging
  - Mask grid density for precision control
- ♿ **Accessibility**: Keyboard navigation and screen reader support

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **Image Processing**: Canvas API with custom algorithms
- **Architecture**: Clean architecture with DDD principles

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Usage Guide

### Basic Workflow
1. **Upload an Image**: Click the upload area or drag & drop an image
2. **Configure Settings**: Adjust drone count and brightness threshold
3. **Choose Distribution Mode**: Toggle "Avoid Dark Areas" for intelligent placement
4. **Preview Results**: Use view controls to inspect the vertex distribution
5. **Export Data**: Download CSV file with all drone coordinates and colors

### Advanced Features

#### Avoid Dark Areas Mode
When enabled, this mode:
- Analyzes image brightness to identify bright regions
- Distributes drones evenly throughout bright areas only
- Provides visual mask overlay showing detected bright regions
- Adjustable mask grid density for fine-tuning detection

#### View Controls Panel
Located in the top-right corner with:
- **Minimized State**: Color-coded indicators for quick status check
- **Expanded State**: Full controls accessible on hover
- **Zoom Controls**: Adjust preview size from 50% to 300%

## Architecture

The application follows clean architecture principles with clear separation of concerns:

```
src/
├── presentation/     # React components and UI
│   ├── components/  # Reusable UI components
│   └── pages/       # Page components
├── application/     # State management and hooks
│   ├── store/       # Zustand stores
│   └── hooks/       # Custom React hooks
├── domain/          # Core business logic
│   ├── types/       # TypeScript types
│   └── algorithms/  # Vertex distribution algorithms
└── infrastructure/  # External services and APIs
    └── canvas/      # Canvas rendering utilities
```

### Key Algorithms

- **Standard Distribution**: Grid-based vertex placement
- **Brightness-Aware Distribution**: Systematic grid placement within bright areas
- **Color Sampling**: Weighted average of surrounding pixels
- **Brightness Calculation**: RGB to luminance conversion

## Development

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run type-check # Run TypeScript compiler
```

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Clean architecture principles
- Conventional commits

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes using conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT