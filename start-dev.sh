#!/bin/bash

# Food Allergy Assistant - Development Startup Script

echo "🚀 Starting Food Allergy Assistant Development Environment"
echo "=============================================="

# Source nvm and use correct Node version
source ~/.nvm/nvm.sh
nvm use 18.18.2

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Get absolute paths to avoid directory change issues
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$PROJECT_ROOT/services/logs"

# Always use temp directory for PID files to avoid read-only filesystem issues
PID_DIR="/tmp/food-allergy-assistant-pids"
mkdir -p "$PID_DIR" 2>/dev/null
mkdir -p "$LOGS_DIR" 2>/dev/null
echo "📁 Using directory for PID files: $PID_DIR"
echo "📁 Logs directory: $LOGS_DIR"

# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true  # Web Server
lsof -ti:4000 | xargs kill -9 2>/dev/null || true  # API Server  
lsof -ti:5173 | xargs kill -9 2>/dev/null || true  # Frontend
sleep 2

echo "🌐 Starting Web Server (Port 3001)..."
(cd "$PROJECT_ROOT/services/web-server" && npm run dev > "$LOGS_DIR/web-server.log" 2>&1) &
WEB_SERVER_PID=$!

echo "🔧 Starting API Server (Port 4000)..."
(cd "$PROJECT_ROOT/services/api" && npm run dev > "$LOGS_DIR/api.log" 2>&1) &
API_PID=$!

echo "⚛️  Starting Frontend (Port 5173)..."
(cd "$PROJECT_ROOT/services/frontend" && npm run dev > "$LOGS_DIR/frontend.log" 2>&1) &
FRONTEND_PID=$!

echo ""
echo "🎯 All services starting..."
echo "   - Web Server: http://localhost:3001"
echo "   - API Server: http://localhost:4000" 
echo "   - Frontend: http://localhost:5173"
echo ""
echo "📊 Process IDs:"
echo "   - Web Server: $WEB_SERVER_PID"
echo "   - API Server: $API_PID"
echo "   - Frontend: $FRONTEND_PID"
echo ""
echo "📝 Logs are available in $LOGS_DIR/"
echo "📋 PID files location: $PID_DIR"
echo ""

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Test endpoints
echo "🧪 Testing endpoints..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "   ✅ Web Server: Running"
else
    echo "   ❌ Web Server: Not responding"
fi

if curl -s http://localhost:4000/health > /dev/null; then
    echo "   ✅ API Server: Running"
else
    echo "   ❌ API Server: Not responding"
fi

if curl -s http://localhost:5173 > /dev/null; then
    echo "   ✅ Frontend: Running"
else
    echo "   ❌ Frontend: Not responding"
fi

echo ""
echo "🎉 Development environment ready!"
echo "🌍 Open http://localhost:5173 to view the application"
echo ""
echo "To stop all services, run: ./stop-dev.sh"
echo "To view logs: tail -f $LOGS_DIR/[service].log"

# Store PIDs for cleanup script
echo "$WEB_SERVER_PID" > "$PID_DIR/.dev-pids-web-server" 2>/dev/null || echo "⚠️  Could not store Web Server PID"
echo "$API_PID" > "$PID_DIR/.dev-pids-api" 2>/dev/null || echo "⚠️  Could not store API PID"
echo "$FRONTEND_PID" > "$PID_DIR/.dev-pids-frontend" 2>/dev/null || echo "⚠️  Could not store Frontend PID"

# Also store PID directory location for stop script
echo "$PID_DIR" > "$PID_DIR/.pid-dir-location" 2>/dev/null || true

echo ""
echo "📜 Services are running. Use Ctrl+C to stop or run ./stop-dev.sh"
echo "📜 To follow logs: tail -f $LOGS_DIR/*.log" 
