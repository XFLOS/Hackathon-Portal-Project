-- Hackathon Portal Database Schema
-- Run this in your Neon SQL Editor or PostgreSQL client

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'mentor', 'judge', 'coordinator', 'admin')),
  bio TEXT,
  profile_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create teams table
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

-- Create team_members table (junction table)
CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
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
  file_type VARCHAR(50),
  github_url VARCHAR(500),
  demo_url VARCHAR(500),
  submitted_by INTEGER REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create evaluations table (for judges)
CREATE TABLE evaluations (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  judge_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  innovation_score INTEGER CHECK (innovation_score BETWEEN 0 AND 10),
  technical_score INTEGER CHECK (technical_score BETWEEN 0 AND 10),
  design_score INTEGER CHECK (design_score BETWEEN 0 AND 10),
  presentation_score INTEGER CHECK (presentation_score BETWEEN 0 AND 10),
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 10),
  comments TEXT,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(submission_id, judge_id)
);

-- Create announcements table
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Create schedule table
CREATE TABLE schedule (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mentor_assignments table
CREATE TABLE mentor_assignments (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mentor_id, team_id)
);

-- Create surveys table for event feedback
CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  experience INTEGER CHECK (experience BETWEEN 1 AND 5) NOT NULL,
  comments TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
-- Note: Password is hashed with bcrypt
INSERT INTO users (email, password, name, role) VALUES 
('admin@hackathon.com', '$2b$10$rQZ5z3qXJ5qXJ5qXJ5qXJ.qXJ5qXJ5qXJ5qXJ5qXJ5qXJ5qXJ5qXJ', 'Admin User', 'admin');

-- Success message
SELECT 'Database schema created successfully!' as message;
