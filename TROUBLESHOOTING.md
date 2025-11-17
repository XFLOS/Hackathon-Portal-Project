# 🔧 COMMON ERRORS & FIXES

## Quick Fix Guide for Transfer Errors

---

## ❌ Error 1: "Cannot find module 'xyz'"

### Symptoms:
```
Error: Cannot find module 'express'
Error: Cannot find module 'react'
Error: Cannot find module 'pg'
```

### Cause:
Missing `node_modules` folder

### Fix:
```bash
# In backend folder:
cd hackathon-backend
rm -rf node_modules package-lock.json
npm install

# In frontend folder:
cd hackathon-frontend
rm -rf node_modules package-lock.json
npm install
```

---

## ❌ Error 2: "DATABASE_URL is not defined"

### Symptoms:
```
⚠️ WARNING: DATABASE_URL is not properly configured
Database connection failed
```

### Cause:
Missing or incorrect `.env` file in backend

### Fix:
```bash
cd hackathon-backend

# Check if .env exists
ls -la .env

# If missing, create it:
cp .env.example .env

# Edit .env and add your Neon connection string:
notepad .env  # Windows
nano .env     # Mac/Linux
```

**Add this to `.env`:**
```env
DATABASE_URL=postgresql://neondb_owner:npg_HvOnPy2V8j3M@ep-icy-wind-a80nmx2d-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=hackathon-jwt-secret-key-2025-change-in-production
CLOUDINARY_CLOUD_NAME=dxjum86lp
CLOUDINARY_API_KEY=568234636744528
CLOUDINARY_API_SECRET=ej-Hx60JnfAoma1L4UHgFsgkFSs
PORT=4000
```

---

## ❌ Error 3: "REACT_APP_API_URL is undefined"

### Symptoms:
```
Network Error
Failed to fetch
API calls to 'undefined' fail
```

### Cause:
Missing `.env` file in frontend

### Fix:
```bash
cd hackathon-frontend

# Create .env file:
cp .env.example .env

# Edit and add:
notepad .env  # Windows
nano .env     # Mac/Linux
```

**Add this to `.env`:**
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_USE_MOCK_API=false
EXTEND_ESLINT=true
DISABLE_ESLINT_PLUGIN=true
```

**Important:** After changing `.env`, restart the app:
```bash
# Stop the app (Ctrl+C)
# Then start again:
npm start
```

---

## ❌ Error 4: "Port 3000/4000 already in use"

### Symptoms:
```
Error: listen EADDRINUSE: address already in use :::3000
```

### Fix (Windows PowerShell):
```powershell
# Find process using port 3000:
netstat -ano | findstr :3000

# Kill the process (replace 1234 with actual PID):
taskkill /PID 1234 /F

# Or for port 4000:
netstat -ano | findstr :4000
taskkill /PID 1234 /F
```

### Fix (Mac/Linux):
```bash
# Find and kill process:
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

---

## ❌ Error 5: "Cannot find module './config/database'"

### Symptoms:
```
Error: Cannot find module './config/database'
Module not found: Error: Can't resolve '../config/database'
```

### Cause:
Missing `database.js` file (some controllers import it)

### Fix:
```bash
# The file should already exist after latest git pull
# If not, pull latest changes:
git pull origin main

# Or manually create it (it's identical to db.js):
cd hackathon-backend/src/config
cp db.js database.js
```

---

## ❌ Error 6: "Failed to compile" (React)

### Symptoms:
```
Failed to compile
Module not found
Syntax error
```

### Fix 1: Clear React cache
```bash
cd hackathon-frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm start
```

### Fix 2: Check ESLint config
Make sure `.env` has:
```env
EXTEND_ESLINT=true
DISABLE_ESLINT_PLUGIN=true
```

---

## ❌ Error 7: "JWT_SECRET must have a value"

### Symptoms:
```
Error: secretOrPrivateKey must have a value
Login returns 500 error
```

### Cause:
Missing JWT_SECRET in backend `.env`

### Fix:
```bash
# Edit hackathon-backend/.env and add:
JWT_SECRET=hackathon-jwt-secret-key-2025-change-in-production
```

---

## ❌ Error 8: "npm: command not found" or "node: command not found"

### Symptoms:
```
'npm' is not recognized as an internal or external command
bash: node: command not found
```

### Cause:
Node.js not installed or not in PATH

### Fix:
```bash
# Download and install Node.js from:
# https://nodejs.org (LTS version 18+)

# Verify installation:
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
```

---

## ❌ Error 9: "Invalid DATABASE_URL"

