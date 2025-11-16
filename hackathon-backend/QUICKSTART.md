# 🚀 Quick Start Guide - Backend

## Current Status: ✅ Backend Created Successfully!

Your backend is fully set up and can run. However, you need to configure your credentials for full functionality.

## ⚡ Start Backend Now (Test Mode)

You can start the backend immediately to test:

```bash
cd hackathon-backend
npm run dev
```

The server will start at **http://localhost:4000** but will show warnings about missing configuration.

## 🔧 Configure for Full Functionality

### Step 1: Get Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up / Login
3. Create a new project
4. Copy your connection string (it looks like):
   ```
   postgresql://username:password@host.neon.tech/database?sslmode=require
   ```

### Step 2: Get Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard
4. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Update .env File

Open `hackathon-backend/.env` and replace the placeholders:

```env
PORT=4000

# Replace this with your actual Neon connection string
DATABASE_URL=postgresql://your_user:your_password@your_host.neon.tech/your_db?sslmode=require

# Keep this or change to a secure random string
JWT_SECRET=supersecret123

# Replace with your Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Set Up Database Tables

1. Open Neon SQL Editor in your dashboard
2. Copy the contents of `hackathon-backend/schema.sql`
3. Paste and execute in the SQL Editor
4. Verify tables were created

### Step 5: Restart Backend

```bash
# Stop the current server (Ctrl + C)
# Then start again
npm run dev
```

You should now see:
```
✅ Cloudinary configured
✅ Database connection successful
🚀 Server is running on port 4000
```

## 🧪 Test the Backend

### Test Health Endpoint
Open your browser or use curl:
```
http://localhost:4000/health
```

### Test User Registration
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\",\"name\":\"Test User\"}"
```

### Test User Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"
```

## 📚 Documentation

- **Full Setup**: See `README_BACKEND.md`
- **API Endpoints**: See `SETUP_COMPLETE.md`
- **Database Schema**: See `schema.sql`

## ❓ Common Issues

**"Database connection failed"**
- Check your DATABASE_URL is correct
- Verify you've created the database in Neon
- Make sure your IP is whitelisted (Neon auto-whitelists)

**"Cloudinary not configured"**
- Check your credentials in .env
- Make sure there are no < or > symbols in the values

**Backend won't start**
- Make sure you're in the `hackathon-backend` folder
- Run `npm install` first
- Check if port 4000 is already in use

## 🎉 Next Steps

Once configured:
1. ✅ Backend will run fully functional
2. ✅ Can register users and login
3. ✅ Can upload files to Cloudinary
4. ✅ Connect your React frontend to this backend
5. ✅ Build additional features (teams, submissions, etc.)

---

**Need Help?** Check the detailed documentation in `README_BACKEND.md`
