import db from '../config/database.js';

// Get all teams (coordinator view)
export const getAllTeams = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, u.full_name as creator_name,
       (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
       (SELECT COUNT(*) FROM submissions WHERE team_id = t.id) as has_submission
       FROM teams t
       LEFT JOIN users u ON t.created_by = u.id
       ORDER BY t.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all teams error:', error);
    res.status(500).json({ message: 'Error fetching teams' });
  }
};

// Get all submissions (coordinator view)
export const getAllSubmissions = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, t.name as team_name, u.full_name as submitted_by_name,
       (SELECT COUNT(*) FROM evaluations WHERE submission_id = s.id) as evaluation_count,
       (SELECT AVG(innovation_score + technical_score + presentation_score) 
        FROM evaluations WHERE submission_id = s.id) as average_score
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

// Create schedule event
export const createScheduleEvent = async (req, res) => {
  try {
    const { event_name, description, start_time, end_time, location } = req.body;

    // Check for time/location conflict
    const conflict = await db.query(
      `SELECT * FROM schedule WHERE location = $1 AND (
        (start_time, end_time) OVERLAPS ($2::timestamp, $3::timestamp)
      )`,
      [location, start_time, end_time]
    );
    if (conflict.rows.length > 0) {
      return res.status(400).json({ message: 'There is already an event at this location and time.' });
    }

    const result = await db.query(
      `INSERT INTO schedule (event_name, description, start_time, end_time, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [event_name, description, start_time, end_time, location]
    );

    res.status(201).json({
      message: 'Schedule event created successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Create schedule event error:', error);
    res.status(500).json({ message: 'Error creating schedule event' });
  }
};

// Get all schedule events
export const getSchedule = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM schedule ORDER BY start_time'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: 'Error fetching schedule' });
  }
};

// Update schedule event
export const updateScheduleEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { event_name, description, start_time, end_time, location } = req.body;

    // Check for time/location conflict (exclude self)
    const conflict = await db.query(
      `SELECT * FROM schedule WHERE location = $1 AND id != $2 AND (
        (start_time, end_time) OVERLAPS ($3::timestamp, $4::timestamp)
      )`,
      [location, id, start_time, end_time]
    );
    if (conflict.rows.length > 0) {
      return res.status(400).json({ message: 'There is already an event at this location and time.' });
    }

    const result = await db.query(
      `UPDATE schedule 
       SET event_name = $1, description = $2, start_time = $3, end_time = $4, location = $5
       WHERE id = $6
       RETURNING *`,
      [event_name, description, start_time, end_time, location, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule event not found' });
    }

    res.json({
      message: 'Schedule event updated successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Update schedule event error:', error);
    res.status(500).json({ message: 'Error updating schedule event' });
  }
};

// Delete schedule event
export const deleteScheduleEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM schedule WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Schedule event not found' });
    }

    res.json({ message: 'Schedule event deleted successfully' });
  } catch (error) {
    console.error('Delete schedule event error:', error);
    res.status(500).json({ message: 'Error deleting schedule event' });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.id, t.name as team_name, t.project_name,
       COUNT(DISTINCT e.id) as evaluation_count,
       ROUND(AVG(e.innovation_score + e.technical_score + e.presentation_score), 2) as average_score,
       ROUND(AVG(e.innovation_score), 2) as avg_innovation,
       ROUND(AVG(e.technical_score), 2) as avg_technical,
       ROUND(AVG(e.presentation_score), 2) as avg_presentation
       FROM teams t
       LEFT JOIN submissions s ON t.id = s.team_id
       LEFT JOIN evaluations e ON s.id = e.submission_id
       GROUP BY t.id, t.name, t.project_name
       HAVING COUNT(DISTINCT e.id) > 0
       ORDER BY average_score DESC, evaluation_count DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

// Assign mentor to team
export const assignMentor = async (req, res) => {
  try {
    const { mentor_id, team_id } = req.body;

    // Verify mentor role
    const mentorCheck = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [mentor_id]
    );

    if (mentorCheck.rows.length === 0 || mentorCheck.rows[0].role !== 'mentor') {
      return res.status(400).json({ message: 'Invalid mentor ID' });
    }

    // Verify team exists
    const teamCheck = await db.query(
      'SELECT id FROM teams WHERE id = $1',
      [team_id]
    );

    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if already assigned
    const existingAssignment = await db.query(
      'SELECT id FROM mentor_assignments WHERE mentor_id = $1 AND team_id = $2',
      [mentor_id, team_id]
    );

    if (existingAssignment.rows.length > 0) {
      return res.status(400).json({ message: 'Mentor already assigned to this team' });
    }

    // Create assignment
    const result = await db.query(
      'INSERT INTO mentor_assignments (mentor_id, team_id) VALUES ($1, $2) RETURNING *',
      [mentor_id, team_id]
    );

    res.status(201).json({
      message: 'Mentor assigned successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Assign mentor error:', error);
    res.status(500).json({ message: 'Error assigning mentor' });
  }
};

// Get all users (for assignment purposes)
export const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, full_name, email, role FROM users ORDER BY role, full_name'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get statistics
export const getStats = async (req, res) => {
  try {
    // Ensure at least one judge and one mentor exist for demo/testing
    const judgeCheck = await db.query("SELECT id FROM users WHERE role = 'judge' LIMIT 1");
    if (judgeCheck.rows.length === 0) {
      await db.query("INSERT INTO users (full_name, email, password, role) VALUES ('Demo Judge', 'judge@demo.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'judge')");
    }
    const mentorCheck = await db.query("SELECT id FROM users WHERE role = 'mentor' LIMIT 1");
    if (mentorCheck.rows.length === 0) {
      await db.query("INSERT INTO users (full_name, email, password, role) VALUES ('Demo Mentor', 'mentor@demo.com', '$2b$10$iew2XFUt1bGzv43DyybZ5.dcshW.Rsq.VPB1UIaunPhpEM6vmvWJm', 'mentor')");
    }

    const totalTeams = await db.query('SELECT COUNT(*) as count FROM teams');
    const totalSubmissions = await db.query('SELECT COUNT(*) as count FROM submissions');
    const totalUsers = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['student']);
    const totalEvaluations = await db.query('SELECT COUNT(*) as count FROM evaluations');
    const totalJudges = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['judge']);
    const totalMentors = await db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['mentor']);

    // Determine hackathon status: active if current date is within any event named like 'hackathon' in schedule
    const now = new Date();
    const hackathonEvent = await db.query(
      `SELECT * FROM schedule WHERE event_name ILIKE '%hackathon%' AND start_time <= $1 AND end_time >= $1 LIMIT 1`,
      [now]
    );
    const hackathon_status = hackathonEvent.rows.length > 0 ? 'active' : 'inactive';

    // Find the latest submission deadline from schedule
    const submissionDeadlineResult = await db.query(
      `SELECT end_time FROM schedule WHERE (event_name ILIKE '%submission%' OR event_name ILIKE '%deadline%') ORDER BY end_time DESC LIMIT 1`
    );
    const submission_deadline = submissionDeadlineResult.rows.length > 0 ? submissionDeadlineResult.rows[0].end_time : null;

    // Judging status logic
    const judgingEventResult = await db.query(
      `SELECT * FROM schedule WHERE event_name ILIKE '%judging%' ORDER BY start_time ASC LIMIT 1`
    );
    let judging_status = 'not scheduled';
    if (judgingEventResult.rows.length > 0) {
      const judgingEvent = judgingEventResult.rows[0];
      const nowDate = new Date();
      const start = new Date(judgingEvent.start_time);
      const end = new Date(judgingEvent.end_time);
      if (nowDate < start) {
        judging_status = 'upcoming';
      } else if (nowDate >= start && nowDate <= end) {
        judging_status = 'active';
      } else if (nowDate > end) {
        judging_status = 'complete';
      }
    }

    res.json({
      total_teams: parseInt(totalTeams.rows[0].count),
      total_submissions: parseInt(totalSubmissions.rows[0].count),
      total_students: parseInt(totalUsers.rows[0].count),
      total_evaluations: parseInt(totalEvaluations.rows[0].count),
      total_judges: parseInt(totalJudges.rows[0].count),
      total_mentors: parseInt(totalMentors.rows[0].count),
      hackathon_status,
      submission_deadline,
      judging_status
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};
