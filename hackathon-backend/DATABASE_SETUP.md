# Database Setup Instructions

## 📋 Overview

Your Hackathon Portal has **4 pre-configured demo accounts** with different roles:
- Student
- Mentor  
- Judge
- Coordinator

All demo accounts use the password: **`DemoPass123`**

## 🚀 Setup Steps

### 1. **Go to Neon Console**
   Visit: https://console.neon.tech

### 2. **Select Your Project**
   Choose the database project connected to your Render backend

### 3. **Open SQL Editor**
   Click **SQL Editor** in the left sidebar

### 4. **Run the Setup Script**
   Copy the entire contents of `setup-demo-users.sql` and paste into the SQL Editor

### 5. **Execute the Script**
   Click **Run** to create the users table and insert demo accounts

## 👥 Demo Account Credentials

| Role | Email | Password | Name |
|------|-------|----------|------|
| Student | `student@demo.com` | `DemoPass123` | Demo Student |
| Mentor | `mentor@demo.com` | `DemoPass123` | Demo Mentor |
| Judge | `judge@demo.com` | `DemoPass123` | Demo Judge |
| Coordinator | `coordinator@demo.com` | `DemoPass123` | Demo Coordinator |

## 🔒 Registration Security

### Frontend Registration
- **Only creates 'student' role accounts**
- Users cannot choose their role during registration
- All new registrations are automatically assigned 'student' role

### Creating Other Roles
Mentor, Judge, and Coordinator accounts must be created:
1. Directly in the database (using SQL)
2. Or by an admin endpoint (to be implemented)

## 📝 Database Schema

```sql
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    full_name   TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,     -- bcrypt hash
    role        TEXT NOT NULL,      -- 'student', 'mentor', 'judge', or 'coordinator'
    created_at  TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Troubleshooting

### "User already exists" error
If you get a conflict error when running the script:
1. The demo users already exist in your database
2. You can login with the credentials above
3. Or delete existing users first:
   ```sql
   DELETE FROM users WHERE email LIKE '%@demo.com';
   ```
   Then re-run the setup script

### Login fails with 401
1. Make sure you ran the SQL script in the **correct database**
2. Verify your Render `DATABASE_URL` points to the same database
3. Check the password is exactly: `DemoPass123` (case-sensitive)

### Generate a new password hash
If you need a different password:
```bash
cd hackathon-backend
node generate-hash.js YourNewPassword
```

Copy the generated hash and update the database:
```sql
UPDATE users SET password = '$2b$10$...' WHERE email = 'student@demo.com';
```

## 🎯 Testing Login

After running the setup script:

1. Go to your Netlify frontend
2. Try logging in with any demo account
3. Example:
   - Email: `student@demo.com`
   - Password: `DemoPass123`

## 📚 Files

- `setup-demo-users.sql` - SQL script to create demo accounts
- `generate-hash.js` - Utility to generate bcrypt password hashes

## ✅ Verification

After running the setup, verify users exist:
```sql
SELECT id, full_name, email, role, created_at 
FROM users 
ORDER BY id;
```

You should see all 4 demo accounts listed.
