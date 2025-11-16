# 🚀 Deployment Checklist for Render

Use this checklist when deploying your backend to Render.com

---

## ✅ Pre-Deployment Checklist

### 1. Code & Repository
- [ ] All code is working locally (`npm run dev` works)
- [ ] `package.json` has correct scripts:
  - [ ] `"start": "node src/server.js"`
  - [ ] `"dev": "nodemon src/server.js"`
- [ ] Code is committed to Git
- [ ] Code is pushed to GitHub
- [ ] Using `main` branch (or know your branch name)

### 2. Database Setup (Neon)
- [ ] Neon account created at https://neon.tech
- [ ] Database project created
- [ ] Connection string copied (includes `?sslmode=require`)
- [ ] `schema.sql` executed in Neon SQL Editor
- [ ] Tables created successfully
- [ ] Can connect from local machine

### 3. Cloudinary Setup
- [ ] Cloudinary account created at https://cloudinary.com
- [ ] Cloud Name copied from dashboard
- [ ] API Key copied from dashboard
- [ ] API Secret copied from dashboard

### 4. Environment Variables Ready
- [ ] DATABASE_URL value ready
- [ ] JWT_SECRET chosen (random string, 32+ chars)
- [ ] CLOUDINARY_CLOUD_NAME value ready
- [ ] CLOUDINARY_API_KEY value ready
- [ ] CLOUDINARY_API_SECRET value ready
- [ ] PORT value ready (4000)

---

## 🌐 Render Configuration Checklist

### During Service Creation:

#### Basic Settings
- [ ] Service name chosen (e.g., `hackathon-portal-backend`)
- [ ] Language set to: `Node`
- [ ] Branch set to: `main`
- [ ] Region selected: `Oregon (US West)` or closest

#### CRITICAL Settings
- [ ] **Root Directory** set to: `hackathon-backend` ⚠️ MUST BE CORRECT
- [ ] **Build Command** set to: `npm install`
- [ ] **Start Command** set to: `npm start`

#### Environment Variables (Add All 6)
- [ ] `DATABASE_URL` = `postgresql://...?sslmode=require`
- [ ] `JWT_SECRET` = `your_secret_here`
- [ ] `CLOUDINARY_CLOUD_NAME` = `your_cloud_name`
- [ ] `CLOUDINARY_API_KEY` = `your_api_key`
- [ ] `CLOUDINARY_API_SECRET` = `your_api_secret`
- [ ] `PORT` = `4000`

---

## 🔄 Deployment Process Checklist

### Monitor Deployment
- [ ] Clicked "Create Web Service"
- [ ] Watching build logs
- [ ] Build completed successfully (green checkmark)
- [ ] Service status shows "Live" (green)

### Common Build Log Messages (Expected)
```
✅ "Cloning repository..."
✅ "Running npm install..."
✅ "Installing dependencies..."
✅ "Running npm start..."
✅ "Server is running on port..."
✅ "Live"
```

---

## 🧪 Post-Deployment Testing Checklist

### Get Your URL
- [ ] Copied your Render URL (e.g., `https://xyz.onrender.com`)

### Test Endpoints

#### 1. Health Check
- [ ] Visit: `https://YOUR-URL.onrender.com/health`
- [ ] Expected: `{"status":"ok","message":"Hackathon Portal API is running",...}`

#### 2. Register User
```bash
curl -X POST https://YOUR-URL.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```
- [ ] Status: 201 Created
- [ ] Response includes user object

#### 3. Login User
```bash
curl -X POST https://YOUR-URL.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```
- [ ] Status: 200 OK
- [ ] Response includes JWT token

#### 4. Get Profile (Protected)
```bash
curl -X GET https://YOUR-URL.onrender.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
- [ ] Status: 200 OK
- [ ] Response includes user data

---

## 🔧 Configuration Summary

Your final Render configuration should match:

```yaml
Name:              hackathon-portal-backend
Language:          Node
Branch:            main
Region:            Oregon (US West)
Root Directory:    hackathon-backend        ⚠️ CRITICAL
Build Command:     npm install
Start Command:     npm start

Environment Variables:
  DATABASE_URL:              postgresql://user:pass@host/db?sslmode=require
  JWT_SECRET:                your_random_secret_32chars+
  CLOUDINARY_CLOUD_NAME:     your-cloud-name
  CLOUDINARY_API_KEY:        123456789012345
  CLOUDINARY_API_SECRET:     AbCdEfGhIjKlMnOpQrStUvWx
  PORT:                      4000
```

---

## 🐛 Troubleshooting Checklist

If deployment fails, check:

### Build Fails
- [ ] Root Directory is set to `hackathon-backend`
- [ ] `package.json` exists in `hackathon-backend/` folder
- [ ] All dependencies in `package.json` are valid

### Service Won't Start
- [ ] Start command is `npm start`
- [ ] `"start": "node src/server.js"` in package.json
- [ ] `src/server.js` exists

### Database Errors
- [ ] DATABASE_URL is correct
- [ ] Includes `?sslmode=require`
- [ ] Database exists in Neon
- [ ] Tables created (ran schema.sql)

### Environment Variable Issues
- [ ] All 6 variables added
- [ ] No typos in variable names
- [ ] No < or > symbols in values
- [ ] Values match exactly from sources

### Application Errors
- [ ] Check Render logs for specific errors
- [ ] Verify all dependencies installed
- [ ] Test locally first

---

## 📱 Update Frontend Checklist

After backend is live:

### In Frontend Code
- [ ] Update API URL in frontend
- [ ] Update `.env` or `api.js`:
  ```
  REACT_APP_API_URL=https://your-backend.onrender.com
  ```
- [ ] Test frontend can call backend
- [ ] CORS is properly configured

### Deploy Frontend
- [ ] Push frontend changes
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Test full stack integration

---

## ✅ Final Verification

Everything working when:
- [ ] Health endpoint returns 200
- [ ] Can register new users
- [ ] Can login and receive token
- [ ] Protected routes work with token
- [ ] File uploads work (if configured)
- [ ] Frontend can communicate with backend
- [ ] No errors in Render logs

---

## 🎉 Deployment Complete!

When all boxes are checked:
- ✅ Backend is live on Render
- ✅ Database is connected
- ✅ All endpoints working
- ✅ Frontend can connect
- ✅ Ready for production use

**Your live backend URL:**
```
https://your-service-name.onrender.com
```

---

## 📚 Documentation References

- **Setup Guide**: `DEPLOY_TO_RENDER.md`
- **Environment Template**: `.env.example`
- **API Documentation**: `SETUP_COMPLETE.md`
- **Quick Start**: `QUICKSTART.md`

---

**Next Steps:**
1. Save your Render URL
2. Update frontend configuration
3. Test full application
4. Share with your team!

🚀 Happy deploying!
