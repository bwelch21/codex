# Food Allergy Assistant

A comprehensive monorepo application designed to improve quality of life for people with food allergies, specifically focusing on safe dining and travel experiences.

## 🚀 Overview

This application provides essential tools and information for individuals with food allergies to navigate restaurants, travel, and daily food choices with confidence and safety.

### 🎯 Mission
To create a safer, more accessible world for people with food allergies by providing reliable information, community support, and practical tools for everyday situations.

## 🏗️ Monorepo Structure

This project is organized as a monorepo with three main services that work together:

```
├── services/
│   ├── api/              # Internal API Backend (Port 4000)
│   ├── web-server/       # Public-facing Web Server (Port 3001)
│   └── frontend/         # React Frontend Application (Port 5173)
├── start-dev.sh          # Development startup script
├── stop-dev.sh           # Development cleanup script
├── package.json          # Root workspace configuration
├── .nvmrc               # Node.js version specification (18.18.2)
└── README.md            # This file
```

### 📦 Services Architecture

#### 1. **API Service** (`services/api/`) - Port 4000
- **Purpose**: Internal business logic and data management
- **Technology**: Express.js + TypeScript
- **Endpoints**:
  - `GET /api/ping` - Service connectivity test
  - `GET /health` - Health check and uptime
- **Features**:
  - Core application business logic
  - Future: Data persistence and retrieval
  - Future: Authentication and authorization
  - Future: Allergen database management

#### 2. **Web Server** (`services/web-server/`) - Port 3001
- **Purpose**: Public-facing API that the frontend connects to
- **Technology**: Express.js + TypeScript  
- **Endpoints**:
  - `GET /api/hello-world` - Returns welcome message with service info
  - `GET /health` - Health check and uptime
- **Features**:
  - Client-facing API endpoints
  - Request routing and validation
  - Rate limiting and security middleware
  - CORS configured for frontend communication

#### 3. **Frontend** (`services/frontend/`) - Port 5173
- **Purpose**: User interface and experience
- **Technology**: React + TypeScript + Vite
- **Features**:
  - Modern React application with hooks
  - Comprehensive design system
  - Component-based architecture with single responsibility
  - Real-time API integration with loading/error states
  - Responsive design optimized for food allergy use cases

## 📋 Prerequisites

- **Node.js** >= 18.0.0 (see `.nvmrc` for exact version: 18.18.2)
- **npm** (comes with Node.js)
- **nvm** (recommended for Node version management)

## 🛠️ Installation & Setup

### Quick Start

1. **Clone and navigate to the project**:
   ```bash
   git clone <repository-url>
   cd codex
   ```

2. **Use the correct Node.js version**:
   ```bash
   nvm use
   # If the version isn't installed: nvm install 18.18.2
   ```

3. **Install all dependencies**:
   ```bash
   npm install
   ```

4. **Start all services**:
   ```bash
   ./start-dev.sh
   ```

5. **Open the application**:
   - **Frontend**: http://localhost:5173
   - **Web Server API**: http://localhost:3001
   - **Internal API**: http://localhost:4000

### Alternative Setup

If you prefer to start services individually:

```bash
# Install dependencies
npm install

# Start each service in separate terminals
npm run dev:api        # Terminal 1 - API Service
npm run dev:web-server # Terminal 2 - Web Server  
npm run dev:frontend   # Terminal 3 - Frontend
```

## 🔧 Development Workflow

### Development Scripts

```bash
# Start all services with one command
./start-dev.sh          # Starts all services with process management

# Stop all services
./stop-dev.sh           # Gracefully stops all running services

# Individual service management
npm run dev:api         # Start API service only
npm run dev:web-server  # Start web server only
npm run dev:frontend    # Start frontend only

# Monitoring and testing
npm run status          # Check status of all services
npm run test:all        # Test all API endpoints
npm run test:web-server # Test web server endpoint
npm run test:api        # Test internal API endpoint
npm run test:frontend   # Test frontend availability
```

### Build & Production

```bash
# Build all services
npm run build

# Build individual services
npm run build:api
npm run build:web-server
npm run build:frontend

# Production start (after building)
npm run start
```

## 📡 API Endpoints & Integration

### Current Working Endpoints

#### Web Server (Public API) - http://localhost:3001
- **GET** `/api/hello-world`
  ```json
  {
    "success": true,
    "data": {
      "message": "Hello, World!",
      "timestamp": "2025-01-01T00:00:00.000Z",
      "service": "web-server"
    }
  }
  ```
- **GET** `/health` - Service health and uptime

#### Internal API - http://localhost:4000  
- **GET** `/api/ping` - Internal connectivity test
- **GET** `/health` - Service health and uptime

### Frontend Integration

The React frontend successfully connects to the web server and displays:
- ✅ **Hello World Message**: Fetched from `/api/hello-world`
- ✅ **Service Information**: Shows timestamp and service name
- ✅ **Loading States**: Proper loading indicators
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Refresh Functionality**: Manual data refresh capability

## 🎨 Design System & UI

### Color Palette
Our design system uses colors specifically chosen for food allergy awareness:

