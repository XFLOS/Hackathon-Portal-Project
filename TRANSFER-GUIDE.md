# 🔄 Project Transfer Guide

## Complete guide to move this Hackathon Portal to a new machine

---

## 📦 Method 1: Clone from GitHub (Recommended - Cleanest)

### On New Machine:

#### Step 1: Install Prerequisites
```bash
# Install Node.js 16+ from: https://nodejs.org
# Verify installation:
node --version
npm --version

# Install Git from: https://git-scm.com
git --version
```

#### Step 2: Clone Repository
```bash
# Clone the repo
git clone https://github.com/XFLOS/Hackathon-Portal-Project.git
cd Hackathon-Portal-Project
```

#### Step 3: Setup Frontend
```bash
cd hackathon-frontend
npm install

# Create .env file
cp .env.example .env
```

**Edit `hackathon-frontend/.env`:**
```env
REACT_APP_API_URL=https://hackathon-portal-project-8737.onrender.com
REACT_APP_USE_MOCK_API=false
EXTEND_ESLINT=true
DISABLE_ESLINT_PLUGIN=true
```

#### Step 4: Setup Backend
```bash
cd ../hackathon-backend
npm install

# Create .env file
cp .env.example .env
```

**Edit `hackathon-backend/.env`:**
```env
DATABASE_URL=postgresql://neondb_owner:npg_HvOnPy2V8j3M@ep-icy-wind-a80nmx2d-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=hackathon-jwt-secret-key-2025-change-in-production
CLOUDINARY_CLOUD_NAME=dxjum86lp
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
PORT=4000
```

#### Step 5: Run Locally
```bash
# In hackathon-backend folder:
npm run dev

# In NEW terminal, hackathon-frontend folder:
npm start
```

**✅ Done! Project running on new machine**

---

## 📂 Method 2: Transfer Project Folder (Quick but Needs Cleanup)

### On Old Machine:

#### Step 1: Delete node_modules
```powershell
# In project root:
cd c:\Users\user\Downloads\HackathonPortal-main\HackathonPortal-main

# Delete frontend node_modules
Remove-Item -Recurse -Force hackathon-frontend\node_modules -ErrorAction SilentlyContinue

# Delete backend node_modules
Remove-Item -Recurse -Force hackathon-backend\node_modules -ErrorAction SilentlyContinue

# Delete build folders
Remove-Item -Recurse -Force hackathon-frontend\build -ErrorAction SilentlyContinue
```

#### Step 2: Zip the Project
```powershell
# Compress the entire folder
Compress-Archive -Path . -DestinationPath "C:\Users\user\Desktop\Hackathon-Portal-Clean.zip"
```

### On New Machine:

#### Step 1: Extract and Setup
```bash
# Extract zip file to desired location
# Open terminal in extracted folder

cd hackathon-frontend
npm install

cd ../hackathon-backend
npm install
```

#### Step 2: Update .env Files
Make sure both `.env` files have correct values (see Method 1, Steps 3 & 4)

#### Step 3: Run
```bash
# Backend:
cd hackathon-backend
npm run dev

# Frontend (new terminal):
cd hackathon-frontend
npm start
```

---

## 🔑 Critical Files to Transfer

### Must Have:
- ✅ `.env` files (but update paths/secrets for new machine)
- ✅ All `.js`, `.jsx`, `.css` files
- ✅ `package.json` files
- ✅ `.sql` files (database schemas)
- ✅ Documentation `.md` files

### DON'T Transfer:
- ❌ `node_modules/` (reinstall with `npm install`)
- ❌ `build/` (regenerated with `npm run build`)
- ❌ `.git/` (optional - clone from GitHub instead)
- ❌ `package-lock.json` (can cause version conflicts)

---

## 🐛 Common Errors & Fixes

### Error: "Cannot find module"
**Cause**: Missing `node_modules`

**Fix**:
```bash
cd hackathon-frontend
npm install

cd ../hackathon-backend
npm install
```

### Error: "ENOENT: no such file or directory, open '.env'"
**Cause**: Missing `.env` file

**Fix**:
```bash
# Frontend:
cd hackathon-frontend
copy .env.example .env
# Edit .env with correct values

# Backend:
cd hackathon-backend
copy .env.example .env
# Edit .env with correct values
```

### Error: "Port 3000 already in use"
**Cause**: Another process using the port

