# 🚀 Deploy Backend to Render

## Complete Step-by-Step Deployment Guide

This guide will help you deploy your Hackathon Portal backend to Render.com (free tier available).

---

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account
- ✅ Neon PostgreSQL database (from neon.tech)
- ✅ Cloudinary account (from cloudinary.com)
- ✅ Your code pushed to GitHub

---

## 🔧 Step 1: Prepare Your Repository

### Push to GitHub

```bash
cd hackathon-backend
git init
git add .
git commit -m "Initial backend setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 🌐 Step 2: Create Render Web Service

1. Go to **https://render.com**
2. Sign up / Log in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository

---

## ⚙️ Step 3: Configure Render Settings

### **CRITICAL: Use These EXACT Settings**

| Field | Value | Notes |
|-------|-------|-------|
| **Name** | `hackathon-portal-backend` | Or any name you prefer |
| **Language** | `Node` | Select from dropdown |
| **Branch** | `main` | Or your default branch |
| **Region** | `Oregon (US West)` | Default (or choose closest) |
| **Root Directory** | `hackathon-backend` | ⚠️ IMPORTANT! |
| **Build Command** | `npm install` | ✅ Already correct |
| **Start Command** | `npm start` | ✅ Already in package.json |

### Screenshot Reference:
```
┌─────────────────────────────────────┐
│ Name: hackathon-portal-backend      │
│ Language: Node                      │
│ Branch: main                        │
│ Region: Oregon (US West)            │
│ Root Directory: hackathon-backend   │ ⚠️ CRITICAL
│ Build Command: npm install          │
│ Start Command: npm start            │
└─────────────────────────────────────┘
```

---

## 🔐 Step 4: Add Environment Variables

Click **"Add Environment Variable"** and add these **ONE BY ONE**:

### Required Variables:

#### 1. DATABASE_URL
```
DATABASE_URL
```
**Value:** Your Neon connection string
```
postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

#### 2. JWT_SECRET
```
JWT_SECRET
```
**Value:** A random secure string
```
myultrasecretkey12345!@#$%
```
💡 Use a password generator for production

#### 3. CLOUDINARY_CLOUD_NAME
```
CLOUDINARY_CLOUD_NAME
```
**Value:** From your Cloudinary dashboard
```
your-cloud-name
```

#### 4. CLOUDINARY_API_KEY
```
CLOUDINARY_API_KEY
```
**Value:** From your Cloudinary dashboard
```
123456789012345
```

#### 5. CLOUDINARY_API_SECRET
```
CLOUDINARY_API_SECRET
```
**Value:** From your Cloudinary dashboard
```
AbCdEfGhIjKlMnOpQrStUvWx
```

#### 6. PORT (Optional)
```
PORT
```
**Value:**
```
4000
```
⚠️ Render will override this, but safe to include

### Your Environment Variables Should Look Like:
```
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
JWT_SECRET=myultrasecretkey12345
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWx
PORT=4000
```

---

## 🚀 Step 5: Deploy!

1. Double-check all settings
2. Click **"Create Web Service"**
3. Wait for deployment (2-5 minutes)

### What Render Does:
```
1. ✅ Clones your GitHub repo
2. ✅ Navigates to /hackathon-backend directory
3. ✅ Runs: npm install
4. ✅ Runs: npm start
5. ✅ Starts your Express API
6. ✅ Gives you a live URL
```

---

## 🎉 Step 6: Get Your Live URL

After deployment succeeds, Render gives you a URL like:

```
https://hackathon-portal-backend.onrender.com
```

### Test Your API:

**Health Check:**
```
https://hackathon-portal-backend.onrender.com/health
```

**Register User:**
```bash
curl -X POST https://hackathon-portal-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST https://hackathon-portal-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 🔄 Step 7: Update Frontend to Use Backend

In your React frontend, update `api.js` or environment variables:

```javascript
// src/api.js or .env
const API_URL = 'https://hackathon-portal-backend.onrender.com';

// or in .env
REACT_APP_API_URL=https://hackathon-portal-backend.onrender.com
```

---

## 📊 Monitoring Your Deployment

### View Logs
1. Go to Render dashboard
2. Click your service
3. Click **"Logs"** tab
4. See real-time logs

### Check Status
- **Building**: Yellow - deployment in progress
- **Live**: Green - backend is running
- **Failed**: Red - check logs for errors

---

## 🐛 Troubleshooting

### ❌ "Build Failed"
**Solution:** Check Root Directory is set to `hackathon-backend`

### ❌ "Application failed to respond"
**Solutions:**
- Check environment variables are correct
- Verify DATABASE_URL is valid
- Check Render logs for errors

### ❌ "Database connection failed"
**Solutions:**
- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure connection string includes `?sslmode=require`

### ❌ "Cannot find module"
**Solution:** Make sure `package.json` is in `hackathon-backend` folder

---

## 🔒 Security Best Practices

### Before Going Live:

1. **Change JWT_SECRET** to a strong random string
2. **Enable CORS** properly in `app.js`:
   ```javascript
   app.use(cors({
     origin: 'https://your-frontend.vercel.app',
     credentials: true
   }));
   ```
3. **Add rate limiting** (optional but recommended)
4. **Use HTTPS** (Render provides this automatically)

---

## 💰 Render Free Tier Limits

- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ Auto-sleep after 15 minutes of inactivity
- ✅ Cold starts when receiving requests
- ⚠️ First request after sleep takes 30-60 seconds

### To Prevent Sleep (Paid Plan):
Upgrade to Render's paid plan ($7/month) for always-on service

---

## 🔄 Continuous Deployment

Once set up, Render automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will:
1. Detect the push
2. Rebuild automatically
3. Deploy new version
4. Zero downtime

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] `package.json` has `"start": "node src/server.js"`
- [ ] Neon database created and running
- [ ] Database schema (`schema.sql`) executed in Neon
- [ ] Cloudinary account created
- [ ] All environment variables ready

During deployment:
- [ ] Root Directory set to `hackathon-backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] All environment variables added
- [ ] Branch is correct (`main`)

After deployment:
- [ ] Health check returns 200 OK
- [ ] Can register a user
- [ ] Can login and get JWT token
- [ ] Frontend updated with backend URL

---

## 🎯 Quick Reference

### Your Configuration:
```
Root Directory:    hackathon-backend
Build Command:     npm install
Start Command:     npm start
Environment Vars:  6 total (DATABASE_URL, JWT_SECRET, 3x Cloudinary, PORT)
```

### Your URLs After Deploy:
```
Backend API:       https://YOUR-SERVICE.onrender.com
Health Check:      https://YOUR-SERVICE.onrender.com/health
Register:          https://YOUR-SERVICE.onrender.com/api/auth/register
Login:             https://YOUR-SERVICE.onrender.com/api/auth/login
```

---

## 🎉 Success!

Your backend is now deployed and accessible worldwide! 

Connect your frontend, test your endpoints, and you're ready to launch your hackathon portal! 🚀

---

**Need Help?** 
- Check Render logs for detailed error messages
- Verify all environment variables
- Test locally first with `npm start`
