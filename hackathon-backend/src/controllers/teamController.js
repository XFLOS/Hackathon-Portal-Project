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

    // Get assigned mentor (if any)
    const mentorResult = await db.query(
      `SELECT u.id as mentor_id, u.full_name as mentor_name
         FROM mentor_assignments ma
         JOIN users u ON ma.mentor_id = u.id
        WHERE ma.team_id = $1
        LIMIT 1`,
      [team.id]
    );
    if (mentorResult.rows.length > 0) {
      team.mentor_id = mentorResult.rows[0].mentor_id;
      team.mentor_name = mentorResult.rows[0].mentor_name;
    } else {
      team.mentor_id = null;
      team.mentor_name = null;
    }

    res.json(team);
  } catch (error) {
    console.error('Get my team error:', error);
    res.status(500).json({ message: 'Error fetching team' });
  }
};

// Add member to team
export const addMember = async (req, res) => {
  try {
    const { email, code } = req.body;
    const userId = req.user.id;
    const { id } = req.params; // For /:id/members route

    let teamId = id; // If called via /:id/members

    // If code is provided, this is a "join by code" request
    if (code) {
      // Find team by join code
      const teamResult = await db.query(
        'SELECT id FROM teams WHERE join_code = $1',
        [code]
      );

      if (teamResult.rows.length === 0) {
        return res.status(404).json({ message: 'Invalid join code' });
      }

      teamId = teamResult.rows[0].id;

      // Check if user is already in a team
      const existingMember = await db.query(
        'SELECT * FROM team_members WHERE user_id = $1',
        [userId]
      );

      if (existingMember.rows.length > 0) {
        return res.status(400).json({ message: 'You are already in a team' });
      }

      // Check team size
      const memberCount = await db.query(
        'SELECT COUNT(*) FROM team_members WHERE team_id = $1',
        [teamId]
      );

      if (parseInt(memberCount.rows[0].count) >= 5) {
        return res.status(400).json({ message: 'Team is full (max 5 members)' });
      }

      // Add user as member
      await db.query(
        'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
        [teamId, userId, 'member']
      );

      return res.json({ 
        message: 'Successfully joined the team',
        id: teamId
      });
    }

    // Otherwise, this is "add member by email" (leader only)
    if (!email) {
      return res.status(400).json({ message: 'Email or join code is required' });
    }

    // Get user's team and verify they are the leader
    const teamResult = await db.query(
      `SELECT tm.team_id, tm.role FROM team_members tm WHERE tm.user_id = $1`,
      [userId]
    );

    if (!teamId && teamResult.rows.length === 0) {
      return res.status(404).json({ message: 'You are not in a team' });
    }

    if (!teamId) {
      teamId = teamResult.rows[0].team_id;
    }

    // Verify user is leader (if adding by email)
    const leaderCheck = await db.query(
      'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = $3',
      [teamId, userId, 'leader']
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Only team leaders can add members' });
    }

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

// Leave team (for regular members)
export const leaveTeam = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's team and role
    const memberResult = await db.query(
      'SELECT team_id, role FROM team_members WHERE user_id = $1',
      [userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({ message: 'You are not in a team' });
    }

    const { team_id, role } = memberResult.rows[0];

    if (role === 'leader') {
      return res.status(400).json({ 
        message: 'Team leaders cannot leave. Please delete the team or transfer leadership first.' 
      });
    }

    // Remove member from team
    await db.query(
      'DELETE FROM team_members WHERE user_id = $1',
      [userId]
    );

    res.json({ message: 'Successfully left the team' });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ message: 'Error leaving team' });
  }
};

// Delete team (leader only)
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user is the team leader
    const leaderCheck = await db.query(
      'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = $3',
      [id, userId, 'leader']
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Only team leaders can delete the team' });
    }

    // Delete all team members first (foreign key constraint)
    await db.query('DELETE FROM team_members WHERE team_id = $1', [id]);

    // Delete the team
    await db.query('DELETE FROM teams WHERE id = $1', [id]);

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: 'Error deleting team' });
  }
};

// Update team details (leader only)
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, project_name, project_description } = req.body;
    const userId = req.user.id;

    // Verify user is the team leader
    const leaderCheck = await db.query(
      'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2 AND role = $3',
      [id, userId, 'leader']
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Only team leaders can update team details' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (project_name !== undefined) {
      updates.push(`project_name = $${paramCount++}`);
      values.push(project_name);
    }
    if (project_description !== undefined) {
      updates.push(`project_description = $${paramCount++}`);
      values.push(project_description);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE teams SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await db.query(query, values);

    res.json({
      message: 'Team updated successfully',
      team: result.rows[0]
    });
  } catch (error) {
    console.error('Update team error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Team name already exists' });
    }
    res.status(500).json({ message: 'Error updating team' });
  }
};
