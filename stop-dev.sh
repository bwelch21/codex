#!/bin/bash

# Food Allergy Assistant - Stop Development Services Script

echo "🛑 Stopping Food Allergy Assistant Development Environment"
echo "=============================================="

# Function to kill process if running
kill_process() {
    local pid=$1
    local name=$2
    
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        echo "🔥 Stopping $name (PID: $pid)..."
        kill -TERM "$pid" 2>/dev/null
        sleep 2
        
        # Force kill if still running
        if kill -0 "$pid" 2>/dev/null; then
            echo "   Force killing $name..."
            kill -9 "$pid" 2>/dev/null
        fi
        echo "   ✅ $name stopped"
    else
        echo "   ℹ️  $name not running"
    fi
}

# Function to find and read PID files
find_and_read_pid() {
    local service_name=$1
    local pid_file=".dev-pids-$service_name"
    
    # Try current directory first
    if [ -f "$pid_file" ]; then
        cat "$pid_file"
        return
    fi
    
    # Try temporary directory
    local temp_dir="/tmp/food-allergy-assistant-pids"
    if [ -f "$temp_dir/$pid_file" ]; then
        cat "$temp_dir/$pid_file"
        return
    fi
    
    # Try to find PID directory location file
    if [ -f "./.pid-dir-location" ]; then
        local stored_dir=$(cat ./.pid-dir-location)
        if [ -f "$stored_dir/$pid_file" ]; then
            cat "$stored_dir/$pid_file"
            return
        fi
    fi
    
    if [ -f "$temp_dir/.pid-dir-location" ]; then
        local stored_dir=$(cat "$temp_dir/.pid-dir-location")
        if [ -f "$stored_dir/$pid_file" ]; then
            cat "$stored_dir/$pid_file"
            return
        fi
    fi
    
    echo ""
}

# Function to cleanup PID files
cleanup_pid_files() {
    local service_name=$1
    local pid_file=".dev-pids-$service_name"
    
    # Remove from current directory
    rm -f "$pid_file" 2>/dev/null
    
    # Remove from temporary directory
    rm -f "/tmp/food-allergy-assistant-pids/$pid_file" 2>/dev/null
    
    # Try to find and remove from stored location
    if [ -f "./.pid-dir-location" ]; then
        local stored_dir=$(cat ./.pid-dir-location)
        rm -f "$stored_dir/$pid_file" 2>/dev/null
    fi
    
    if [ -f "/tmp/food-allergy-assistant-pids/.pid-dir-location" ]; then
        local stored_dir=$(cat "/tmp/food-allergy-assistant-pids/.pid-dir-location")
        rm -f "$stored_dir/$pid_file" 2>/dev/null
    fi
}

# Stop services
WEB_SERVER_PID=$(find_and_read_pid "web-server")
if [ -n "$WEB_SERVER_PID" ]; then
    kill_process "$WEB_SERVER_PID" "Web Server"
    cleanup_pid_files "web-server"
fi

API_PID=$(find_and_read_pid "api")
if [ -n "$API_PID" ]; then
    kill_process "$API_PID" "API Server"
    cleanup_pid_files "api"
fi

FRONTEND_PID=$(find_and_read_pid "frontend")
if [ -n "$FRONTEND_PID" ]; then
    kill_process "$FRONTEND_PID" "Frontend"
    cleanup_pid_files "frontend"
fi

# Clean up PID directory location files
rm -f ./.pid-dir-location 2>/dev/null
rm -f /tmp/food-allergy-assistant-pids/.pid-dir-location 2>/dev/null

# Also kill any processes on our ports (backup cleanup)
echo ""
echo "🧹 Cleaning up any remaining processes on ports..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo ""
echo "✅ All development services stopped"
echo "💡 To restart, run: ./start-dev.sh" 