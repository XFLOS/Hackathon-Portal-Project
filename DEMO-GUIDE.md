# 🎉 HACKATHON PORTAL - COMPLETE DEMO GUIDE

## 📋 Quick Start

### Demo Account Credentials
**Password for ALL accounts: `12345678`**

- 👤 **Student**: `student@demo.com`
- 🧑‍🏫 **Mentor**: `mentor@demo.com`
- ⚖️ **Judge**: `judge@demo.com`
- 🛠 **Coordinator**: `coordinator@demo.com`

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Setup Database in Neon

1. Go to https://console.neon.tech
2. Select your database: `ep-icy-wind-a80nmx2d`
3. Open the SQL Editor
4. Copy the entire contents of `COMPLETE-DATABASE-SETUP.sql`
5. Paste and click **Run**
6. Verify you see success messages showing all tables and data created

### Step 2: Deploy Backend to Render

1. Go to your Render dashboard
2. Find your service: `hackathon-portal-project-8737`
3. Click **Manual Deploy** → **Clear build cache & deploy**
4. Wait for deployment to complete (2-3 minutes)
5. Check logs to confirm: "Server running on port..."

### Step 3: Test Backend

Open PowerShell and run:
```powershell
# Test login
$body = '{"email":"student@demo.com","password":"12345678"}'
Invoke-RestMethod -Uri "https://hackathon-portal-project-8737.onrender.com/auth/login" -Method POST -ContentType "application/json" -Body $body
```

You should see a response with `token` and `user` object.

### Step 4: Deploy Frontend to Netlify

1. Go to your Netlify dashboard
2. Find your site: `hackathonportalproject4g5`
3. Click **Deploys** → **Trigger deploy** → **Clear cache and deploy**
4. Wait for deployment (1-2 minutes)

---

## 🎭 COMPLETE DEMO SCRIPT

### 👤 STUDENT ROLE DEMO

**Login:** `student@demo.com` / `12345678`

#### What Students Can Do:

1. **View Dashboard**
   - See welcome message
   - View assigned team
   - Check submission status

2. **View Team Page**
   - Navigate to "My Team"
   - See Team Phoenix with 5 members:
     - Demo Student (Leader)
     - Adam Test
     - Sarah Martinez
     - Vikram Lee
     - Jessica Chen
   - View project details

3. **View Submission**
   - Go to "Submissions"
   - See project: "AI Study Assistant"
   - View uploaded files, GitHub link, demo URL

4. **Check Schedule**
   - Navigate to "Schedule"
   - See all hackathon events (Opening, Workshops, Deadlines, etc.)

5. **View Leaderboard**
   - Navigate to "Leaderboard"
   - See team rankings based on judge scores

---

### 🧑‍🏫 MENTOR ROLE DEMO

**Login:** `mentor@demo.com` / `12345678`

#### What Mentors Can Do:

1. **View Assigned Teams**
   - Dashboard shows 2 assigned teams:
     - Team Phoenix
     - Team Dragons

2. **View Team Details**
   - Click on a team
   - See all team members
   - View their submission

3. **Provide Feedback**
   - Select Team Phoenix
   - Write feedback: "Great progress on the AI model! Consider adding more training data..."
   - Submit feedback
   - See feedback history

4. **Monitor Progress**
   - Check both teams' submissions
   - See which teams need guidance

---

### ⚖️ JUDGE ROLE DEMO

**Login:** `judge@demo.com` / `12345678`

#### What Judges Can Do:

1. **View All Submissions**
   - Dashboard shows 2 submissions:
     - Team Phoenix - AI Study Assistant
     - Team Dragons - Campus Event Manager

2. **Evaluate Team Phoenix** (not yet evaluated)
   - Click "Evaluate"
   - Score Innovation: 9/10
   - Score Technical: 8/10
   - Score Presentation: 7/10
   - Comments: "Highly innovative use of AI for education..."
   - Submit Evaluation

3. **View Existing Evaluation** (Team Dragons already evaluated)
   - Click on Team Dragons
   - See previous scores:
     - Innovation: 8/10
     - Technical: 9/10
     - Presentation: 8/10

4. **View Evaluation History**
   - Navigate to "History"
   - See all teams you've evaluated
   - See total scores and timestamps

---

### 🛠 COORDINATOR ROLE DEMO

**Login:** `coordinator@demo.com` / `12345678`

#### What Coordinators Can Do:

1. **Dashboard Overview**
   - Total Teams: 2
   - Total Submissions: 2
   - Total Students: 13
   - Total Evaluations: 2

2. **View All Teams**
   - See Team Phoenix (5 members)
   - See Team Dragons (5 members)
   - Check which teams have submitted

