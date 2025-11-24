import pool from '../config/db.js';

// Upload a resource
export const uploadResource = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { teamId, title, description, fileUrl, fileType, fileSize } = req.body;

    if (!title || !fileUrl) {
      return res.status(400).json({ error: 'Title and file URL are required' });
    }

    const query = `
      INSERT INTO mentor_resources (mentor_id, team_id, title, description, file_url, file_type, file_size, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const values = [mentorId, teamId || null, title, description || null, fileUrl, fileType || null, fileSize || null];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    res.status(500).json({ error: 'Failed to upload resource' });
  }
};

// Get all resources uploaded by the logged-in mentor
export const getMyResources = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const query = `
      SELECT 
        mr.*,
        t.name as team_name
      FROM mentor_resources mr
      LEFT JOIN teams t ON mr.team_id = t.id
      WHERE mr.mentor_id = $1
      ORDER BY mr.created_at DESC
    `;

    const result = await pool.query(query, [mentorId]);

    res.json({
      resources: result.rows
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

// Get resources for a specific team
export const getTeamResources = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify access: mentor must be assigned to team, or student must be member of team
    let accessQuery;
    if (userRole === 'mentor') {
      accessQuery = `
        SELECT 1 FROM mentor_assignments 
        WHERE mentor_id = $1 AND team_id = $2
      `;
    } else if (userRole === 'student') {
      accessQuery = `
        SELECT 1 FROM team_members 
        WHERE user_id = $1 AND team_id = $2
      `;
    } else {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const accessCheck = await pool.query(accessQuery, [userId, teamId]);
    
    if (accessCheck.rows.length === 0 && userRole !== 'admin') {
      return res.status(403).json({ error: 'You do not have access to this team\'s resources' });
    }

    const query = `
      SELECT 
        mr.*,
        u.full_name as mentor_name,
        t.name as team_name
      FROM mentor_resources mr
      LEFT JOIN users u ON mr.mentor_id = u.id
      LEFT JOIN teams t ON mr.team_id = t.id
      WHERE mr.team_id = $1
      ORDER BY mr.created_at DESC
    `;

    const result = await pool.query(query, [teamId]);

    res.json({
      resources: result.rows
    });
  } catch (error) {
    console.error('Error fetching team resources:', error);
    res.status(500).json({ error: 'Failed to fetch team resources' });
  }
};

// Get resources for student's team
export const getStudentResources = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get student's team
    const teamQuery = `
      SELECT team_id FROM team_members WHERE user_id = $1 LIMIT 1
    `;
    const teamResult = await pool.query(teamQuery, [userId]);

    if (teamResult.rows.length === 0) {
      return res.json({ resources: [], message: 'You are not part of any team yet' });
    }

    const teamId = teamResult.rows[0].team_id;

    const query = `
      SELECT 
        mr.*,
        u.full_name as mentor_name,
        t.name as team_name
      FROM mentor_resources mr
      LEFT JOIN users u ON mr.mentor_id = u.id
      LEFT JOIN teams t ON mr.team_id = t.id
      WHERE mr.team_id = $1 OR mr.team_id IS NULL
      ORDER BY mr.created_at DESC
    `;

    const result = await pool.query(query, [teamId]);

    res.json({
      resources: result.rows,
      teamId: teamId
    });
  } catch (error) {
    console.error('Error fetching student resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
};

// Delete a resource
export const deleteResource = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;

    // Verify resource belongs to mentor
    const checkQuery = 'SELECT id FROM mentor_resources WHERE id = $1 AND mentor_id = $2';
    const checkResult = await pool.query(checkQuery, [id, mentorId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found or you do not have permission to delete it' });
    }

    const deleteQuery = 'DELETE FROM mentor_resources WHERE id = $1 RETURNING *';
    const result = await pool.query(deleteQuery, [id]);

    res.json({
      message: 'Resource deleted successfully',
      resource: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};
