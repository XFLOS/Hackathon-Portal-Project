-- Create mentor_resources table for file uploads
CREATE TABLE IF NOT EXISTS mentor_resources (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mentor_resources_mentor ON mentor_resources(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_resources_team ON mentor_resources(team_id);
CREATE INDEX IF NOT EXISTS idx_mentor_resources_created_at ON mentor_resources(created_at);

-- Add comment
COMMENT ON TABLE mentor_resources IS 'Stores files and resources uploaded by mentors for their teams';
