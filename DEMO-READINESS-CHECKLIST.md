# ✅ DEMO READINESS CHECKLIST

Complete this checklist before your demo presentation.

---

## 📋 PART 1: DEPLOYMENT (Required - 15 minutes)

### Database Setup ⏱️ 5 minutes

- [ ] **Go to Neon Console**: https://console.neon.tech
- [ ] **Select database**: `ep-icy-wind-a80nmx2d`
- [ ] **Open SQL Editor**
- [ ] **Copy** entire `hackathon-backend/COMPLETE-DATABASE-SETUP.sql`
- [ ] **Paste and Run** in SQL Editor
- [ ] **Verify output** shows:
  - ✅ USERS CREATED (13 users)
  - ✅ TEAMS CREATED (2 teams)
  - ✅ SUBMISSIONS (2)
  - ✅ EVALUATIONS (2)
  - ✅ SCHEDULE EVENTS (8)

### Backend Deployment ⏱️ 3 minutes

- [ ] **Go to Render**: https://dashboard.render.com
- [ ] **Find service**: `hackathon-portal-project-8737`
- [ ] **Click**: Manual Deploy → Clear build cache & deploy
- [ ] **Wait** for deployment (2-3 minutes)
- [ ] **Check Logs** for: "Server running on port..."
- [ ] **No errors** in logs

### Frontend Deployment ⏱️ 2 minutes

- [ ] **Go to Netlify**: https://app.netlify.com
- [ ] **Find site**: `hackathonportalproject4g5`
- [ ] **Click**: Deploys → Trigger deploy → Clear cache and deploy
- [ ] **Wait** for deployment (1-2 minutes)
- [ ] **Site published** successfully

### API Test ⏱️ 2 minutes

- [ ] **Run in PowerShell**:
```powershell
$body = '{"email":"student@demo.com","password":"12345678"}'
$response = Invoke-RestMethod -Uri "https://hackathon-portal-project-8737.onrender.com/auth/login" -Method POST -ContentType "application/json" -Body $body
$response | ConvertTo-Json
```

- [ ] **Verify response** contains:
  - ✅ `token`: "eyJhbGc..."
  - ✅ `user.role`: "student"
  - ✅ `user.full_name`: "Demo Student"

### Login Tests ⏱️ 3 minutes

Test each account at: https://hackathonportalproject4g5.netlify.app/login

- [ ] **Student**: `student@demo.com` / `12345678`
  - Redirects to `/student-dashboard` ✅
  
- [ ] **Mentor**: `mentor@demo.com` / `12345678`
  - Redirects to `/mentor-dashboard` ✅
  
- [ ] **Judge**: `judge@demo.com` / `12345678`
  - Redirects to `/judge-dashboard` ✅
  
- [ ] **Coordinator**: `coordinator@demo.com` / `12345678`
  - Redirects to `/coordinator-dashboard` ✅

---

## 🎯 PART 2: DEMO FLOW VERIFICATION (Recommended - 10 minutes)

### Student Dashboard Check

- [ ] **Login as** `student@demo.com`
- [ ] **Dashboard loads** without errors
- [ ] **Open browser DevTools** (F12) → Network tab
- [ ] **Navigate to "My Team"** (or similar)
- [ ] **Verify API call**: `GET /team/me` returns 200
- [ ] **See Team Phoenix** with 5 members (or demo data)
- [ ] **Navigate to "Submissions"**
- [ ] **See project**: "AI Study Assistant"
- [ ] **No console errors** (check Console tab)

### Mentor Dashboard Check

- [ ] **Logout and login as** `mentor@demo.com`
- [ ] **Dashboard loads** successfully
- [ ] **Check API calls**: `GET /mentor/teams` returns data
- [ ] **See 2 assigned teams** (Phoenix & Dragons)
- [ ] **Click on a team** → Team details load
- [ ] **Feedback section** exists

### Judge Dashboard Check

- [ ] **Logout and login as** `judge@demo.com`
- [ ] **Dashboard loads** successfully
- [ ] **Check API call**: `GET /judge/submissions` returns data
- [ ] **See 2 submissions** listed
- [ ] **At least 1 team** already evaluated (Dragons)
- [ ] **Evaluation form** exists for scoring

### Coordinator Dashboard Check

- [ ] **Logout and login as** `coordinator@demo.com`
- [ ] **Dashboard loads** successfully
- [ ] **Check API call**: `GET /coordinator/stats` returns data
- [ ] **Statistics display**: Teams, Submissions, etc.
- [ ] **Leaderboard** shows rankings
- [ ] **Schedule** shows 8 events

---

## 🔧 PART 3: FIX COMMON ISSUES (If Needed)

### Issue: Login Returns 401

**Symptoms**: Login fails with "Invalid credentials"

**Solutions**:
- [ ] Verify password is exactly `12345678` (no extra spaces)
- [ ] Check database setup SQL was run completely
- [ ] Query Neon: `SELECT * FROM users WHERE email = 'student@demo.com';`
- [ ] Confirm password hash exists

### Issue: Login Returns 500

**Symptoms**: Login crashes with server error

