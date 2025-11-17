#!/bin/bash
# Automated Setup Script for Mac/Linux
# Run this after cloning the repository on a new machine

echo "🚀 Hackathon Portal - Automated Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js $NODE_VERSION found"
else
    echo "❌ Node.js not found!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm $NPM_VERSION found"
else
    echo "❌ npm not found!"
    exit 1
fi

echo ""
echo "📦 Installing Backend Dependencies..."
cd hackathon-backend || exit 1

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit hackathon-backend/.env with your credentials"
    ENV_NEEDED=true
else
    echo "✅ Backend .env already exists"
fi

# Install backend dependencies
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend installation failed!"
    exit 1
fi

echo ""
echo "📦 Installing Frontend Dependencies..."
cd ../hackathon-frontend || exit 1

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit hackathon-frontend/.env with your API URL"
    ENV_NEEDED=true
else
    echo "✅ Frontend .env already exists"
fi

# Install frontend dependencies
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend installation failed!"
    exit 1
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""

if [ "$ENV_NEEDED" = true ]; then
    echo "⚠️  IMPORTANT: Update .env files before running"
    echo ""
    echo "Backend .env (hackathon-backend/.env):"
    echo "  DATABASE_URL=<your-neon-connection-string>"
    echo "  JWT_SECRET=<your-secret-key>"
    echo "  CLOUDINARY_CLOUD_NAME=<your-cloud-name>"
    echo "  CLOUDINARY_API_KEY=<your-api-key>"
    echo "  CLOUDINARY_API_SECRET=<your-api-secret>"
    echo ""
    echo "Frontend .env (hackathon-frontend/.env):"
    echo "  REACT_APP_API_URL=http://localhost:4000"
    echo ""
fi

echo "📖 Next Steps:"
echo "1. Update .env files if needed"
echo "2. Start backend:  cd hackathon-backend && npm run dev"
echo "3. Start frontend: cd hackathon-frontend && npm start"
echo ""
echo "🌐 Access app at: http://localhost:3000"
echo "🔧 Backend API at: http://localhost:4000"
echo ""