**Fix** (Windows):
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port:
# Set PORT=3001 in frontend .env
```

### Error: "spawn npm ENOENT"
**Cause**: npm not in PATH

**Fix**:
```bash
# Reinstall Node.js from nodejs.org
# Make sure "Add to PATH" is checked during install
```

### Error: Database connection failed
**Cause**: Wrong DATABASE_URL in backend `.env`

**Fix**:
```env
# Update hackathon-backend/.env with correct connection string:
DATABASE_URL=postgresql://neondb_owner:npg_HvOnPy2V8j3M@ep-icy-wind-a80nmx2d-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## 📋 New Machine Setup Checklist

### Prerequisites:
- [ ] Node.js 16+ installed
- [ ] Git installed
- [ ] Text editor (VS Code recommended)
- [ ] Internet connection

### Project Setup:
- [ ] Repository cloned or folder extracted
- [ ] Frontend `node_modules` installed
- [ ] Backend `node_modules` installed
- [ ] Frontend `.env` created and configured
- [ ] Backend `.env` created and configured

### Test Run:
- [ ] Backend starts without errors (`npm run dev`)
- [ ] Frontend starts without errors (`npm start`)
- [ ] Can login at `http://localhost:3000`
- [ ] API calls work (check browser DevTools Network tab)

---

## 🚀 Best Practices for New Machine

### 1. Use Git Clone (Cleanest)
```bash
git clone https://github.com/XFLOS/Hackathon-Portal-Project.git
```
✅ Always gets latest code
✅ No node_modules clutter
✅ Clean git history

### 2. Never Transfer node_modules
```bash
# Always delete before transfer:
Remove-Item -Recurse -Force node_modules
```
✅ Avoids platform-specific build errors
✅ Smaller file size
✅ Fresh package install

### 3. Update .env for New Machine
```bash
# Don't just copy .env - review and update:
# - API URLs
# - Database connections
# - Secrets/keys
# - Port numbers
```

### 4. Use .env.example as Template
```bash
# On new machine:
cp .env.example .env
# Then edit .env with your values
```

---

## 🔐 Sensitive Data Checklist

**NEVER commit these to Git:**
- ❌ `.env` files
- ❌ Database passwords
- ❌ API keys
- ❌ JWT secrets

**Safe to commit:**
- ✅ `.env.example` (with placeholder values)
- ✅ Source code (.js, .jsx files)
- ✅ package.json
- ✅ Documentation

---

## 📱 Quick Start Commands (Copy-Paste)

### Clone & Setup:
```bash
# Clone
git clone https://github.com/XFLOS/Hackathon-Portal-Project.git
cd Hackathon-Portal-Project

# Frontend setup
cd hackathon-frontend
npm install
cp .env.example .env
# Edit .env

# Backend setup
cd ../hackathon-backend
npm install
cp .env.example .env
# Edit .env

# Run backend
npm run dev

# Run frontend (new terminal)
cd ../hackathon-frontend
npm start
```

### Windows-Specific (PowerShell):
```powershell
# Clone
git clone https://github.com/XFLOS/Hackathon-Portal-Project.git
cd Hackathon-Portal-Project

# Frontend
cd hackathon-frontend
npm install
Copy-Item .env.example .env
notepad .env  # Edit values

# Backend
cd ..\hackathon-backend
npm install
Copy-Item .env.example .env
notepad .env  # Edit values

# Run
npm run dev
```

---

## 🎯 Summary

**Best Method**: Clone from GitHub + reinstall node_modules

**Time Required**: ~10 minutes
1. Clone repo (2 min)
2. Install dependencies (5 min)
3. Configure .env files (2 min)
4. Test run (1 min)

**Key Points**:
- ✅ Always reinstall node_modules
- ✅ Never commit .env files
- ✅ Use .env.example as template
- ✅ Update database URLs for new machine
- ✅ Test locally before deploying

---

## 🆘 Still Having Issues?

1. **Check Node version**: `node --version` (should be 16+)
2. **Clear npm cache**: `npm cache clean --force`
3. **Delete package-lock.json**: `rm package-lock.json`
4. **Reinstall**: `npm install`
5. **Check .env exists**: `ls -la` (should see .env files)

---

**Need help?** Check README.md or SETUP-INSTRUCTIONS.md for detailed guides.
