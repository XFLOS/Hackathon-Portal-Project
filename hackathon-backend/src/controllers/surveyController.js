import db from '../config/database.js';

// POST /surveys
export async function submitSurvey(req, res) {
  try {
    const { experience, comments, user_id } = req.body;
    if (!experience) {
      return res.status(400).json({ message: 'Experience rating is required.' });
    }
    await db.query(
      'INSERT INTO surveys (experience, comments, user_id, submitted_at) VALUES ($1, $2, $3, NOW())',
      [experience, comments || '', user_id || null]
    );
    res.status(201).json({ message: 'Survey submitted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit survey.', error: err.message });
  }
}

// GET /surveys (admin only)
export async function getSurveys(req, res) {
  try {
    // Optionally, check if req.user.role === 'admin'
    const result = await db.query('SELECT * FROM surveys ORDER BY submitted_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch surveys.', error: err.message });
  }
}
