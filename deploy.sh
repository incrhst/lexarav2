#!/bin/bash

# Exit on any error
set -e

# Configuration from environment variables with defaults
SERVER_USER=${DEPLOY_USER:-$(whoami)}  # Fallback to current user
SERVER_HOST=${DEPLOY_HOST:-"localhost"} # Fallback to localhost
APP_NAME=${APP_NAME:-"lexarav2"}
CONTAINER_PORT=${CONTAINER_PORT:-3000}
HOST_PORT=${HOST_PORT:-3000}
SSH_KEY=${SSH_KEY:-"$HOME/.ssh/id_rsa"}  # Default SSH key path

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function for error messages
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Helper function for info messages
info() {
    echo -e "${GREEN}$1${NC}"
}

# Helper function for warnings
warn() {
    echo -e "${YELLOW}Warning: $1${NC}"
}

# Validate required environment variables
if [ "$SERVER_HOST" = "localhost" ]; then
    error_exit "DEPLOY_HOST environment variable is not set\nUsage: DEPLOY_HOST=your-server DEPLOY_USER=your-user ./deploy.sh"
fi

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    error_exit "SSH key not found at $SSH_KEY\nSpecify a different key with SSH_KEY environment variable"
fi

# Test SSH connection
info "Testing SSH connection..."
if ! ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" echo "SSH connection successful" > /dev/null 2>&1; then
    error_exit "Cannot connect to $SERVER_USER@$SERVER_HOST\nMake sure your SSH key is properly set up and has the correct permissions (chmod 600)"
fi

info "Deploying to $SERVER_USER@$SERVER_HOST..."

# Build the Docker image locally
info "Building Docker image..."
docker build -t "$APP_NAME" . || error_exit "Docker build failed"

# Save the image to a tar file
info "Saving Docker image..."
docker save "$APP_NAME" > "${APP_NAME}.tar" || error_exit "Failed to save Docker image"

# Copy the image to the server
info "Copying image to server..."
scp -i "$SSH_KEY" "${APP_NAME}.tar" "$SERVER_USER@$SERVER_HOST:~/${APP_NAME}.tar" || error_exit "Failed to copy image to server"

# Clean up local tar file
rm "${APP_NAME}.tar"

# SSH into the server and deploy
info "Deploying to server..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" << EOF || error_exit "Deployment failed"
    set -e
    # Load the Docker image
    echo "Loading Docker image..."
    docker load < "${APP_NAME}.tar"
    rm "${APP_NAME}.tar"

    # Stop and remove existing container if it exists
    if [ \$(docker ps -q -f name=$APP_NAME) ]; then
        echo "Stopping existing container..."
        docker stop "$APP_NAME"
        docker rm "$APP_NAME"
    fi

    # Start the new container
    echo "Starting new container..."
    docker run -d \
        --name "$APP_NAME" \
        --restart unless-stopped \
        -p $HOST_PORT:$CONTAINER_PORT \
        -e NODE_ENV=production \
        "$APP_NAME"

    # Verify container is running
    if ! docker ps | grep -q "$APP_NAME"; then
        echo "Container failed to start"
        exit 1
    fi

    # Remove old images
    echo "Cleaning up old images..."
    docker image prune -f
EOF

# Check if the application is responding
info "Waiting for application to start..."
for i in {1..30}; do
    if curl -s "http://$SERVER_HOST:$HOST_PORT" > /dev/null; then
        info "Deployment completed successfully!"
        info "Application is running at http://$SERVER_HOST:$HOST_PORT"
        exit 0
    fi
    sleep 1
done

warn "Application deployed but not responding at http://$SERVER_HOST:$HOST_PORT"
warn "Check container logs with: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'docker logs $APP_NAME'" 