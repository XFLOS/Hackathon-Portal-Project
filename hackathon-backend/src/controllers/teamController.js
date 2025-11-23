import db from '../config/database.js';

// Create a new team
export const createTeam = async (req, res) => {
  try {
    const { name, description, project_name, project_description } = req.body;
    const userId = req.user.id; // From auth middleware

    // Check if user already has a team
    const existingMember = await db.query(
      'SELECT * FROM team_members WHERE user_id = $1',
      [userId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    // Create team
    const teamResult = await db.query(
      `INSERT INTO teams (name, description, created_by, project_name, project_description) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, userId, project_name, project_description]
    );

    const team = teamResult.rows[0];

    // Add creator as team leader
    await db.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [team.id, userId, 'leader']
    );

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Team name already exists' });
    }
    res.status(500).json({ message: 'Error creating team' });
  }
};

// Get user's team
export const getMyTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    // DEBUG: Log the user ID and query
    console.log('=== GET MY TEAM DEBUG ===');
    console.log('req.user:', req.user);
    console.log('userId:', userId);

    const result = await db.query(
      `SELECT t.*, u.full_name as creator_name
       FROM team_members tm
       JOIN teams t ON tm.team_id = t.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE tm.user_id = $1`,
      [userId]
    );

    console.log('Query result rows:', result.rows.length);
    console.log('Query result:', JSON.stringify(result.rows, null, 2));

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'You are not in a team yet' });
    }

    const team = result.rows[0];

    // Get all team members
    const membersResult = await db.query(
      `SELECT u.id, u.full_name, u.email, tm.role, tm.joined_at
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.role DESC, tm.joined_at`,
      [team.id]
    );

    team.members = membersResult.rows;

    res.json(team);
  } catch (error) {
    console.error('Get my team error:', error);
    res.status(500).json({ message: 'Error fetching team' });
  }
};

// Add member to team
export const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    // Get user's team and verify they are the leader
    const teamResult = await db.query(
      `SELECT tm.team_id, tm.role FROM team_members tm WHERE tm.user_id = $1`,
      [userId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'You are not in a team' });
    }

    if (teamResult.rows[0].role !== 'leader') {
      return res.status(403).json({ message: 'Only team leaders can add members' });
    }

    const teamId = teamResult.rows[0].team_id;

    // Check team size
    const memberCount = await db.query(
      'SELECT COUNT(*) FROM team_members WHERE team_id = $1',
      [teamId]
    );

    if (parseInt(memberCount.rows[0].count) >= 5) {
      return res.status(400).json({ message: 'Team is already full (max 5 members)' });
    }

    // Find user by email
    const userResult = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newMemberId = userResult.rows[0].id;

    // Check if user is already in a team
    const existingMember = await db.query(
      'SELECT * FROM team_members WHERE user_id = $1',
      [newMemberId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ message: 'User is already in a team' });
    }

    // Add member
    await db.query(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [teamId, newMemberId, 'member']
    );

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Error adding member' });
  }
};

// Get all teams (for coordinators/mentors/judges)
export const getAllTeams = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, u.full_name as creator_name,
       (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
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

// Get team by ID
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const teamResult = await db.query(
      `SELECT t.*, u.full_name as creator_name
       FROM teams t
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1`,
      [id]
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
      [id]
    );

    team.members = membersResult.rows;

    res.json(team);
  } catch (error) {
    console.error('Get team by ID error:', error);
    res.status(500).json({ message: 'Error fetching team' });
  }
};

// Post team update (for team communication/progress updates)
export const postTeamUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // Verify user is a member of this team
    const memberCheck = await db.query(
      'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You are not a member of this team' });
    }

    // For now, just return success (you can store updates in a team_updates table later)
    res.json({ 
      message: 'Update posted successfully',
      update: {
        team_id: id,
        user_id: userId,
        message,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Post team update error:', error);
    res.status(500).json({ message: 'Error posting team update' });
  }
};
