import db from '../config/database.js';

// Create/Update submission
export const createSubmission = async (req, res) => {
  try {
    const { title, description, github_url, demo_url, file_url, file_type } = req.body;
    const userId = req.user.id;

    // Get user's team
    const teamResult = await db.query(
      'SELECT team_id FROM team_members WHERE user_id = $1',
      [userId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'You must be in a team to submit' });
    }

    const teamId = teamResult.rows[0].team_id;

    // Check if team already has a submission
    const existingSubmission = await db.query(
      'SELECT id FROM submissions WHERE team_id = $1',
      [teamId]
    );

    if (existingSubmission.rows.length > 0) {
      // Update existing submission
      const result = await db.query(
        `UPDATE submissions 
         SET title = $1, description = $2, github_url = $3, demo_url = $4, 
             file_url = $5, file_type = $6, updated_at = NOW()
         WHERE team_id = $7 
         RETURNING *`,
        [title, description, github_url, demo_url, file_url, file_type, teamId]
      );

      return res.json({
        message: 'Submission updated successfully',
        submission: result.rows[0]
      });
    }

    // Create new submission
    const result = await db.query(
      `INSERT INTO submissions (team_id, title, description, github_url, demo_url, file_url, file_type, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [teamId, title, description, github_url, demo_url, file_url, file_type, userId]
    );

    res.status(201).json({
      message: 'Submission created successfully',
      submission: result.rows[0]
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ message: 'Error creating submission' });
  }
};

// Get team's submission
export const getMySubmission = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's team
    const teamResult = await db.query(
      'SELECT team_id FROM team_members WHERE user_id = $1',
      [userId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'You are not in a team' });
    }

    const teamId = teamResult.rows[0].team_id;

    const result = await db.query(
      `SELECT s.*, t.name as team_name, u.full_name as submitted_by_name
       FROM submissions s
       JOIN teams t ON s.team_id = t.id
       JOIN users u ON s.submitted_by = u.id
       WHERE s.team_id = $1`,
      [teamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No submission found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get my submission error:', error);
    res.status(500).json({ message: 'Error fetching submission' });
  }
};

// Get all submissions (for judges/coordinators)
export const getAllSubmissions = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, t.name as team_name, u.full_name as submitted_by_name,
       (SELECT COUNT(*) FROM evaluations WHERE submission_id = s.id) as evaluation_count
       FROM submissions s
       JOIN teams t ON s.team_id = t.id
       JOIN users u ON s.submitted_by = u.id
       ORDER BY s.submitted_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

// Get submission by ID
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT s.*, t.name as team_name, u.full_name as submitted_by_name
       FROM submissions s
       JOIN teams t ON s.team_id = t.id
       JOIN users u ON s.submitted_by = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({ message: 'Error fetching submission' });
  }
};
