#!/bin/bash

# Kanvaro Development Setup Script
echo "🚀 Setting up Kanvaro development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from env.example..."
    cp env.example .env.local
    echo "✅ .env.local created. Please edit it with your configuration."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start development services
echo "🐳 Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.dev.yml ps

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "📊 MongoDB is available at: localhost:27017"
echo "🔴 Redis is available at: localhost:6379"
echo ""
echo "📚 Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Complete the setup wizard at http://localhost:3000"
echo "3. Start developing!"
echo ""
echo "🛠️  Useful commands:"
echo "- npm run dev          # Start development server"
echo "- npm run build        # Build for production"
echo "- npm run lint         # Run ESLint"
echo "- docker-compose -f docker-compose.dev.yml down  # Stop services"
