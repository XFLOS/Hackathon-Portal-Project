// Generate/download certificates for a user
export const getCertificatesForUser = async (req, res) => {
  try {
    console.log('CERTIFICATE DEBUG req.user:', req.user);
    const userId = req.user.id;
    // Find all teams this user is a member of
    const teamsResult = await db.query(
      `SELECT t.id as team_id, t.name as team_name, t.project_name
       FROM team_members tm
       JOIN teams t ON tm.team_id = t.id
       WHERE tm.user_id = $1`,
      [userId]
    );
    if (teamsResult.rows.length === 0) return res.json([]);

    // For each team, check if there is a submission and at least one evaluation
    const certs = [];
    for (const team of teamsResult.rows) {
      // Get latest submission for the team
      const subRes = await db.query(
        `SELECT s.id as submission_id, s.title, s.file_url, s.submitted_at
         FROM submissions s
         WHERE s.team_id = $1
         ORDER BY s.submitted_at DESC LIMIT 1`,
        [team.team_id]
      );
      if (subRes.rows.length === 0) continue;
      const submission = subRes.rows[0];

      // Get all evaluations for this submission
      const evalRes = await db.query(
        `SELECT e.*, u.full_name as judge_name
         FROM evaluations e
         JOIN users u ON e.judge_id = u.id
         WHERE e.submission_id = $1`,
        [submission.submission_id]
      );
      if (evalRes.rows.length === 0) continue;

      // Calculate average scores
      const avg = { innovation: 0, technical: 0, presentation: 0, total: 0 };
      for (const e of evalRes.rows) {
        avg.innovation += e.innovation_score;
        avg.technical += e.technical_score;
        avg.presentation += e.presentation_score;
      }
      avg.innovation = +(avg.innovation / evalRes.rows.length).toFixed(2);
      avg.technical = +(avg.technical / evalRes.rows.length).toFixed(2);
      avg.presentation = +(avg.presentation / evalRes.rows.length).toFixed(2);
      avg.total = +(avg.innovation + avg.technical + avg.presentation).toFixed(2);

      // Compose certificate data
      certs.push({
        id: `${team.team_id}-${submission.submission_id}`,
        student_name: req.user.full_name,
        team_name: team.team_name,
        project_title: submission.title,
        submission_date: submission.submitted_at,
        avg_innovation: avg.innovation,
        avg_technical: avg.technical,
        avg_presentation: avg.presentation,
        avg_total: avg.total,
        judges: evalRes.rows.map(e => e.judge_name),
        // Optionally, you could generate a PDF and provide a URL here
        url: null // Placeholder for download link if implemented
      });
    }
    res.json(certs);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Error generating certificates' });
  }
};
import db from '../config/database.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT id, full_name, email, role, bio, profile_image, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, profile_image } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           bio = COALESCE($2, bio),
           profile_image = COALESCE($3, profile_image),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, full_name, email, role, bio, profile_image`,
      [full_name, bio, profile_image, userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Get schedule (public endpoint)
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

// Get announcements
export const getAnnouncements = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, u.full_name as author_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.is_active = true
       ORDER BY a.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Error fetching announcements' });
  }
};

// Get leaderboard (public endpoint)
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
       ORDER BY average_score DESC, evaluation_count DESC
       LIMIT 10`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};
