# Welcome to Rex Bets
*High-frequency social betting in real-time*

Rex Bets transforms sports betting from a solo grind into competitive multiplayer sessions. Think of it as bringing the energy of live betting to your friend group, with real-time questions and strategic point wagering during games.

## How It Works

Create or join lobbies with up to 5 players. During live games, you'll get rapid-fire multiple choice questions about what happens next. Place your bets, choose your confidence level, and watch the points flow. Smart players use the multiplier system to maximize gains on high-confidence plays.

Your points persist across sessions – build your bankroll over time and climb the leaderboards.

## Tech Stack

- **Frontend**: React Native for cross-platform mobile
- **Backend**: FastAPI with automatic documentation 
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **Real-time**: WebSocket connections for sub-second multiplayer sync
- **Deployment**: Dockerized containers, cloud-hosted

## Quick Start

```bash
# Start everything (frontend + backend + database)
honcho start
```

That's it. The reverse proxy setup in `Caddyfile` handles routing between services.

**API Documentation**: Once running, hit `localhost:4402/docs` for the full Swagger interface. All endpoints are documented and interactive.

## Architecture

The system handles high-frequency betting through:

- **Real-time synchronization**: WebSocket connections ensure all players see questions simultaneously
- **Multiplier algorithm**: Dynamic risk/reward calculations based on wager amount and question difficulty  
- **Persistent state**: Points and performance tracked across sessions
- **Scalable infrastructure**: Container-based deployment ready for load

## Game Mechanics

1. **Lobby System**: 5-player maximum, private rooms
2. **Question Engine**: Multiple choice questions triggered during key game moments
3. **Betting Interface**: Choose answer + point wager in seconds
4. **Scoring System**: Correct predictions earn multiplied points, wrong bets lose the wager
5. **Leaderboards**: Real-time ranking updates

## Development

### Project Structure
```
rex-bets/
├── frontend/         # React Native app
├── backend/          # FastAPI server
├── docker-compose.yml
├── Procfile         # Process definitions
└── Caddyfile        # Reverse proxy config
```

### Key Features
- Sub-second multiplayer synchronization
- Mobile-optimized betting interface  
- Advanced data visualization beyond basic charts
- Fabricated sports data pipeline (real APIs are expensive)
- Anti-exploit measures for fair play

## Roadmap

- Live sports API integration
- Tournament and seasonal modes
- Advanced analytics dashboard
- Mobile push notifications
- Enhanced anti-cheat systems

Built during a hackathon to solve the social gap in current betting platforms. No real money involved – just the thrill of outplaying your friends with better predictions.

---

**Ready to run it?** `honcho start` and navigate to your localhost to begin.
