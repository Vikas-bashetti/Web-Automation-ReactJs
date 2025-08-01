#!/bin/bash

# Setup script for the deployment pipeline

echo "Setting up ECS Deployment Pipeline..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install AWS CLI first."
    exit 1
fi

# Create .env file from example
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file. Please update it with your configuration."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Create necessary directories
mkdir -p /tmp/deployments

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your AWS credentials and repository URLs"
echo "2. Configure your ECS cluster and service names"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Run 'docker-compose up' for production deployment"