# 🚀 DEMO SETUP GUIDE

## Complete Demo Readiness Checklist

Follow these steps to prepare your Hackathon Portal for a full demo presentation.

---

## ✅ Step 1: Database Setup (CRITICAL - DO THIS FIRST!)

### What You Need:
- Access to your Neon PostgreSQL dashboard
- The `COMPLETE-DATABASE-SETUP.sql` file (in `hackathon-backend/` folder)

### Instructions:

1. **Go to Neon Console:**
   - Visit: https://console.neon.tech
   - Login with your account
   - Select your project: **HackathonPortal** (or whatever you named it)

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Or click your database → "Query" tab

3. **Run the Setup SQL:**
   ```sql
   -- Open hackathon-backend/COMPLETE-DATABASE-SETUP.sql
   -- Copy the ENTIRE file contents
   -- Paste into Neon SQL Editor
   -- Click "Run" button
   ```

4. **Verify Success:**
   - You should see: `CREATE TABLE`, `INSERT`, and success messages
   - Check that you have:
     - ✅ 13 users created (4 demo accounts + 9 team members)
     - ✅ 2 teams (Phoenix Rising & Code Dragons)
     - ✅ 2 submissions
     - ✅ 2 evaluations
     - ✅ 8 schedule events

5. **What This Creates:**
   
   **Demo Accounts (Password: `12345678` for all):**
   - `student@demo.com` - Team leader of "Phoenix Rising"
   - `mentor@demo.com` - Mentor assigned to teams
   - `judge@demo.com` - Judge who evaluates submissions
   - `coordinator@demo.com` - Admin with full access

   **Demo Teams:**
   - **Phoenix Rising**: 5 members, has submission with score 85
   - **Code Dragons**: 5 members, has submission with score 92

   **Demo Data:**
   - Submissions with Cloudinary file URLs
   - Judge evaluations with scores and feedback
   - Schedule events (opening, deadlines, presentations)

---

## ✅ Step 2: Environment Variables Check

### Backend (.env in `hackathon-backend/`):
```bash
PORT=4000
DATABASE_URL=postgresql://your-neon-connection-string
JWT_SECRET=your-secret-key-at-least-32-characters
CLOUDINARY_CLOUD_NAME=dxjum86lp
CLOUDINARY_API_KEY=568234636744528
CLOUDINARY_API_SECRET=ej-Hx60JnfAoma1L4UHgFsgkFSs
```

### Frontend (.env in `hackathon-frontend/`):
```bash
REACT_APP_API_URL=https://hackathon-portal-project-8737.onrender.com
REACT_APP_USE_MOCK_API=false
EXTEND_ESLINT=true
DISABLE_ESLINT_PLUGIN=true
```

---

## ✅ Step 3: Deploy & Verify Backend (Render)

### Check Render Deployment:

1. **Visit Render Dashboard:**
   - https://dashboard.render.com
   - Open your `hackathon-portal-project` service

2. **Check Environment Variables:**
   - Go to "Environment" tab
   - Verify all variables are set (especially `DATABASE_URL` and `JWT_SECRET`)

3. **Check Logs:**
   - Click "Logs" tab
   - Should see: ✅ `Server running on port 4000`
   - Should see: ✅ `✅ Database connected successfully`

4. **Test API Endpoint:**
   ```bash
   # Open browser or use curl
   https://hackathon-portal-project-8737.onrender.com/health
   
   # Expected response:
   {
     "status": "ok",
     "message": "Hackathon Portal API is running",
     "timestamp": "2025-11-17T..."
   }
   ```

5. **Test Login Endpoint:**
   ```bash
   curl -X POST https://hackathon-portal-project-8737.onrender.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"student@demo.com","password":"12345678"}'
   
   # Expected: JSON with token and user object
   ```

---

## ✅ Step 4: Deploy & Verify Frontend (Netlify)

### Check Netlify Deployment:

1. **Visit Netlify Dashboard:**
   - https://app.netlify.com
   - Open your site: `hackathonportalproject4g5`

2. **Check Build Logs:**
   - Click "Deploys" → Latest deploy → "Deploy log"
   - Should see: ✅ `Site is live`
   - Build time: ~2-3 minutes

