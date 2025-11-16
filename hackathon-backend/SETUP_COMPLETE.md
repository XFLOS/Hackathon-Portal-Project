# Backend Setup Complete! ✅

## What Was Created

### 📁 Directory Structure
```
hackathon-backend/
├── src/
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Server entry point
│   ├── config/
│   │   ├── db.js                 # PostgreSQL connection
│   │   └── cloudinary.js         # Cloudinary config
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── errorHandler.js       # Error handling
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── uploadRoutes.js       # File upload endpoints
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   └── uploadController.js   # Upload logic
│   └── utils/                    # (ready for utilities)
├── .env                          # Environment variables
├── package.json                  # Dependencies & scripts
├── schema.sql                    # Database schema
└── README_BACKEND.md             # Setup instructions
```

### 📦 Installed Dependencies
- ✅ express (web framework)
- ✅ cors (cross-origin requests)
- ✅ pg (PostgreSQL client)
- ✅ dotenv (environment variables)
- ✅ bcrypt (password hashing)
- ✅ jsonwebtoken (JWT auth)
- ✅ cloudinary (cloud storage)
- ✅ multer (file upload)
- ✅ multer-storage-cloudinary (Cloudinary integration)
- ✅ nodemon (dev auto-reload)

## 🚀 Next Steps

### 1. Configure Environment Variables
Edit `.env` file and replace placeholders:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### 2. Set Up Database
Run `schema.sql` in your Neon SQL Editor:
1. Go to your Neon dashboard
2. Open SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the script

### 3. Start the Backend
```bash
cd hackathon-backend
npm run dev
```

The server will start at `http://localhost:4000`

## 🔌 Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "student"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/profile` - Get user profile (requires JWT token)
  - Header: `Authorization: Bearer <token>`

### File Upload
- `POST /api/upload/single` - Upload single file (requires JWT token)
  - Form-data: `file` (the file to upload)

- `POST /api/upload/multiple` - Upload multiple files (requires JWT token)
  - Form-data: `files[]` (multiple files)

### System
- `GET /health` - Health check endpoint

## 🔐 Authentication Flow

1. **Register**: Create a new user account
2. **Login**: Get JWT token
3. **Use Token**: Include in Authorization header for protected routes

Example:
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get Profile (use token from login response)
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Database Schema

The schema includes tables for:
- **users** - User accounts (student, mentor, judge, coordinator, admin)
- **teams** - Hackathon teams
- **team_members** - Team membership
- **submissions** - Project submissions
- **evaluations** - Judge evaluations
- **announcements** - System announcements
- **schedule** - Event schedule
- **mentor_assignments** - Mentor-team assignments

## ⚙️ Configuration Details

### JWT Authentication
- Tokens expire in 24 hours
- Secret key in `.env` (change for production!)

### Database
- Uses connection pooling for performance
- SSL enabled by default
- Auto-reconnect on connection loss

### Cloudinary
- Supports: jpg, jpeg, png, pdf, doc, docx, zip
- Max file size: 10MB
- Files stored in `hackathon-uploads` folder

## 🐛 Troubleshooting

**"Database connection failed"**
- Check your DATABASE_URL in `.env`
- Verify Neon database is running
- Ensure IP is whitelisted in Neon dashboard

**"Invalid or expired token"**
- Token expires after 24 hours
- Login again to get new token

**"Cloudinary upload failed"**
- Verify Cloudinary credentials in `.env`
- Check file type and size limits

## 📝 To-Do / Extend Further

- [ ] Add team management endpoints
- [ ] Add submission endpoints
- [ ] Add judge evaluation endpoints
- [ ] Add mentor assignment endpoints
- [ ] Add input validation (express-validator)
- [ ] Add rate limiting
- [ ] Add API documentation (Swagger)
- [ ] Add unit tests
- [ ] Add logging (Winston)
- [ ] Deploy to cloud (Railway, Render, etc.)

## 🎉 You're Ready to Go!

Your backend is fully set up and ready for development. Start the server and begin building your hackathon portal!
