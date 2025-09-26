# Docker Semantic Search Integration

This document describes the Docker semantic search integration for the Wikramasooriya Enterprises backend.

## Overview

The backend now automatically starts a Docker container with PostgreSQL and pgvector extension when running `npm run dev`. This enables AI-powered semantic search functionality.

## Features

- **Automatic Docker Startup**: Docker container starts automatically with `npm run dev`
- **Health Monitoring**: Container health is monitored and reported in the terminal
- **Fallback Mode**: If Docker is unavailable, the system falls back to regular search
- **Status Messages**: Clear terminal messages show container status and instructions

## Docker Container Details

- **Container Name**: `wikramasooriya-postgres-pgvector`
- **Image**: `pgvector/pgvector:pg17`
- **Port**: `5433` (mapped from internal 5432)
- **Database**: `wik_db`
- **User**: `postgres`
- **Password**: `Abcd@1234`

## Environment Variables

Add these to your `.env` file:

```env
# ===========================================
# SEMANTIC SEARCH CONFIGURATION (Docker)
# ===========================================

# Docker PostgreSQL with pgvector configuration
DB_HOST_SEMANTIC=localhost
DB_PORT_SEMANTIC=5433
DB_NAME_SEMANTIC=wik_db
DB_USER_SEMANTIC=postgres
DB_PASSWORD_SEMANTIC=Abcd@1234

# Semantic Search Settings
SEMANTIC_SEARCH_ENABLED=true
SEMANTIC_SEARCH_TIMEOUT=3000
SEMANTIC_SEARCH_FALLBACK_ENABLED=true

# Docker Container Settings
DOCKER_CONTAINER_NAME=wikramasooriya-postgres-pgvector
DOCKER_COMPOSE_FILE=docker-compose.semantic.yml
```

## Available Scripts

### Development
- `npm run dev` - Starts Docker container and runs backend in development mode
- `npm run dev:docker` - Only starts Docker container (for testing)

### Docker Management
- `npm run docker:start` - Start the semantic search container
- `npm run docker:stop` - Stop the semantic search container
- `npm run docker:status` - Check container status

## Terminal Messages

When you run `npm run dev`, you'll see messages like:

### Container Starting
```
🐳 Starting Docker Semantic Search Container...
✅ Docker is available: Docker version 24.0.7
🚀 Starting Docker container...
✅ Docker semantic search container started successfully
⏳ Waiting for container to be healthy...
🎉 Docker semantic search container is up and running!
📊 Container: wikramasooriya-postgres-pgvector
🔍 Semantic search functionality is now available
```

### Server Startup
```
✅ Database connection successful
🎉 Docker semantic search container is ready!
🔍 AI-powered semantic search functionality is available
🚀 Server running on port 5001
```

### Fallback Mode (if Docker unavailable)
```
⚠️  Docker is not available on this system
🔄 Semantic search will use fallback mode
⚠️  Docker semantic search container is not available
🔄 Semantic search will use fallback mode
💡 Run "npm run docker:start" to enable AI search functionality
```

## Troubleshooting

### Docker Not Available
If Docker is not installed or not running:
- Install Docker Desktop
- Start Docker Desktop
- Run `npm run dev` again

### Container Won't Start
If the container fails to start:
- Check if port 5433 is available
- Run `npm run docker:stop` to clean up
- Run `npm run docker:start` to restart

### Container Unhealthy
If the container starts but is unhealthy:
- Check Docker logs: `docker logs wikramasooriya-postgres-pgvector`
- Restart container: `npm run docker:stop && npm run docker:start`

### Permission Issues (Windows)
If PowerShell execution is blocked:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## API Response Examples

### With Docker Container Running
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {...},
    "searchType": "semantic_ready",
    "query": "search term",
    "aiEnabled": true,
    "message": "AI Search is ready - semantic search implementation pending"
  }
}
```

### With Fallback Mode
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {...},
    "searchType": "fallback",
    "query": "search term",
    "aiEnabled": false,
    "message": "AI Search temporarily unavailable - Docker container not running"
  },
  "warning": {
    "message": "AI Search feature is currently disabled - Docker container not running",
    "reason": "docker_not_running",
    "fallbackUsed": true,
    "instructions": "Run \"npm run docker:start\" to enable AI search functionality"
  }
}
```

## Files Created/Modified

### New Files
- `backend/scripts/start-docker-semantic.js` - Node.js Docker startup script
- `backend/scripts/start-docker-semantic.ps1` - PowerShell Docker startup script

### Modified Files
- `backend/package.json` - Added Docker scripts and modified dev script
- `backend/src/controllers/searchController.js` - Enhanced status messages
- `backend/src/server.js` - Added Docker container status check on startup

## Next Steps

The Docker container is now ready for semantic search implementation. The infrastructure is in place to:

1. Store product embeddings in the pgvector database
2. Implement semantic similarity search
3. Provide AI-powered search results

The current implementation provides a solid foundation with proper error handling, fallback mechanisms, and clear status reporting.
