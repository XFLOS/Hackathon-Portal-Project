import pool from '../config/db.js';

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, teamId, message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const query = `
      INSERT INTO messages (sender_id, receiver_id, team_id, message, created_at, is_read)
      VALUES ($1, $2, $3, $4, NOW(), false)
      RETURNING *
    `;

    const values = [senderId, receiverId || null, teamId || null, message.trim()];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Message sent successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    const query = `
      SELECT 
        m.*,
        sender.full_name as sender_name,
        sender.email as sender_email,
        receiver.full_name as receiver_name,
        receiver.email as receiver_email
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      WHERE 
        (m.sender_id = $1 AND m.receiver_id = $2) OR 
        (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `;

    const result = await pool.query(query, [currentUserId, userId]);

    res.json({
      messages: result.rows
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

// Get all messages for a specific team
export const getTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;

    const query = `
      SELECT 
        m.*,
        sender.full_name as sender_name,
        sender.email as sender_email,
        sender.role as sender_role
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      WHERE m.team_id = $1
      ORDER BY m.created_at ASC
    `;

    const result = await pool.query(query, [teamId]);

    res.json({
      messages: result.rows
    });
  } catch (error) {
    console.error('Error fetching team messages:', error);
    res.status(500).json({ error: 'Failed to fetch team messages' });
  }
};

// Get all conversations for the current user
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    let values;

    if (userRole === 'mentor') {
      // Get all students from assigned teams
      query = `
        SELECT DISTINCT
          u.id,
          u.full_name,
          u.email,
          u.role,
          u.profile_image,
          t.name as team_name,
          t.id as team_id,
          (SELECT COUNT(*) FROM messages 
           WHERE receiver_id = $1 AND sender_id = u.id AND is_read = false) as unread_count,
          (SELECT message FROM messages 
           WHERE (sender_id = $1 AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = $1)
           ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages 
           WHERE (sender_id = $1 AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = $1)
           ORDER BY created_at DESC LIMIT 1) as last_message_time
        FROM users u
        INNER JOIN team_members tm ON u.id = tm.user_id
        INNER JOIN teams t ON tm.team_id = t.id
        WHERE t.id IN (
          SELECT team_id FROM team_mentors WHERE mentor_id = $1
        )
        ORDER BY last_message_time DESC NULLS LAST
      `;
      values = [userId];
    } else if (userRole === 'student') {
      // Get assigned mentors
      query = `
        SELECT DISTINCT
          u.id,
          u.full_name,
          u.email,
          u.role,
          u.profile_image,
          t.name as team_name,
          t.id as team_id,
          (SELECT COUNT(*) FROM messages 
           WHERE receiver_id = $1 AND sender_id = u.id AND is_read = false) as unread_count,
          (SELECT message FROM messages 
           WHERE (sender_id = $1 AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = $1)
           ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages 
           WHERE (sender_id = $1 AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = $1)
           ORDER BY created_at DESC LIMIT 1) as last_message_time
        FROM users u
        INNER JOIN team_mentors tm ON u.id = tm.mentor_id
        INNER JOIN teams t ON tm.team_id = t.id
        WHERE t.id IN (
          SELECT team_id FROM team_members WHERE user_id = $1
        )
        ORDER BY last_message_time DESC NULLS LAST
      `;
      values = [userId];
    } else {
      return res.status(403).json({ error: 'Only students and mentors can access chat' });
    }

    const result = await pool.query(query, values);

    res.json({
      conversations: result.rows
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const query = `
      UPDATE messages
      SET is_read = true
      WHERE id = $1 AND receiver_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [messageId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    res.json({
      message: 'Message marked as read',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};