3. **Check Environment Variables:**
   - Go to "Site settings" → "Environment variables"
   - Verify `REACT_APP_API_URL` is set correctly

4. **Test Live Site:**
   - Visit: https://hackathonportalproject4g5.netlify.app
   - Should load homepage without errors
   - Open DevTools → Console (should have no errors)
   - Open DevTools → Network tab

---

## ✅ Step 5: Test Demo Flow

### 5.1 Test Student Account

1. **Login:**
   - Go to: https://hackathonportalproject4g5.netlify.app/login
   - Email: `student@demo.com`
   - Password: `12345678`
   - ✅ Should redirect to `/student-dashboard`

2. **Student Dashboard:**
   - ✅ Should see "Phoenix Rising" team
   - ✅ Should see 5 team members
   - ✅ Should see 1 submission
   - ✅ Should see schedule events

3. **Team Page:**
   - Click "Team" in navbar
   - ✅ Should load team details
   - ✅ File upload component should be visible

### 5.2 Test Mentor Account

1. **Logout & Login:**
   - Logout from student account
   - Login: `mentor@demo.com` / `12345678`
   - ✅ Should redirect to `/mentor-dashboard`

2. **Mentor Dashboard:**
   - ✅ Should see assigned teams list
   - ✅ Should show team names and member counts

### 5.3 Test Judge Account

1. **Logout & Login:**
   - Login: `judge@demo.com` / `12345678`
   - ✅ Should redirect to `/judge-dashboard`

2. **Judge Dashboard:**
   - ✅ Should see 2 submissions to evaluate
   - ✅ Should show team names
   - ✅ Should show submission dates

### 5.4 Test Coordinator Account

1. **Logout & Login:**
   - Login: `coordinator@demo.com` / `12345678`
   - ✅ Should redirect to `/coordinator-dashboard`

2. **Coordinator Dashboard:**
   - ✅ Should see stats:
     - Total Teams: 2
     - Total Submissions: 2
     - Total Users: 13
     - Evaluated Submissions: 2

3. **Leaderboard:**
   - Navigate to `/leaderboard`
   - ✅ Should see teams ranked by score:
     1. Code Dragons - 92
     2. Phoenix Rising - 85

---

## ✅ Step 6: Test API Calls in Production

### Open Browser DevTools:

1. **Login as any demo account**
2. **Open DevTools (F12)**
3. **Go to Network tab**
4. **Refresh dashboard**

**Expected API Calls:**

- ✅ `GET /team/me` → 200 OK (student)
- ✅ `GET /submission/me` → 200 OK (student)
- ✅ `GET /users/schedule` → 200 OK (all)
- ✅ `GET /mentor/teams` → 200 OK (mentor)
- ✅ `GET /judge/submissions` → 200 OK (judge)
- ✅ `GET /coordinator/stats` → 200 OK (coordinator)
- ✅ `GET /coordinator/leaderboard` → 200 OK (coordinator)

**Check for Errors:**
- ❌ No 404 errors
- ❌ No CORS errors
- ❌ No authentication errors
- ❌ No 500 server errors

---

## ✅ Step 7: Test File Upload

1. **Login as `student@demo.com`**
2. **Go to Team Page**
3. **Select a file (any .zip, .pdf, or image)**
4. **Click Upload**
5. **Expected:**
   - ✅ "Uploading..." spinner appears
   - ✅ File uploads to Cloudinary
   - ✅ Success message appears
   - ✅ Console shows file URL

---

## ✅ Step 8: Documentation Update

### Update README.md with:

```markdown
## 🎬 LIVE DEMO

**Frontend:** https://hackathonportalproject4g5.netlify.app  
**Backend API:** https://hackathon-portal-project-8737.onrender.com

### Demo Accounts (Password: `12345678`)

| Role | Email | Features |
|------|-------|----------|
| Student | student@demo.com | Team management, submissions, schedule |
| Mentor | mentor@demo.com | View assigned teams, provide guidance |
| Judge | judge@demo.com | Evaluate submissions, score projects |
| Coordinator | coordinator@demo.com | Admin panel, stats, leaderboard |

### Demo Walkthrough

1. **Student Flow:**
   - Login → View team "Phoenix Rising" → See 5 members → Check submission
   - Navigate to Team page → Upload project files → Post updates

2. **Mentor Flow:**
   - Login → View assigned teams → See team progress

3. **Judge Flow:**
   - Login → View submissions → See 2 projects to evaluate
   - Check scores: Phoenix Rising (85), Code Dragons (92)

4. **Coordinator Flow:**
   - Login → View platform stats (2 teams, 13 users, 2 submissions)
   - Check leaderboard → See ranked teams

### Technical Stack
- **Frontend:** React 18, React Router 7, Axios
- **Backend:** Express 4, PostgreSQL (Neon), JWT Auth, Cloudinary
- **Deployment:** Netlify (frontend), Render (backend)
```