### Symptoms:
```
Connection terminated unexpectedly
getaddrinfo ENOTFOUND
SASL authentication failed
```

### Cause:
Wrong database connection string

### Fix:
Get the correct connection string from Neon:

1. Go to: https://console.neon.tech
2. Click your database: `ep-icy-wind-a80nmx2d`
3. Click "Connection string"
4. Copy the **Pooled connection** string
5. Update `hackathon-backend/.env`:

```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-icy-wind-a80nmx2d-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## ❌ Error 10: "CORS error" / "blocked by CORS policy"

### Symptoms:
```
Access to fetch has been blocked by CORS policy
No 'Access-Control-Allow-Origin' header
```

### Cause:
Backend not allowing frontend origin

### Fix:
Backend already has CORS enabled for all origins. But if you're getting this error:

1. Make sure backend is running (`npm run dev`)
2. Check backend console for startup message
3. Verify frontend is calling correct API URL

---

## ✅ COMPLETE SETUP CHECKLIST

Run these commands in order on a new machine:

```bash
# 1. Clone repository
git clone https://github.com/XFLOS/Hackathon-Portal-Project.git
cd Hackathon-Portal-Project

# 2. Backend setup
cd hackathon-backend
cp .env.example .env
# Edit .env with your credentials (see examples above)
npm install

# 3. Frontend setup
cd ../hackathon-frontend
cp .env.example .env
# Edit .env with API URL
npm install

# 4. Test backend
cd ../hackathon-backend
npm run dev
# Should see: "✅ Connected to PostgreSQL database"
# Should see: "Server running on port 4000"

# 5. Test frontend (in NEW terminal)
cd hackathon-frontend
npm start
# Should open http://localhost:3000
```

---

## 🔍 VERIFICATION STEPS

### Check Backend Works:
```bash
# Terminal 1: Start backend
cd hackathon-backend
npm run dev

# Terminal 2: Test API
curl http://localhost:4000/health
# Should return: {"status":"ok","message":"Hackathon Portal API is running"}
```

### Check Frontend Works:
```bash
# Open browser to: http://localhost:3000
# Should see login page
# No errors in browser console (F12)
```

### Check Database Connection:
```bash
# Backend terminal should show:
# ✅ Connected to PostgreSQL database
# ✅ Server running on port 4000

# If you see warnings about DATABASE_URL:
# ⚠️ Edit hackathon-backend/.env with correct connection string
```

---

## 🆘 NUCLEAR OPTION (Complete Reset)

If nothing works, try this:

```bash
cd Hackathon-Portal-Project

# Delete everything
rm -rf node_modules
rm -rf hackathon-frontend/node_modules
rm -rf hackathon-frontend/build
rm -rf hackathon-backend/node_modules
rm package-lock.json
rm hackathon-frontend/package-lock.json
rm hackathon-backend/package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall everything
cd hackathon-frontend
npm install

cd ../hackathon-backend
npm install

# Create .env files if missing
cp .env.example .env  # Edit with your values
cd ../hackathon-frontend
cp .env.example .env  # Edit with your values

# Try again
cd ../hackathon-backend
npm run dev
```

---

## 📋 REQUIRED .ENV VALUES

### Backend (.env):
```env
DATABASE_URL=postgresql://neondb_owner:npg_HvOnPy2V8j3M@ep-icy-wind-a80nmx2d-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=hackathon-jwt-secret-key-2025-change-in-production
CLOUDINARY_CLOUD_NAME=dxjum86lp
CLOUDINARY_API_KEY=568234636744528
CLOUDINARY_API_SECRET=ej-Hx60JnfAoma1L4UHgFsgkFSs
PORT=4000
```

### Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_USE_MOCK_API=false
EXTEND_ESLINT=true
DISABLE_ESLINT_PLUGIN=true
```

---

## 💡 PRO TIPS

1. **Always use two terminals**: One for backend, one for frontend
2. **Check .env files exist**: `ls -la .env` in both folders
3. **Restart after .env changes**: Stop app (Ctrl+C) then restart
4. **Check Node version**: Should be 16+ (`node --version`)
5. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
6. **Check firewall**: Allow ports 3000 and 4000

---

## 🎯 STILL NOT WORKING?

1. **Check Node.js version**: `node --version` (should be 16+)
2. **Check npm version**: `npm --version` (should be 8+)
3. **Read error messages carefully**: They usually point to the exact issue
4. **Check both .env files exist**: Frontend AND backend
5. **Verify database is running**: Check Neon dashboard
6. **Try with fresh clone**: `git clone` in a new folder

---

**Need more help?** Check the GitHub Issues or README.md
