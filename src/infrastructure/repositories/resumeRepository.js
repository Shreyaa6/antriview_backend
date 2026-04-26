import { pool } from '../../infrastructure/database/pool.js';

export const createResume = async (userId, title, targetRole, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const resumeRes = await client.query(
      'INSERT INTO resumes (user_id, title, target_role, latex_code) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, targetRole, '']
    );
    const resume = resumeRes.rows[0];

    await client.query(
      'INSERT INTO resume_data (resume_id, data) VALUES ($1, $2)',
      [resume.id, data]
    );

    await client.query('COMMIT');
    return { ...resume, data };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getAllResumes = async (userId) => {
  const res = await pool.query(
    `SELECT r.*, rd.data, rf.feedback as last_feedback, rf.created_at as last_evaluated_at
     FROM resumes r 
     LEFT JOIN resume_data rd ON r.id = rd.resume_id 
     LEFT JOIN (
       SELECT DISTINCT ON (resume_id) resume_id, feedback, created_at 
       FROM resume_feedback 
       ORDER BY resume_id, created_at DESC
     ) rf ON r.id = rf.resume_id
     WHERE r.user_id = $1 
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return res.rows;
};

export const getResumeById = async (id) => {
  const res = await pool.query(
    `SELECT r.*, rd.data, rf.feedback as last_feedback, rf.created_at as last_evaluated_at
     FROM resumes r 
     LEFT JOIN resume_data rd ON r.id = rd.resume_id 
     LEFT JOIN (
       SELECT DISTINCT ON (resume_id) resume_id, feedback, created_at 
       FROM resume_feedback 
       ORDER BY resume_id, created_at DESC
     ) rf ON r.id = rf.resume_id
     WHERE r.id = $1`,
    [id]
  );
  return res.rows[0];
};

export const updateResume = async (id, title, targetRole, data, latexCode) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(
      'UPDATE resumes SET title = $1, target_role = $2, latex_code = $3 WHERE id = $4',
      [title, targetRole, latexCode || '', id]
    );

    await client.query(
      'UPDATE resume_data SET data = $1 WHERE resume_id = $2',
      [data, id]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const saveFeedback = async (resumeId, feedback) => {
  const res = await pool.query(
    'INSERT INTO resume_feedback (resume_id, feedback) VALUES ($1, $2) RETURNING *',
    [resumeId, feedback]
  );
  return res.rows[0];
};
