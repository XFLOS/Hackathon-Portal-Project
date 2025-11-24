import db from '../config/database.js';

// Get all submissions for judge to evaluate
export const getSubmissions = async (req, res) => {
  try {
    const judgeId = req.user.id;

    const result = await db.query(
      `SELECT s.*, t.name as team_name, u.full_name as submitted_by_name,
       e.id as evaluation_id, e.innovation_score, e.technical_score, e.presentation_score, e.comments
       FROM submissions s
       JOIN teams t ON s.team_id = t.id
       JOIN users u ON s.submitted_by = u.id
       LEFT JOIN evaluations e ON s.id = e.submission_id AND e.judge_id = $1
       ORDER BY s.submitted_at DESC`,
      [judgeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

// Evaluate a submission
export const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { innovation_score, technical_score, presentation_score, comments } = req.body;
    const judgeId = req.user.id;

    // Validate scores
    const scores = [innovation_score, technical_score, presentation_score];
    for (const score of scores) {
      if (score < 0 || score > 10) {
        return res.status(400).json({ message: 'Scores must be between 0 and 10' });
      }
    }

    // Check if submission exists
    const submissionCheck = await db.query(
      'SELECT id FROM submissions WHERE id = $1',
      [submissionId]
    );

    if (submissionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if judge already evaluated this submission
    const existingEval = await db.query(
      'SELECT id FROM evaluations WHERE submission_id = $1 AND judge_id = $2',
      [submissionId, judgeId]
    );

    if (existingEval.rows.length > 0) {
      // Update existing evaluation
      const result = await db.query(
        `UPDATE evaluations 
         SET innovation_score = $1, technical_score = $2, presentation_score = $3, 
             comments = $4, evaluated_at = NOW()
         WHERE submission_id = $5 AND judge_id = $6
         RETURNING *`,
        [innovation_score, technical_score, presentation_score, comments, submissionId, judgeId]
      );

      return res.json({
        message: 'Evaluation updated successfully',
        evaluation: result.rows[0]
      });
    }

    // Create new evaluation
    const result = await db.query(
      `INSERT INTO evaluations (submission_id, judge_id, innovation_score, technical_score, presentation_score, comments)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [submissionId, judgeId, innovation_score, technical_score, presentation_score, comments]
    );

    res.status(201).json({
      message: 'Evaluation submitted successfully',
      evaluation: result.rows[0]
    });
  } catch (error) {
    console.error('Evaluate submission error:', error);
    res.status(500).json({ message: 'Error submitting evaluation' });
  }
};

// Get judge's evaluation history
export const getEvaluationHistory = async (req, res) => {
  try {
    const judgeId = req.user.id;
    const page = parseInt(req.query.page || '0', 10); // 0-based page index
    const pageSize = parseInt(req.query.pageSize || '0', 10); // if 0 treat as no pagination

    // If no pagination requested, return legacy array
    if (!pageSize || pageSize < 1) {
      const legacy = await db.query(
        `SELECT e.*, s.title as submission_title, t.name as team_name,
         e.innovation_score + e.technical_score + e.presentation_score as total_score
         FROM evaluations e
         JOIN submissions s ON e.submission_id = s.id
         JOIN teams t ON s.team_id = t.id
         WHERE e.judge_id = $1
         ORDER BY e.evaluated_at DESC`,
        [judgeId]
      );
      return res.json(legacy.rows);
    }

    // Paginated response
    const offset = page * pageSize;
    const itemsResult = await db.query(
      `SELECT e.*, s.title as submission_title, t.name as team_name,
       e.innovation_score + e.technical_score + e.presentation_score as total_score
       FROM evaluations e
       JOIN submissions s ON e.submission_id = s.id
       JOIN teams t ON s.team_id = t.id
       WHERE e.judge_id = $1
       ORDER BY e.evaluated_at DESC
       LIMIT $2 OFFSET $3`,
      [judgeId, pageSize, offset]
    );
    const countResult = await db.query(
      'SELECT COUNT(*)::int AS count FROM evaluations WHERE judge_id = $1',
      [judgeId]
    );
    const total = countResult.rows[0].count;
    const totalPages = Math.ceil(total / pageSize);
    res.json({
      page,
      pageSize,
      total,
      totalPages,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Get evaluation history error:', error);
    res.status(500).json({ message: 'Error fetching evaluation history' });
  }
};

// Get evaluation details for a specific submission
export const getEvaluationBySubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const judgeId = req.user.id;

    const result = await db.query(
      `SELECT e.*, s.title as submission_title, t.name as team_name
       FROM evaluations e
       JOIN submissions s ON e.submission_id = s.id
       JOIN teams t ON s.team_id = t.id
       WHERE e.submission_id = $1 AND e.judge_id = $2`,
      [submissionId, judgeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ message: 'Error fetching evaluation' });
  }
};

// Get teams assigned to a judge with submission/evaluation summary
export const getJudgeAssignments = async (req, res) => {
  try {
    const { judgeId } = req.params;
    const authJudgeId = req.user.id;
    const role = req.user.role;

    // Security: judges can only view their own assignments unless admin/coordinator
    if (parseInt(judgeId, 10) !== authJudgeId && !['admin','coordinator'].includes(role)) {
      return res.status(403).json({ message: 'Not authorized to view other judge assignments' });
    }

    const result = await db.query(
      `SELECT jta.team_id, t.name as team_name,
              s.id as submission_id, s.submitted_at, s.title as submission_title,
              e.id as evaluation_id, e.innovation_score, e.technical_score, e.presentation_score,
              (CASE WHEN e.id IS NOT NULL THEN e.innovation_score + e.technical_score + e.presentation_score ELSE NULL END) as total_score
       FROM judge_team_assignments jta
       JOIN teams t ON jta.team_id = t.id
       LEFT JOIN submissions s ON s.team_id = t.id
       LEFT JOIN evaluations e ON e.submission_id = s.id AND e.judge_id = jta.judge_id
       WHERE jta.judge_id = $1
       ORDER BY t.name ASC`,
      [judgeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get judge assignments error:', error);
    res.status(500).json({ message: 'Error fetching judge assignments' });
  }
};

// Convenience: current authenticated judge assignments without needing judgeId param
export const getMyJudgeAssignments = async (req, res) => {
  try {
    const judgeId = req.user.id;
    const result = await db.query(
      `SELECT jta.team_id, t.name as team_name,
              s.id as submission_id, s.submitted_at, s.title as submission_title,
              e.id as evaluation_id, e.innovation_score, e.technical_score, e.presentation_score,
              (CASE WHEN e.id IS NOT NULL THEN e.innovation_score + e.technical_score + e.presentation_score ELSE NULL END) as total_score
       FROM judge_team_assignments jta
       JOIN teams t ON jta.team_id = t.id
       LEFT JOIN submissions s ON s.team_id = t.id
       LEFT JOIN evaluations e ON e.submission_id = s.id AND e.judge_id = jta.judge_id
       WHERE jta.judge_id = $1
       ORDER BY t.name ASC`,
      [judgeId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get my judge assignments error:', error);
    res.status(500).json({ message: 'Error fetching judge assignments' });
  }
};
