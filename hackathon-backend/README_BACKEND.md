# Hackathon Portal Backend

Backend API for the Hackathon Portal application built with Express.js and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database (Neon recommended)
- Cloudinary account

### Installation

1. **Navigate to backend directory:**
```bash
cd hackathon-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file in the `hackathon-backend` folder with:

```env
# Server Configuration
PORT=4000

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require

# JWT Secret for authentication
JWT_SECRET=supersecret123

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=<your_cloudname>
CLOUDINARY_API_KEY=<your_key>
CLOUDINARY_API_SECRET=<your_secret>
```

4. **Set up the database:**

Run this SQL in your Neon SQL Editor or PostgreSQL client:

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create team_members table
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

-- Create submissions table
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_submissions_team ON submissions(team_id);
```

5. **Start the development server:**
```bash
npm run dev
```

The server will start on `http://localhost:4000`

## 📁 Project Structure

```
hackathon-backend/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server entry point
│   ├── config/
│   │   ├── db.js           # PostgreSQL connection
│   │   └── cloudinary.js   # Cloudinary configuration
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication
│   │   └── errorHandler.js # Error handling
│   ├── routes/
│   │   └── authRoutes.js   # Authentication routes
│   ├── controllers/
│   │   └── authController.js # Auth logic
│   └── utils/              # Utility functions
├── .env                    # Environment variables
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Health Check
- `GET /health` - Check API status

## 🛠️ Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

```
Authorization: Bearer <your_token>
```

## 📝 Notes

- Make sure to replace placeholder values in `.env` with your actual credentials
- The JWT_SECRET should be a strong, random string in production
- Database uses SSL connection for security
- All passwords are hashed using bcrypt

## 🐛 Troubleshooting

**Database connection fails:**
- Verify your DATABASE_URL is correct
- Check if your IP is whitelisted in Neon dashboard
- Ensure SSL is enabled

**Cloudinary upload fails:**
- Verify your Cloudinary credentials
- Check if the file type is allowed

## 📚 Next Steps

1. Add more routes (teams, submissions, users)
2. Implement file upload endpoints
3. Add data validation
4. Set up proper error logging
5. Add API documentation (Swagger)