- **Primary (Orange)**: `#f97316` - Food allergy awareness color
- **Secondary (Blue)**: `#3b82f6` - Trust and reliability  
- **Success (Green)**: `#22c55e` - Allergen-free confirmations
- **Warning (Amber)**: `#f59e0b` - Allergen alerts
- **Error (Red)**: `#ef4444` - Allergen dangers
- **Neutrals**: Gray scale for text and backgrounds

### Typography
- **Primary Font**: Inter - Modern, highly readable
- **Secondary Font**: Merriweather - Elegant serif for emphasis
- **Monospace**: JetBrains Mono - Code and data display

### Component Architecture
- **Modular Design**: Each component has a single responsibility
- **Composition-based**: Components can be composed together
- **TypeScript**: Full type safety across all components
- **Responsive**: Mobile-first design approach
- **Accessible**: Built with accessibility in mind

### Current Components
- ✅ **Button**: Multiple variants (primary, secondary, success, warning, error, outline)
- ✅ **LandingPage**: Main application page with API integration
- ✅ **Theme System**: Centralized design tokens

## 🔄 Current Features

### ✅ Infrastructure & Development
- Monorepo setup with npm workspaces
- TypeScript configuration across all services
- ESLint and Prettier for code quality
- Single development script for easy service management
- Health monitoring endpoints
- Comprehensive logging system

### ✅ Backend Services
- Express.js servers with security middleware
- CORS configuration for frontend integration
- Rate limiting and compression
- Centralized error handling
- Graceful shutdown handling

### ✅ Frontend Application
- Modern React with TypeScript and Vite
- Beautiful landing page showcasing the app's purpose
- Real-time API integration with the web server
- Loading states and error handling
- Responsive design with food allergy-focused theming
- Component library foundation

### ✅ Service Communication
- Frontend successfully fetches data from web server
- All services have health check endpoints
- Proper error handling across service boundaries
- Development tools for testing connectivity

## 🛣️ Development Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Monorepo infrastructure setup
- [x] Basic frontend with design system
- [x] API service architecture
- [x] Service-to-service connectivity
- [x] Development workflow and tooling

### Phase 2: Core Features (Next)
- [ ] User authentication system
- [ ] Restaurant search and filtering
- [ ] Basic allergen database
- [ ] Restaurant allergen safety ratings
- [ ] User profile and allergy settings

### Phase 3: Enhanced Features
- [ ] Travel guides for food allergies
- [ ] Emergency allergy information cards
- [ ] Advanced ingredient analysis
- [ ] Community reviews and recommendations
- [ ] Allergen alert notifications

### Phase 4: Advanced Features
- [ ] Mobile app development
- [ ] Offline functionality
- [ ] Integration with restaurant POS systems
- [ ] Machine learning for personalized recommendations
- [ ] Multi-language support

## 🏃‍♂️ Quick Commands Reference

```bash
# Development
./start-dev.sh              # Start everything
./stop-dev.sh               # Stop everything
npm run status              # Check all services

# Testing
curl http://localhost:5173  # Test frontend
curl http://localhost:3001/api/hello-world  # Test web server
curl http://localhost:4000/api/ping         # Test API

# Logs
tail -f services/logs/frontend.log      # Frontend logs
tail -f services/logs/web-server.log    # Web server logs
tail -f services/logs/api.log           # API logs

# Code Quality
npm run lint                # Lint all services
npm run format              # Format all code
npm run build               # Build all services
```

## 🎯 Code Quality & Standards

### Linting and Formatting
```bash
npm run lint          # Check for linting issues across all services
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

### TypeScript
- Strict type checking enabled across all services
- Shared type definitions where appropriate
- Full type safety for all API interactions

### Testing Strategy
- Health check endpoints for monitoring
- API endpoint testing with curl
- Frontend connectivity testing
- Future: Unit tests, integration tests, e2e tests

## 🔧 Troubleshooting

### Node.js Version Issues
If you encounter Node.js version conflicts:
```bash
# Ensure you're using the correct version
nvm use 18.18.2

# Verify versions
node --version  # Should show v18.18.2
npm --version   # Should show v9.8.1 or compatible
```

### Service Won't Start
```bash
# Check if ports are in use
lsof -i :3001  # Web server port
lsof -i :4000  # API port
lsof -i :5173  # Frontend port

# Clean restart
./stop-dev.sh
./start-dev.sh
```

### Dependencies Issues
```bash
# Clean install
npm run clean
npm install
```

## 🤝 Contributing

1. **Follow existing patterns**: Use the established code style and architecture
2. **TypeScript first**: Ensure all new code has proper type definitions
3. **Component architecture**: Follow single responsibility principle
4. **Test your changes**: Use the provided testing commands
5. **Update documentation**: Keep README and comments current

### Development Guidelines
- Use the design system tokens for consistent styling
- Follow the established folder structure
- Add proper error handling for all user interactions
- Test across all three services when making changes
- Use semantic commit messages

## 📄 License

MIT License - see LICENSE file for details.

---

## 🌟 Current Status: **Functional Development Environment**

The development environment is set up and working:
- ✅ **Frontend**: Beautiful landing page with API integration  
- ✅ **Web Server**: RESTful API with hello-world endpoint
- ✅ **API Service**: Internal business logic foundation
- ✅ **Communication**: Frontend successfully fetches and displays data from web server
- ✅ **Development**: Single script for easy development workflow

**Ready for active development of food allergy features!**

---

**Made with ❤️ for the food allergy community**
