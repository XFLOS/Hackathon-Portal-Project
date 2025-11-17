# Automated Setup Script for Windows PowerShell
# Run this after cloning the repository on a new machine

Write-Host "🚀 Hackathon Portal - Automated Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Yellow
cd hackathon-backend

# Create .env if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit hackathon-backend/.env with your credentials" -ForegroundColor Yellow
    $envNeeded = $true
} else {
    Write-Host "✅ Backend .env already exists" -ForegroundColor Green
}

# Install backend dependencies
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Yellow
cd ../hackathon-frontend

# Create .env if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit hackathon-frontend/.env with your API URL" -ForegroundColor Yellow
    $envNeeded = $true
} else {
    Write-Host "✅ Frontend .env already exists" -ForegroundColor Green
}

# Install frontend dependencies
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend installation failed!" -ForegroundColor Red
    exit 1
}

cd ..

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""

if ($envNeeded) {
    Write-Host "⚠️  IMPORTANT: Update .env files before running" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Backend .env (hackathon-backend/.env):" -ForegroundColor Cyan
    Write-Host "  DATABASE_URL=<your-neon-connection-string>"
    Write-Host "  JWT_SECRET=<your-secret-key>"
    Write-Host "  CLOUDINARY_CLOUD_NAME=<your-cloud-name>"
    Write-Host "  CLOUDINARY_API_KEY=<your-api-key>"
    Write-Host "  CLOUDINARY_API_SECRET=<your-api-secret>"
    Write-Host ""
    Write-Host "Frontend .env (hackathon-frontend/.env):" -ForegroundColor Cyan
    Write-Host "  REACT_APP_API_URL=http://localhost:4000"
    Write-Host ""
}

Write-Host "📖 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update .env files if needed" -ForegroundColor White
Write-Host "2. Start backend:  cd hackathon-backend && npm run dev" -ForegroundColor White
Write-Host "3. Start frontend: cd hackathon-frontend && npm start" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access app at: http://localhost:3000" -ForegroundColor Green
Write-Host "🔧 Backend API at: http://localhost:4000" -ForegroundColor Green
Write-Host ""