---

## ✅ Step 9: Mobile & Responsive Check

1. **Open site on phone or use Chrome DevTools device emulator**
2. **Test all 4 demo accounts on mobile:**
   - ✅ Login works
   - ✅ Dashboards load correctly
   - ✅ Navigation is accessible
   - ✅ Cards stack vertically
   - ✅ Text is readable

---

## ✅ Step 10: Final Pre-Demo Checklist

- [ ] Database has 13 users, 2 teams, 2 submissions
- [ ] All 4 demo accounts login successfully
- [ ] Student dashboard shows team and submission
- [ ] Mentor dashboard shows assigned teams
- [ ] Judge dashboard shows submissions to evaluate
- [ ] Coordinator dashboard shows accurate stats
- [ ] Leaderboard displays teams in correct order (Code Dragons 1st, Phoenix Rising 2nd)
- [ ] File upload works (Cloudinary integration)
- [ ] No console errors in browser DevTools
- [ ] No 404 API errors in Network tab
- [ ] Mobile responsive design works
- [ ] README has demo account credentials
- [ ] README has live demo links
- [ ] Backend logs show successful database connection
- [ ] Frontend builds without errors

---

## 🔧 Troubleshooting

### "Cannot login" or "Invalid credentials"
- ✅ Verify you ran `COMPLETE-DATABASE-SETUP.sql` in Neon
- ✅ Check password is exactly `12345678` (no spaces)
- ✅ Check DATABASE_URL in Render environment variables

### "Dashboard shows no data"
- ✅ Check Network tab - are API calls returning 200?
- ✅ Verify backend is running (check Render logs)
- ✅ Check REACT_APP_API_URL points to correct Render URL

### "File upload fails"
- ✅ Check CLOUDINARY credentials in Render environment
- ✅ Check browser console for specific error
- ✅ Verify `/upload` endpoint works (check Render logs)

### "CORS errors"
- ✅ Backend has `cors({ origin: '*' })` enabled
- ✅ Check Render logs for CORS middleware loading

### "Database connection failed"
- ✅ Check DATABASE_URL format in Render
- ✅ Verify Neon database is active (not paused)
- ✅ Check Neon connection pooler is enabled

---

## 📊 Expected Demo Data After SQL Setup

### Users (13 total):
- 4 demo accounts (student, mentor, judge, coordinator)
- 5 members of Phoenix Rising team
- 4 members of Code Dragons team

### Teams (2 total):
- **Phoenix Rising** - Created by student@demo.com
- **Code Dragons** - Created by alice.chen@email.com

### Submissions (2 total):
- Phoenix Rising: "AI-Powered Task Manager" - Score: 85
- Code Dragons: "Blockchain Voting System" - Score: 92

### Evaluations (2 total):
- Both submissions evaluated by judge@demo.com
- Detailed feedback provided for each

### Schedule Events (8 total):
- Opening Ceremony, Team Formation, Hacking Begins, Mid-Hack Check-in, Code Freeze, Presentations, Judging Complete, Awards Ceremony

---

## 🎥 Optional: Record Demo Video

1. **Screen recording tool:** OBS Studio, Loom, or built-in screen recorder
2. **Demo script:**
   - Show login for each role
   - Navigate through each dashboard
   - Show team details
   - Show leaderboard
   - Upload a file
   - Show responsive design on mobile
3. **Upload to YouTube or embed in README**

---

## ✅ You're Ready!

Once all checkboxes are complete, your demo is production-ready! 🎉

**Quick Test Before Demo:**
```bash
# 1. Login as student@demo.com
# 2. Check dashboard loads
# 3. Verify team appears
# 4. Done! 🚀
```
