import { pool } from '../../infrastructure/database/pool.js';

function toUser(row) {
  return {
    email: row.email,
    name: row.name,
    password: undefined,
    stats: row.stats,
    history: row.history,
    streak: row.streak,
    lastSessionDate: row.last_session_date,
    selectedPersona: row.selected_persona,
    resumeData: row.resume_data ?? undefined,
    skills: row.skills,
  };
}

export async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] ?? null;
}

export async function createUser({ email, name, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (email, name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, name, passwordHash],
  );
  return result.rows[0];
}

export async function updateUserByEmail(email, updates) {
  const existing = await findUserByEmail(email);
  if (!existing) return null;

  const merged = {
    name: updates.name ?? existing.name,
    password_hash: updates.passwordHash ?? existing.password_hash,
    stats: updates.stats ?? existing.stats,
    history: updates.history ?? existing.history,
    streak: updates.streak ?? existing.streak,
    last_session_date: updates.lastSessionDate ?? existing.last_session_date,
    selected_persona: updates.selectedPersona ?? existing.selected_persona,
    resume_data: Object.prototype.hasOwnProperty.call(updates, 'resumeData')
      ? updates.resumeData
      : existing.resume_data,
    skills: updates.skills ?? existing.skills,
  };

  const result = await pool.query(
    `UPDATE users
     SET name = $2,
         password_hash = $3,
         stats = $4::jsonb,
         history = $5::jsonb,
         streak = $6,
         last_session_date = $7,
         selected_persona = $8,
         resume_data = $9::jsonb,
         skills = $10::jsonb,
         updated_at = NOW()
     WHERE email = $1
     RETURNING *`,
    [
      email,
      merged.name,
      merged.password_hash,
      JSON.stringify(merged.stats),
      JSON.stringify(merged.history),
      merged.streak,
      merged.last_session_date,
      merged.selected_persona,
      merged.resume_data ? JSON.stringify(merged.resume_data) : null,
      JSON.stringify(merged.skills),
    ],
  );

  return result.rows[0] ?? null;
}

export function sanitizeUser(row) {
  return toUser(row);
}
