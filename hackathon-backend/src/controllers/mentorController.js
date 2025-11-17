import db from '../config/database.js';

// Get all teams assigned to mentor
export const getAssignedTeams = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const result = await db.query(
      `SELECT t.*, u.full_name as creator_name,
       (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
       ma.assigned_at
       FROM mentor_assignments ma
       JOIN teams t ON ma.team_id = t.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE ma.mentor_id = $1
       ORDER BY ma.assigned_at DESC`,
      [mentorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get assigned teams error:', error);
    res.status(500).json({ message: 'Error fetching assigned teams' });
  }
};

// Provide feedback to a team
export const provideFeedback = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { feedback } = req.body;
    const mentorId = req.user.id;

    if (!feedback || feedback.trim() === '') {
      return res.status(400).json({ message: 'Feedback cannot be empty' });
    }

    // Verify mentor is assigned to this team
    const assignment = await db.query(
      'SELECT id FROM mentor_assignments WHERE mentor_id = $1 AND team_id = $2',
      [mentorId, teamId]
    );

    if (assignment.rows.length === 0) {
      return res.status(403).json({ message: 'You are not assigned to this team' });
    }

    // Insert feedback
    const result = await db.query(
      `INSERT INTO mentor_feedback (mentor_id, team_id, feedback)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [mentorId, teamId, feedback]
    );

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error('Provide feedback error:', error);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
};

// Get all feedback for a team
export const getTeamFeedback = async (req, res) => {
  try {
    const { teamId } = req.params;
    const mentorId = req.user.id;

    // Verify mentor is assigned to this team
    const assignment = await db.query(
      'SELECT id FROM mentor_assignments WHERE mentor_id = $1 AND team_id = $2',
      [mentorId, teamId]
    );

    if (assignment.rows.length === 0) {
      return res.status(403).json({ message: 'You are not assigned to this team' });
    }

    const result = await db.query(
      `SELECT mf.*, u.full_name as mentor_name
       FROM mentor_feedback mf
       JOIN users u ON mf.mentor_id = u.id
       WHERE mf.team_id = $1
       ORDER BY mf.created_at DESC`,
      [teamId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get team feedback error:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
};

// Get team details with members
export const getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    const mentorId = req.user.id;

    // Verify mentor is assigned to this team
    const assignment = await db.query(
      'SELECT id FROM mentor_assignments WHERE mentor_id = $1 AND team_id = $2',
      [mentorId, teamId]
    );

    if (assignment.rows.length === 0) {
      return res.status(403).json({ message: 'You are not assigned to this team' });
    }

    // Get team details
    const teamResult = await db.query(
      `SELECT t.*, u.full_name as creator_name
       FROM teams t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1`,
      [teamId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const team = teamResult.rows[0];

    // Get team members
    const membersResult = await db.query(
      `SELECT u.id, u.full_name, u.email, tm.role, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.role DESC, tm.joined_at`,
      [teamId]
    );

    team.members = membersResult.rows;

    // Get team submission if exists
    const submissionResult = await db.query(
      'SELECT * FROM submissions WHERE team_id = $1',
      [teamId]
    );

    team.submission = submissionResult.rows[0] || null;

    res.json(team);
  } catch (error) {
    console.error('Get team details error:', error);
    res.status(500).json({ message: 'Error fetching team details' });
  }
};
