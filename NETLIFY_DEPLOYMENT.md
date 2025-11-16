# Netlify Deployment Guide

## ✅ Repository Status
- ✅ No `.gitmodules` file (no submodule conflicts)
- ✅ `netlify.toml` configured correctly
- ✅ Frontend directory: `hackathon-frontend`

## 🚀 Netlify Configuration

### Automatic Configuration (via netlify.toml)
The `netlify.toml` file in the repository root contains:
```toml
[build]
  base = "hackathon-frontend"
  publish = "hackathon-frontend/build"
  command = "npm run build"

[build.environment]
  REACT_APP_USE_MOCK_API = "false"
  REACT_APP_API_URL = "https://hackathon-portal-project-8737.onrender.com"
```

### Manual Configuration (if needed)
If Netlify doesn't pick up `netlify.toml`, configure manually:

**Site Settings → Build & Deploy → Build Settings**

| Setting | Value |
|---------|-------|
| **Base directory** | `hackathon-frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `hackathon-frontend/build` |

### Environment Variables
**Site Settings → Build & Deploy → Environment → Environment Variables**

Add these variables:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://hackathon-portal-project-8737.onrender.com` |
| `REACT_APP_USE_MOCK_API` | `false` |
| `REACT_APP_FIREBASE_API_KEY` | Your Firebase API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Your Firebase app ID |
| `REACT_APP_FIREBASE_MEASUREMENT_ID` | Your Firebase measurement ID |

## 📝 Deployment Steps

### Step 1: Connect Repository
1. Go to https://app.netlify.com
2. Click **Add new site → Import an existing project**
3. Choose **GitHub**
4. Select repository: `XFLOS/Hackathon-Portal-Project`
5. Branch: `main`

### Step 2: Verify Build Settings
Netlify should auto-detect settings from `netlify.toml`. Verify:
- Base directory: `hackathon-frontend`
- Build command: `npm run build`
- Publish directory: `hackathon-frontend/build`

### Step 3: Add Environment Variables
1. Go to **Site settings → Build & Deploy → Environment**
2. Click **Add environment variable**
3. Add all Firebase variables listed above
4. Add `REACT_APP_API_URL` (already in netlify.toml but good to have)

### Step 4: Deploy
1. Click **Deploy site**
2. Wait for build to complete
3. Check deploy log for errors

### Step 5: Test Deployment
Visit your Netlify URL (e.g., `https://your-app.netlify.app`)
- Check if site loads
- Test API connection to backend
- Verify Firebase authentication works

### Step 6: Update Backend CORS
Once deployed, add your Netlify URL to backend CORS:

Edit `hackathon-backend/src/app.js`:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://hackathon-portal-project-8737.onrender.com',
    'https://your-app.netlify.app',  // Add your Netlify URL
  ],
  // ...
};
```

Then redeploy backend on Render.

## 🔧 Troubleshooting

### Build Fails
- Check **Deploy log** in Netlify
- Verify `hackathon-frontend/package.json` has `build` script
- Ensure all dependencies are in `package.json`

### Site Loads but API Fails
- Check browser console for CORS errors
- Verify `REACT_APP_API_URL` is set correctly
- Add Netlify URL to backend CORS origins
- Redeploy backend after CORS changes

### Firebase Auth Not Working
- Verify all Firebase env variables are set
- Check Firebase Console → Project Settings → Authorized domains
- Add your Netlify domain to authorized domains

### Clear Cache and Redeploy
If issues persist:
1. Go to **Deploys** tab
2. Click **Trigger deploy → Clear cache and deploy site**

## 🎉 Success Checklist
- [ ] Site deploys without errors
- [ ] Homepage loads correctly
- [ ] API calls reach backend successfully
- [ ] Firebase authentication works
- [ ] No console errors in browser
- [ ] Custom domain configured (optional)

## 📚 Additional Resources
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [React Deployment](https://create-react-app.dev/docs/deployment/#netlify)

---

**Backend URL**: https://hackathon-portal-project-8737.onrender.com  
**Repository**: https://github.com/XFLOS/Hackathon-Portal-Project
