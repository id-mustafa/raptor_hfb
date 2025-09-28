# Rex Bets
*High-frequency social betting platform with real-time multiplayer gameplay*

Rex Bets is a social betting application that brings competitive wagering to friend groups through real-time question-based betting sessions. Players join lobbies, answer rapid-fire questions about sports scenarios, and compete for points using a strategic multiplier system.

## Tech Stack

### Frontend
- **React Native** with Expo Router for cross-platform mobile development
- **NativeWind** for Tailwind CSS styling in React Native
- **TypeScript** for type safety
- **Custom UI Components** built with @rn-primitives for native feel
- **Real-time Updates** via API polling and WebSocket connections

### Backend
- **FastAPI** with automatic OpenAPI documentation
- **SQLModel** for database ORM with Pydantic integration
- **PostgreSQL** for persistent data storage
- **Uvicorn** ASGI server for production deployment
- **Python 3.12** runtime environment

### Infrastructure
- **Docker** containerization for both frontend and backend
- **Ubuntu 22.04** base images for consistent environments
- **Honcho** for local development process management
- **Git** version control with proper .gitignore configurations

## Architecture Overview

```
raptor_hfb/
├── frontend/           # React Native + Expo application
│   ├── app/           # File-based routing with Expo Router
│   ├── components/    # Reusable UI components
│   ├── api/          # HTTP client and API integration
│   └── utils/        # Authentication and utility functions
├── backend/           # FastAPI server application  
│   ├── controllers/   # Request handlers and route logic
│   ├── services/      # Business logic layer
│   ├── models/        # SQLModel database schemas
│   └── main.py       # FastAPI app configuration
└── docker-compose.yml # Multi-container orchestration
```

## Key Features Implemented

### User Management System
- User registration and authentication
- Friend connections and social features
- Player profiles with persistent statistics

### Room & Lobby System
- Create and join betting rooms
- Real-time lobby updates
- Room state management with player tracking

### Question Engine
- Multiple-choice betting questions
- Question resolution and scoring logic
- French language support (questionFR)
- Real-time question distribution

### Betting Mechanics
- Point-based wagering system
- Bet placement and validation
- Automatic scoring and payouts
- Player statistics tracking

### Real-time Data Models
- Live game state synchronization
- Player metrics and performance tracking
- Quarter-by-quarter game data
- Play-by-play data integration

## Database Schema

The application uses SQLModel for these core entities:

- **Users**: Authentication and profile data
- **Rooms**: Betting session containers
- **Players**: Room participants and statistics
- **Questions**: Betting scenarios and metadata
- **Bets**: Wager records and outcomes
- **Requests**: Friend and room invitations
- **Games**: Sports event data and state

## API Endpoints

FastAPI provides RESTful endpoints for:

- `/users` - User management and authentication
- `/rooms` - Room creation and management  
- `/players` - Player statistics and actions
- `/questions` - Question delivery and resolution
- `/bets` - Wager placement and history
- `/friends` - Social connections
- `/requests` - Invitation system

**API Documentation**: Run the server and visit `/docs` for interactive Swagger UI.

## Development Setup

```bash
# Clone and enter the project
git clone <repository>
cd raptor_hfb

# Start all services
honcho start

# Or run individually:
# Backend: cd backend && uvicorn main:app --reload --port 4042
# Frontend: cd frontend && expo start --port 4401
```

The application runs on:
- Backend API: `localhost:4042`
- Frontend App: `localhost:4401` 
- API Documentation: `localhost:4042/docs`

## Mobile App Features

### UI Components
- Custom button, card, and input components
- Avatar system with profile images
- Timer components for real-time betting
- Progress indicators and loading states
- Native-feeling animations and interactions

### Navigation Structure
- File-based routing with Expo Router
- Tab-based navigation between screens
- Modal screens for betting and lobbies
- Deep linking support for room invitations

### Screens Implemented
- **Home**: Main dashboard and navigation
- **Lobby**: Room creation and joining
- **Game**: Active betting session interface
- **Question**: Individual question betting UI
- **Answer**: Bet confirmation and results
- **Recap**: Session summary and statistics

## Data Flow

1. **Room Creation**: Users create rooms via `/rooms` API
2. **Player Joining**: Friends join through invitation system
3. **Question Distribution**: Server pushes questions to active rooms
4. **Bet Placement**: Players submit bets via `/bets` endpoint
5. **Real-time Updates**: Frontend polls for game state changes
6. **Score Calculation**: Backend resolves bets and updates player points

## Container Deployment

### Backend Container
- Ubuntu 22.04 base with Python 3.12
- PostgreSQL client libraries (psycopg2-binary)
- Graphics support (pycairo) for potential chart generation
- Production WSGI server (uvicorn)

### Frontend Container  
- Node.js environment with Expo CLI
- Metro bundler for React Native
- Production build optimization
- Static asset serving

## Current Limitations

- Uses fabricated sports data (real APIs not integrated)
- Polling-based updates (WebSockets planned but not implemented)
- Single-server deployment (no horizontal scaling yet)
- Basic authentication (no OAuth or JWT refresh tokens)

## Next Development Phase

- WebSocket implementation for true real-time updates
- Live sports API integration
- Enhanced caching and performance optimization
- Push notification system
- Advanced analytics and reporting features

---

**Quick Start**: `honcho start` - then open your mobile device to the Expo development server to begin testing.
