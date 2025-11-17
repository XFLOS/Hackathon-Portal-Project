-- =====================================================================
-- COMPLETE HACKATHON PORTAL DATABASE SETUP
-- Run this entire file in Neon SQL Editor
-- Password for all demo accounts: 12345678
-- =====================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS schedule CASCADE;
DROP TABLE IF EXISTS mentor_assignments CASCADE;
DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================================
-- CREATE USERS TABLE
-- =====================================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'judge', 'coordinator', 'admin')),
  bio TEXT,
  profile_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- CREATE TEAMS TABLE
-- =====================================================================
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  max_members INTEGER DEFAULT 5,
  project_name VARCHAR(255),
  project_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- CREATE TEAM_MEMBERS TABLE
-- =====================================================================
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

-- =====================================================================
-- CREATE SUBMISSIONS TABLE
-- =====================================================================
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  file_type VARCHAR(50),
  github_url VARCHAR(500),
  demo_url VARCHAR(500),
  submitted_by INTEGER REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- CREATE EVALUATIONS TABLE
-- =====================================================================
CREATE TABLE evaluations (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  judge_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  innovation_score INTEGER CHECK (innovation_score BETWEEN 0 AND 10),
  technical_score INTEGER CHECK (technical_score BETWEEN 0 AND 10),
  presentation_score INTEGER CHECK (presentation_score BETWEEN 0 AND 10),
  comments TEXT,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(submission_id, judge_id)
);

-- =====================================================================
-- CREATE ANNOUNCEMENTS TABLE
-- =====================================================================
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- =====================================================================
-- CREATE SCHEDULE TABLE
-- =====================================================================
CREATE TABLE schedule (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- CREATE MENTOR_ASSIGNMENTS TABLE
-- =====================================================================
CREATE TABLE mentor_assignments (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mentor_id, team_id)
);