**Solutions**:
- [ ] Check Render logs for error message
- [ ] Verify `JWT_SECRET` environment variable is set in Render
- [ ] Restart backend service
- [ ] Check database connection string

### Issue: Dashboard Shows No Data

**Symptoms**: Dashboard loads but empty

**Solutions**:
- [ ] Open browser DevTools → Network tab
- [ ] Check API calls - are they 404 or 500?
- [ ] Verify `REACT_APP_API_URL` in Netlify env vars
- [ ] Check backend route exists (e.g., `/team/me`)
- [ ] Verify auth token is sent in request headers

### Issue: "Cannot GET /student-dashboard"

**Symptoms**: Refresh page shows 404

**Solutions**:
- [ ] Check `netlify.toml` has `[[redirects]]`
- [ ] Verify `from = "/*"` and `to = "/index.html"`
- [ ] Redeploy frontend with correct config

---

## 🎬 PART 4: PREPARE DEMO PRESENTATION (Optional - 15 minutes)

### Demo Script Preparation

- [ ] **Open DEMO-GUIDE.md** and read through
- [ ] **Practice flow**: Student → Mentor → Judge → Coordinator
- [ ] **Prepare talking points** for each role
- [ ] **Bookmark key pages**:
  - Login page
  - Student dashboard
  - Team page
  - Leaderboard
  - Schedule

### Demo Environment Setup

- [ ] **Browser**: Open Chrome/Edge in Incognito mode (clean session)
- [ ] **Tabs ready**:
  - Tab 1: Login page
  - Tab 2: (blank for navigation)
  - Tab 3: Backend API health check
- [ ] **DevTools**: Practice opening Network/Console tabs
- [ ] **Screen resolution**: Set to 1920x1080 for projector

### Backup Plan

- [ ] **Screenshot** key pages showing data
- [ ] **Record** 2-minute demo video (optional)
- [ ] **Print** demo credentials on paper
- [ ] **Test** on mobile device (responsive check)

---

## 📊 PART 5: DATA VALIDATION (Final Check - 5 minutes)

### Verify Demo Data in Database

Run these queries in Neon SQL Editor:

- [ ] **Users exist**:
```sql
SELECT id, full_name, email, role FROM users 
WHERE email LIKE '%@demo.com' 
ORDER BY role;
```
Should return 4 users ✅

- [ ] **Teams exist**:
```sql
SELECT t.name, COUNT(tm.id) as members 
FROM teams t 
LEFT JOIN team_members tm ON t.id = tm.team_id 
GROUP BY t.id, t.name;
```
Should show 2 teams with 5 members each ✅

- [ ] **Submissions exist**:
```sql
SELECT s.title, t.name as team_name 
FROM submissions s 
JOIN teams t ON s.team_id = t.id;
```
Should show 2 submissions ✅

- [ ] **Evaluations exist**:
```sql
SELECT e.innovation_score, e.technical_score, e.presentation_score, t.name 
FROM evaluations e 
JOIN submissions s ON e.submission_id = s.id 
JOIN teams t ON s.team_id = t.id;
```
Should show 2 evaluations ✅

- [ ] **Schedule events exist**:
```sql
SELECT event_name, start_time 
FROM schedule 
ORDER BY start_time;
```
Should show 8 events ✅

---

## ✅ FINAL CHECKLIST

### Must Complete (Critical)

- [ ] Database setup complete
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] All 4 demo accounts can login
- [ ] Each role redirects to correct dashboard

### Should Complete (Important)

- [ ] API calls return data (check Network tab)
- [ ] No console errors on dashboards
- [ ] Leaderboard displays rankings
- [ ] Schedule shows events
- [ ] Team data appears correctly

### Nice to Have (Optional)

- [ ] Practiced demo flow
- [ ] Screenshot backup ready
- [ ] Demo script prepared
- [ ] Mobile responsive tested
- [ ] Video recorded

---

## 🎉 YOU'RE READY IF:

✅ Can login as all 4 roles  
✅ Each dashboard loads without errors  
✅ API calls return 200 status codes  
✅ Demo data appears correctly  
✅ No red errors in console

---

## 🆘 EMERGENCY CONTACTS

**If demo fails during presentation:**

1. **Show screenshots** of working version
2. **Explain architecture** using diagrams
3. **Walk through code** in GitHub repo
4. **Show Render/Netlify** deployment dashboards
5. **Display database** schema in Neon

**Last resort**: Show `DEMO-GUIDE.md` to explain intended functionality

---

## 📞 QUICK REFERENCE

| Resource | Link |
|----------|------|
| **Frontend** | https://hackathonportalproject4g5.netlify.app |
| **Backend** | https://hackathon-portal-project-8737.onrender.com |
| **Database** | https://console.neon.tech |
| **GitHub** | https://github.com/XFLOS/Hackathon-Portal-Project |
| **Render Logs** | https://dashboard.render.com |
| **Netlify Logs** | https://app.netlify.com |

**Demo Password**: `12345678` (for all accounts)

---

**Good luck with your demo! 🚀**

Print this checklist and mark off items as you complete them.
