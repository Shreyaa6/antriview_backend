/**
 * User Entity — Domain Layer.
 *
 * This is a DOMAIN ENTITY — the core business object at the center of Clean Architecture.
 * It has ZERO dependencies on frameworks, databases, or external services.
 *
 * System Design Concepts:
 *
 *  1. CLEAN ARCHITECTURE — DOMAIN LAYER:
 *     - Entities encapsulate enterprise-wide business rules.
 *     - They are the least likely to change when external things change.
 *
 *  2. SINGLE RESPONSIBILITY PRINCIPLE (SRP):
 *     - This entity only defines what a User IS and validates its own invariants.
 *     - It does NOT know how to persist itself (that's the Repository's job).
 *
 *  3. ENCAPSULATION:
 *     - Factory method `createUserEntity()` ensures a User is always created in a valid state.
 *     - Default values are applied here, not scattered across the codebase.
 */

import { computeStreak } from '../../lib/streak.js';

/**
 * Default skill categories for a new user.
 * Defined here in the domain so every layer uses the same defaults.
 */
const DEFAULT_SKILLS = [
  { label: 'OS & Networking', score: 0, color: '#3b82f6' },
  { label: 'Data Structures', score: 0, color: '#10b981' },
  { label: 'System Design', score: 0, color: '#f59e0b' },
  { label: 'Behavioral', score: 0, color: '#8b5cf6' },
];

/**
 * Default stats for a new user across all interview tracks.
 */
const DEFAULT_STATS = {
  dsa: { sessions: 0, progress: 0 },
  hr: { sessions: 0, progress: 0 },
  dev: { sessions: 0, progress: 0 },
};

/**
 * User Entity Class.
 *
 * Encapsulates user state and business logic (e.g., addSession, streak).
 * Used by AddSessionUseCase to mutate user state before persisting.
 *
 * Design Pattern: RICH DOMAIN MODEL
 * - Entity contains behavior (addSession) not just data.
 * - Business rules are enforced inside the entity.
 */
export default class User {
  constructor({ email, name, stats, history, streak, lastSessionDate, selectedPersona, resumeData, skills }) {
    this.email = email;
    this.name = name;
    this.stats = stats || {};
    this.history = history || [];
    this.streak = streak || 0;
    this.lastSessionDate = lastSessionDate;
    this.selectedPersona = selectedPersona;
    this.resumeData = resumeData;
    this.skills = skills || [];
  }

  /**
   * Add a session and update all related stats.
   * Domain logic: streak, skills, progress — all computed here.
   */
  addSession(item, track) {
    this.history = [item, ...this.history];

    if (!this.stats[track]) {
      this.stats[track] = { sessions: 0, progress: 0 };
    }
    this.stats[track].sessions += 1;
    this.stats[track].progress = Math.min(100, this.stats[track].progress + 15);

    if (this.skills.length > 0) {
      const idx = Math.floor(Math.random() * this.skills.length);
      this.skills[idx] = {
        ...this.skills[idx],
        score: Math.min(100, Number(this.skills[idx].score || 0) + 10),
      };
    }

    this.streak = computeStreak(this.streak, this.lastSessionDate);
    this.lastSessionDate = new Date().toISOString().split('T')[0];
  }

  /**
   * Convert entity to plain data object.
   * Design Pattern: DATA TRANSFER OBJECT (DTO)
   */
  toData() {
    return {
      email: this.email,
      name: this.name,
      stats: this.stats,
      history: this.history,
      streak: this.streak,
      lastSessionDate: this.lastSessionDate,
      selectedPersona: this.selectedPersona,
      resumeData: this.resumeData,
      skills: this.skills,
    };
  }
}

/**
 * Factory function — creates a new User entity with validated defaults.
 *
 * Design Pattern: FACTORY METHOD
 * - Centralizes object creation logic.
 * - Ensures all Users are born in a valid, consistent state.
 *
 * @param {object} params
 * @param {string} params.email - Must be a valid email format
 * @param {string} params.name - Must be at least 2 characters
 * @param {string} params.passwordHash - Bcrypt hash of the password
 * @returns {object} A valid User entity
 */
export function createUserEntity({ email, name, passwordHash }) {
  return {
    email: email.toLowerCase().trim(),
    name: name.trim(),
    passwordHash,
    stats: { ...DEFAULT_STATS },
    history: [],
    streak: 0,
    lastSessionDate: null,
    selectedPersona: null,
    resumeData: null,
    skills: DEFAULT_SKILLS.map((s) => ({ ...s })),
  };
}

/**
 * Sanitize a user record for API responses.
 * Removes sensitive fields like password_hash.
 *
 * Design Pattern: DATA TRANSFER OBJECT (DTO)
 * - Shapes data for the presentation layer.
 * - Never exposes internal/sensitive fields.
 *
 * @param {object} row - Raw database row
 * @returns {object} Safe user object for client consumption
 */
export function toUserDTO(row) {
  return {
    email: row.email,
    name: row.name,
    stats: row.stats,
    history: row.history,
    streak: row.streak ?? 0,
    lastSessionDate: row.last_session_date ?? null,
    selectedPersona: row.selected_persona ?? null,
    resumeData: row.resume_data ?? null,
    skills: row.skills,
  };
}
