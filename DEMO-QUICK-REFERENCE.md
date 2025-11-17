# 🎯 DEMO QUICK REFERENCE CARD

## Quick Access

**Live Site:** https://hackathonportalproject4g5.netlify.app  
**Backend API:** https://hackathon-portal-project-8737.onrender.com  
**Password for all accounts:** `12345678`

---

## 🔑 Demo Accounts

```
┌──────────────┬──────────────────────┬─────────────────────────────┐
│ ROLE         │ EMAIL                │ WHAT TO SHOW                │
├──────────────┼──────────────────────┼─────────────────────────────┤
│ Student      │ student@demo.com     │ Team "Phoenix Rising"       │
│              │                      │ 5 members, 1 submission     │
│              │                      │ File upload feature         │
├──────────────┼──────────────────────┼─────────────────────────────┤
│ Mentor       │ mentor@demo.com      │ Assigned teams list         │
│              │                      │ Team progress monitoring    │
├──────────────┼──────────────────────┼─────────────────────────────┤
│ Judge        │ judge@demo.com       │ 2 submissions to evaluate   │
│              │                      │ Scores: 85 and 92           │
├──────────────┼──────────────────────┼─────────────────────────────┤
│ Coordinator  │ coordinator@demo.com │ Platform stats dashboard    │
│              │                      │ Leaderboard (ranked teams)  │
└──────────────┴──────────────────────┴─────────────────────────────┘
```

---

## 📋 5-Minute Demo Script

### **Minute 1: Student Experience**
1. Login: `student@demo.com` / `12345678`
2. Show dashboard: Team, submission, schedule
3. Click "Team" → Show 5 members

### **Minute 2: File Upload**
4. On Team page, upload a test file
5. Show Cloudinary integration working

### **Minute 3: Mentor View**
6. Logout → Login: `mentor@demo.com` / `12345678`
7. Show assigned teams
8. Explain mentorship features

### **Minute 4: Judge Evaluation**
9. Logout → Login: `judge@demo.com` / `12345678`
10. Show 2 submissions
11. Show scores: Phoenix (85), Dragons (92)

### **Minute 5: Admin Dashboard**
12. Logout → Login: `coordinator@demo.com` / `12345678`
13. Show stats: 2 teams, 13 users, 2 submissions
14. Show leaderboard (Code Dragons #1, Phoenix #2)

---

## 🎬 Demo Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      STUDENT JOURNEY                         │
├─────────────────────────────────────────────────────────────┤
│ Login → Dashboard → View Team → Upload File → Check Schedule│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      MENTOR JOURNEY                          │
├─────────────────────────────────────────────────────────────┤
│ Login → Dashboard → View Assigned Teams → Monitor Progress  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      JUDGE JOURNEY                           │
├─────────────────────────────────────────────────────────────┤
│ Login → Dashboard → View Submissions → See Scores/Feedback  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   COORDINATOR JOURNEY                        │
├─────────────────────────────────────────────────────────────┤
│ Login → Dashboard → View Stats → Check Leaderboard          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Pre-Demo Checklist (2 mins before)

- [ ] Open live site in browser
- [ ] Test login with `student@demo.com` / `12345678`
- [ ] Verify dashboard loads without errors
- [ ] Open DevTools → Network tab (show API calls during demo)
- [ ] Close unnecessary browser tabs
- [ ] Prepare test file for upload demo (.zip or .pdf)
- [ ] Bookmark all 4 demo account credentials

---

## 🚨 Emergency Fixes

### If Login Fails:
```bash
# Check backend is running
curl https://hackathon-portal-project-8737.onrender.com/health

# Expected: {"status":"ok", ...}
```

### If Dashboard Shows No Data:
- Open DevTools → Network tab
- Check if API calls are returning 200 OK
- If 404: Backend routes may need deployment

### If Backend is Down:
- Check Render dashboard logs
- Look for "Database connected successfully"
- Verify DATABASE_URL is set in Render environment

---

## 📊 Demo Data Reference

### Teams:
- **Phoenix Rising** (student@demo.com's team)
  - Members: 5 (Student Demo + 4 teammates)
  - Submission: "AI-Powered Task Manager"
  - Score: 85

- **Code Dragons** (alice.chen@email.com's team)
  - Members: 4
  - Submission: "Blockchain Voting System"
  - Score: 92

### Total Counts:
- Users: 13
- Teams: 2
- Submissions: 2
- Evaluations: 2
- Schedule Events: 8

---

## 🎤 Talking Points

**For Students:**
> "Students can form teams, manage members, upload project files to Cloudinary, and track deadlines in real-time."

**For Mentors:**
> "Mentors are assigned teams and can monitor their progress, provide guidance, and send feedback throughout the hackathon."

**For Judges:**
> "Judges evaluate submissions using a rubric, assign scores, and provide detailed feedback. Scores are automatically ranked on the leaderboard."

**For Coordinators:**
> "Coordinators have a bird's-eye view of the entire hackathon: total participants, teams, submissions, and real-time leaderboard standings."

**Technical Highlights:**
> "Built with React and Express, deployed on Netlify and Render, using PostgreSQL on Neon for the database and Cloudinary for file storage. JWT authentication ensures secure role-based access."

---

## 🔗 Quick Links for Demo

- **Frontend:** https://hackathonportalproject4g5.netlify.app
- **Login Page:** https://hackathonportalproject4g5.netlify.app/login
- **GitHub Repo:** https://github.com/XFLOS/Hackathon-Portal-Project
- **Render Backend:** https://dashboard.render.com (show deployment)
- **Netlify Dashboard:** https://app.netlify.com (show build logs)

---

## 📱 Mobile Demo

**Optional: Show responsive design**
- Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
- Select "iPhone 12 Pro"
- Show login and dashboard on mobile view
- Demonstrate touch-friendly navigation

---

## ⏱️ Backup: 1-Minute Speed Demo

If short on time:

1. **Login:** student@demo.com
2. **Dashboard:** "Here's Phoenix Rising team with 5 members"
3. **Stats:** coordinator@demo.com → "2 teams, 13 users, ranked leaderboard"
4. **Done!** 🚀

---

## 🎯 Key Features to Highlight

✅ **Role-Based Access Control** - Different dashboards for each role  
✅ **Real-Time Data** - API-driven dashboards with live updates  
✅ **File Upload** - Cloudinary integration for project submissions  
✅ **JWT Authentication** - Secure backend authentication  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **Production Ready** - Deployed on Netlify + Render  
✅ **Full Demo Data** - 13 users, 2 teams, pre-populated submissions  

---

## 💡 Pro Tips

- **Keep this reference card open during demo**
- **Have DevTools Network tab visible to show API calls**
- **Explain role-based routing as you switch accounts**
- **Show Cloudinary file upload in action**
- **Point out leaderboard auto-ranking by score**

---

**Good luck with your demo! 🎉**