3. **View All Submissions**
   - Monitor submission status
   - See evaluation progress
   - View average scores

4. **Manage Schedule**
   - See all 8 events:
     - Opening Ceremony
     - Team Formation
     - Workshop: Intro to AI/ML
     - Mentor Check-in
     - Midnight Snacks
     - Submission Deadline
     - Presentations & Judging
     - Awards Ceremony
   - Add new events
   - Edit existing events

5. **View Leaderboard**
   - See team rankings
   - View detailed scores:
     - Team Dragons: 25/30 (avg)
     - Team Phoenix: 24/30 (avg)

6. **Assign Mentors**
   - View all users
   - Assign mentors to teams

---

## 🗺 API ENDPOINTS REFERENCE

### Auth
- `POST /auth/register` - Register new student
- `POST /auth/login` - Login (returns token + user)

### Student
- `GET /users/me` - Get profile
- `POST /team/create` - Create team
- `GET /team/me` - Get my team
- `POST /submission` - Create/update submission
- `GET /submission/me` - Get my submission

### Mentor
- `GET /mentor/teams` - Get assigned teams
- `POST /mentor/feedback/:teamId` - Provide feedback
- `GET /mentor/team/:teamId` - Get team details

### Judge
- `GET /judge/submissions` - Get all submissions
- `POST /judge/evaluate/:submissionId` - Submit evaluation
- `GET /judge/history` - Get evaluation history

### Coordinator
- `GET /coordinator/teams` - Get all teams
- `GET /coordinator/submissions` - Get all submissions
- `POST /coordinator/schedule` - Create schedule event
- `GET /coordinator/leaderboard` - Get leaderboard
- `GET /coordinator/stats` - Get statistics

### Public
- `GET /users/schedule` - Get schedule
- `GET /users/leaderboard` - Get leaderboard
- `GET /users/announcements` - Get announcements

---

## 📊 DEMO DATA SUMMARY

### Users (13 total)
- 4 Demo accounts (student, mentor, judge, coordinator)
- 9 Fake students (for team members)

### Teams (2)
- **Team Phoenix** - AI Study Assistant (5 members)
- **Team Dragons** - Campus Event Manager (5 members)

### Submissions (2)
- Team Phoenix submission (with GitHub, demo links)
- Team Dragons submission (with files)

### Evaluations (2)
- Team Phoenix evaluated by judge
- Team Dragons evaluated by judge

### Mentor Feedback (2)
- Feedback for Team Phoenix
- Feedback for Team Dragons

### Schedule Events (8)
- Full hackathon schedule from Opening to Awards

---

## ✅ DEMO CHECKLIST

Before your presentation, verify:

- [ ] Database has all demo data
- [ ] Backend is deployed and running
- [ ] Frontend is deployed and accessible
- [ ] Can login as Student
- [ ] Can login as Mentor
- [ ] Can login as Judge
- [ ] Can login as Coordinator
- [ ] Student can view their team
- [ ] Mentor can view assigned teams
- [ ] Judge can see submissions
- [ ] Coordinator can view all data
- [ ] Leaderboard shows rankings
- [ ] Schedule displays all events

---

## 🎬 PRESENTATION TIPS

1. **Start with Coordinator Dashboard** - Shows full overview
2. **Demo Student Flow** - Team → Submission → Leaderboard
3. **Show Mentor Interaction** - View team → Give feedback
4. **Demonstrate Judge Evaluation** - Score a submission live
5. **End with Leaderboard** - Show final rankings

---

## 🐛 TROUBLESHOOTING

### Login fails with 401
- Check password is exactly `12345678`
- Verify database setup completed

### Can't see teams/submissions
- Confirm database seed script ran
- Check browser console for errors

### API errors
- Verify backend is deployed
- Check Render logs for errors
- Confirm JWT_SECRET is set

---

## 🎉 SUCCESS METRICS

Your demo is successful if:
- ✅ All 4 roles can login
- ✅ Students see their team
- ✅ Mentors can give feedback
- ✅ Judges can evaluate
- ✅ Coordinator sees all data
- ✅ Leaderboard shows rankings

---

## 📞 QUICK REFERENCE

- **Frontend**: https://hackathonportalproject4g5.netlify.app
- **Backend**: https://hackathon-portal-project-8737.onrender.com
- **Database**: Neon PostgreSQL (ep-icy-wind-a80nmx2d)
- **GitHub**: https://github.com/XFLOS/Hackathon-Portal-Project

---

**REMEMBER: All demo accounts use password `12345678`**

Good luck with your demo! 🚀