-- =====================================================================
-- CREATE MENTOR_FEEDBACK TABLE
-- =====================================================================
CREATE TABLE mentor_feedback (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- CREATE INDEXES
-- =====================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_submissions_team ON submissions(team_id);
CREATE INDEX idx_submissions_submitted_by ON submissions(submitted_by);
CREATE INDEX idx_evaluations_submission ON evaluations(submission_id);
CREATE INDEX idx_evaluations_judge ON evaluations(judge_id);
CREATE INDEX idx_mentor_assignments_mentor ON mentor_assignments(mentor_id);
CREATE INDEX idx_mentor_assignments_team ON mentor_assignments(team_id);

-- =====================================================================
-- INSERT DEMO USERS
-- Password for all: 12345678
-- Hash: $2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm
-- =====================================================================
INSERT INTO users (full_name, email, password, role) VALUES
('Demo Student', 'student@demo.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Demo Mentor', 'mentor@demo.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'mentor'),
('Demo Judge', 'judge@demo.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'judge'),
('Demo Coordinator', 'coordinator@demo.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'coordinator');

-- =====================================================================
-- INSERT FAKE TEAM MEMBERS (for demo team)
-- =====================================================================
INSERT INTO users (full_name, email, password, role) VALUES
('Adam Test', 'adam.test@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Sarah Martinez', 'sarah.martinez@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Vikram Lee', 'vikram.lee@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Jessica Chen', 'jessica.chen@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student');

-- Additional fake students for second team
INSERT INTO users (full_name, email, password, role) VALUES
('Michael Johnson', 'michael.j@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Emily Davis', 'emily.d@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Carlos Rodriguez', 'carlos.r@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Aisha Patel', 'aisha.p@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Dmitri Ivanov', 'dmitri.i@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student');

-- =====================================================================
-- CREATE DEMO TEAMS
-- =====================================================================
-- Team Phoenix (created by student@demo.com, ID=1)
INSERT INTO teams (name, description, created_by, project_name, project_description) VALUES
('Team Phoenix', 'Innovative team focused on AI solutions', 1, 'AI Study Assistant', 'An AI-powered study companion that helps students learn more effectively using personalized quizzes and explanations.');

-- Team Dragons (already has submission)
INSERT INTO teams (name, description, created_by, project_name, project_description) VALUES
('Team Dragons', 'Full-stack development team', 5, 'Campus Event Manager', 'A comprehensive platform for managing university events, RSVPs, and notifications.');

-- =====================================================================
-- ADD TEAM MEMBERS
-- =====================================================================
-- Team Phoenix members (team_id=1)
INSERT INTO team_members (team_id, user_id, role) VALUES
(1, 1, 'leader'),    -- Demo Student (leader)
(1, 5, 'member'),    -- Adam Test
(1, 6, 'member'),    -- Sarah Martinez
(1, 7, 'member'),    -- Vikram Lee
(1, 8, 'member');    -- Jessica Chen

-- Team Dragons members (team_id=2)
INSERT INTO team_members (team_id, user_id, role) VALUES
(2, 9, 'leader'),    -- Michael Johnson (leader)
(2, 10, 'member'),   -- Emily Davis
(2, 11, 'member'),   -- Carlos Rodriguez
(2, 12, 'member'),   -- Aisha Patel
(2, 13, 'member');   -- Dmitri Ivanov

-- =====================================================================
-- CREATE SUBMISSIONS
-- =====================================================================
-- Submission from Team Phoenix
INSERT INTO submissions (team_id, title, description, file_url, github_url, demo_url, submitted_by) VALUES
(1, 'AI Study Assistant - Final Submission', 
'Our AI Study Assistant uses natural language processing to create personalized study materials and quizzes based on uploaded course content. Features include: adaptive learning paths, progress tracking, and collaborative study groups.',
'https://res.cloudinary.com/dxjum86lp/raw/upload/demo/team-phoenix-presentation.pdf',
'https://github.com/demo/ai-study-assistant',
'https://ai-study-demo.netlify.app',
1);

-- Submission from Team Dragons
INSERT INTO submissions (team_id, title, description, file_url, github_url, demo_url, submitted_by) VALUES
(2, 'Campus Event Manager - Final Project',
'A full-stack event management platform built with React and Node.js. Key features: event creation, RSVP management, email notifications, QR code check-ins, and analytics dashboard.',
'https://res.cloudinary.com/dxjum86lp/raw/upload/demo/team-dragons-slides.pdf',
'https://github.com/demo/campus-events',
'https://campus-events-demo.herokuapp.com',
9);

-- =====================================================================
-- CREATE JUDGE EVALUATIONS
-- =====================================================================
-- Judge evaluated Team Dragons (submission_id=2)
INSERT INTO evaluations (submission_id, judge_id, innovation_score, technical_score, presentation_score, comments) VALUES
(2, 3, 8, 9, 8, 'Excellent technical implementation. The QR code check-in feature is innovative. Presentation was clear and well-structured. Would benefit from better UI/UX design.');

-- Judge evaluated Team Phoenix (submission_id=1)  
INSERT INTO evaluations (submission_id, judge_id, innovation_score, technical_score, presentation_score, comments) VALUES
(1, 3, 9, 8, 7, 'Highly innovative use of AI for education. Technical implementation is solid but could improve the NLP accuracy. Presentation needs more live demo time.');

-- =====================================================================
-- ASSIGN MENTOR TO TEAMS
-- =====================================================================
INSERT INTO mentor_assignments (mentor_id, team_id) VALUES
(2, 1),  -- Demo Mentor assigned to Team Phoenix
(2, 2);  -- Demo Mentor assigned to Team Dragons

-- =====================================================================
-- CREATE MENTOR FEEDBACK
-- =====================================================================
INSERT INTO mentor_feedback (mentor_id, team_id, feedback) VALUES
(2, 1, 'Great progress on the AI model! Consider adding more training data for better accuracy. The UI is intuitive - nice work. Next steps: implement user authentication and test with real students.'),
(2, 2, 'Impressive full-stack implementation. The RSVP system works flawlessly. Suggestion: add email reminders 24 hours before events. Also, consider adding a mobile app version.');

-- =====================================================================
-- CREATE SCHEDULE EVENTS
-- =====================================================================
INSERT INTO schedule (event_name, description, start_time, end_time, location) VALUES
('Opening Ceremony', 'Welcome address and hackathon kickoff', '2025-11-20 09:00:00', '2025-11-20 10:00:00', 'Main Auditorium'),
('Team Formation', 'Form teams and register your project ideas', '2025-11-20 10:30:00', '2025-11-20 12:00:00', 'Registration Hall'),
('Workshop: Intro to AI/ML', 'Learn the basics of machine learning', '2025-11-20 13:00:00', '2025-11-20 15:00:00', 'Lab 101'),
('Mentor Check-in #1', 'First progress check with mentors', '2025-11-20 16:00:00', '2025-11-20 17:30:00', 'Various Rooms'),
('Midnight Snacks', 'Pizza and energy drinks provided', '2025-11-21 00:00:00', '2025-11-21 01:00:00', 'Cafeteria'),
('Submission Deadline', 'Final project submissions due', '2025-11-21 08:00:00', '2025-11-21 09:00:00', 'Online Portal'),
('Presentations & Judging', 'Teams present to judges (10 min each)', '2025-11-21 10:00:00', '2025-11-21 14:00:00', 'Main Auditorium'),
('Awards Ceremony', 'Winner announcements and prizes', '2025-11-21 15:00:00', '2025-11-21 16:30:00', 'Main Auditorium');

-- =====================================================================
-- CREATE ANNOUNCEMENTS
-- =====================================================================
INSERT INTO announcements (title, content, created_by, is_active) VALUES
('Welcome to the Hackathon!', 'We are excited to have you here. Check the schedule for all events and workshops. Good luck!', 4, true),
('Submission Reminder', 'Only 3 hours left until submission deadline! Make sure to upload all files and test your demo link.', 4, true),
('Mentor Office Hours', 'Mentors are available in rooms 201-205 for one-on-one consultations. No appointment needed!', 4, true);

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================
SELECT '✅ USERS CREATED' as status;
SELECT id, full_name, email, role FROM users ORDER BY id;

SELECT '✅ TEAMS CREATED' as status;
SELECT t.id, t.name, t.project_name, u.full_name as leader 
FROM teams t 
LEFT JOIN users u ON t.created_by = u.id;

SELECT '✅ TEAM MEMBERS' as status;
SELECT t.name as team, u.full_name as member, tm.role
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
JOIN users u ON tm.user_id = u.id
ORDER BY t.id, tm.role DESC;

SELECT '✅ SUBMISSIONS' as status;
SELECT s.id, t.name as team, s.title, u.full_name as submitted_by
FROM submissions s
JOIN teams t ON s.team_id = t.id
JOIN users u ON s.submitted_by = u.id;

SELECT '✅ EVALUATIONS' as status;
SELECT e.id, t.name as team, u.full_name as judge, 
       e.innovation_score, e.technical_score, e.presentation_score
FROM evaluations e
JOIN submissions s ON e.submission_id = s.id
JOIN teams t ON s.team_id = t.id
JOIN users u ON e.judge_id = u.id;

SELECT '✅ SCHEDULE EVENTS' as status;
SELECT event_name, TO_CHAR(start_time, 'Mon DD HH24:MI') as starts, location
FROM schedule
ORDER BY start_time;

SELECT '🎉 DATABASE SETUP COMPLETE!' as message;
SELECT '👉 Demo Password: 12345678' as note;
