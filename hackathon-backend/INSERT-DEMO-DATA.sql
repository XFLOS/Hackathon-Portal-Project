-- =====================================================================
-- INSERT DEMO DATA ONLY
-- Run this after running the COMPLETE-DATABASE-SETUP.sql
-- Password for all demo accounts: 12345678
-- =====================================================================

-- INSERT DEMO USERS
INSERT INTO users (full_name, email, password, role) VALUES
('Demo Student', 'student@demo.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Demo Mentor', 'mentor@demo.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'mentor'),
('Demo Judge', 'judge@demo.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'judge'),
('Demo Coordinator', 'coordinator@demo.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'coordinator'),
('Adam Test', 'adam.test@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Sarah Martinez', 'sarah.martinez@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Vikram Lee', 'vikram.lee@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Jessica Chen', 'jessica.chen@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Michael Johnson', 'michael.j@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Emily Davis', 'emily.d@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Carlos Rodriguez', 'carlos.r@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Aisha Patel', 'aisha.p@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student'),
('Dmitri Ivanov', 'dmitri.i@fake.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'student');

-- CREATE TEAMS
INSERT INTO teams (name, description, created_by, project_name, project_description) VALUES
('Team Phoenix', 'Innovative team focused on AI solutions', 1, 'AI Study Assistant', 'An AI-powered study companion that helps students learn more effectively using personalized quizzes and explanations.'),
('Team Dragons', 'Full-stack development team', 5, 'Campus Event Manager', 'A comprehensive platform for managing university events, RSVPs, and notifications.');

-- ADD TEAM MEMBERS
INSERT INTO team_members (team_id, user_id, role) VALUES
(1, 1, 'leader'),
(1, 5, 'member'),
(1, 6, 'member'),
(1, 7, 'member'),
(1, 8, 'member'),
(2, 9, 'leader'),
(2, 10, 'member'),
(2, 11, 'member'),
(2, 12, 'member'),
(2, 13, 'member');

-- CREATE SUBMISSIONS
INSERT INTO submissions (team_id, title, description, file_url, github_url, demo_url, submitted_by) VALUES
(1, 'AI Study Assistant - Final Submission', 
'Our AI Study Assistant uses natural language processing to create personalized study materials and quizzes based on uploaded course content.',
'https://res.cloudinary.com/dxjum86lp/raw/upload/demo/team-phoenix-presentation.pdf',
'https://github.com/demo/ai-study-assistant',
'https://ai-study-demo.netlify.app',
1),
(2, 'Campus Event Manager - Final Project',
'A full-stack event management platform built with React and Node.js.',
'https://res.cloudinary.com/dxjum86lp/raw/upload/demo/team-dragons-slides.pdf',
'https://github.com/demo/campus-events',
'https://campus-events-demo.herokuapp.com',
9);

-- CREATE EVALUATIONS
INSERT INTO evaluations (submission_id, judge_id, innovation_score, technical_score, presentation_score, comments) VALUES
(2, 3, 8, 9, 8, 'Excellent technical implementation. The QR code check-in feature is innovative.'),
(1, 3, 9, 8, 7, 'Highly innovative use of AI for education. Technical implementation is solid.');

-- ASSIGN MENTORS
INSERT INTO mentor_assignments (mentor_id, team_id) VALUES
(2, 1),
(2, 2);

-- MENTOR FEEDBACK
INSERT INTO mentor_feedback (mentor_id, team_id, feedback) VALUES
(2, 1, 'Great progress on the AI model! Consider adding more training data for better accuracy.'),
(2, 2, 'Impressive full-stack implementation. The RSVP system works flawlessly.');

-- SCHEDULE EVENTS
INSERT INTO schedule (event_name, description, start_time, end_time, location) VALUES
('Opening Ceremony', 'Welcome address and hackathon kickoff', '2025-11-20 09:00:00', '2025-11-20 10:00:00', 'Main Auditorium'),
('Team Formation', 'Form teams and register your project ideas', '2025-11-20 10:00:00', '2025-11-20 11:00:00', 'Registration Hall'),
('Workshop: Intro to AI/ML', 'Learn the basics of machine learning', '2025-11-20 11:15:00', '2025-11-20 13:15:00', 'Lab 101'),
('Mentor Check-in #1', 'First progress check with mentors', '2025-11-20 13:30:00', '2025-11-20 14:30:00', 'Various Rooms'),
('Midnight Snacks', 'Pizza and energy drinks provided', '2025-11-20 22:00:00', '2025-11-20 23:00:00', 'Cafeteria'),
('Submission Deadline', 'Final project submissions due', '2025-11-21 09:00:00', '2025-11-21 10:00:00', 'Online Portal'),
('Presentations & Judging', 'Teams present to judges (10 min each)', '2025-11-21 10:30:00', '2025-11-21 13:30:00', 'Main Auditorium'),
('Awards Ceremony', 'Winner announcements and prizes', '2025-11-21 14:00:00', '2025-11-21 15:00:00', 'Main Auditorium');

-- ANNOUNCEMENTS
INSERT INTO announcements (title, content, created_by, is_active) VALUES
('Welcome to the Hackathon!', 'We are excited to have you here. Check the schedule for all events and workshops. Good luck!', 4, true),
('Submission Reminder', 'Only 3 hours left until submission deadline! Make sure to upload all files and test your demo link.', 4, true),
('Mentor Office Hours', 'Mentors are available in rooms 201-205 for one-on-one consultations. No appointment needed!', 4, true);

-- Verify
SELECT 'Users created:' as status, COUNT(*) as count FROM users;
SELECT 'Teams created:' as status, COUNT(*) as count FROM teams;
SELECT 'Submissions created:' as status, COUNT(*) as count FROM submissions;
SELECT email, role FROM users WHERE email LIKE '%demo%' ORDER BY role;
