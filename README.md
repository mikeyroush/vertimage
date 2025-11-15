# Vertimage - Photo to Drone Light Show Converter

Vertimage is a web application that converts uploaded photos into drone light show configurations. Event planners can upload images and automatically generate optimal drone placement coordinates with corresponding RGB and brightness values for each drone.

## Features

- 📸 Upload photos (JPG, PNG, WebP)
- 🎯 Configure drone count (10-1000)
- 🌟 Adjust brightness thresholds
- 🎨 Real-time visual preview
- 📊 Export CSV with drone data

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: Zustand
- **Image Processing**: Canvas API

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

## Architecture

The application follows clean architecture principles with clear separation of concerns:

- **Presentation Layer**: React components and UI
- **Application Layer**: State management and business logic
- **Domain Layer**: Core types and algorithms
- **Infrastructure Layer**: Canvas API and file operations

## Development Phases

1. **Phase 1**: Project setup and configuration ✓
2. **Phase 2**: Core types and algorithms
3. **Phase 3**: State management
4. **Phase 4**: UI layout and controls
5. **Phase 5**: Image upload and canvas
6. **Phase 6**: Vertex visualization
7. **Phase 7**: CSV export
8. **Phase 8**: Optimization and polish

## License

MIT