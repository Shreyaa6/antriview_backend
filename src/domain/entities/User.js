import { computeStreak } from '../../lib/streak.js';

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

  addSession(item, track) {
    // Update history
    this.history = [item, ...this.history];

    // Update stats for the track
    if (!this.stats[track]) {
      this.stats[track] = { sessions: 0, progress: 0 };
    }
    this.stats[track].sessions += 1;
    this.stats[track].progress = Math.min(100, this.stats[track].progress + 15);

    // Randomly update a skill (mock behavior from original code)
    if (this.skills.length > 0) {
      const idx = Math.floor(Math.random() * this.skills.length);
      this.skills[idx] = {
        ...this.skills[idx],
        score: Math.min(100, Number(this.skills[idx].score || 0) + 10),
      };
    }

    // Update streak
    this.streak = computeStreak(this.streak, this.lastSessionDate);
    this.lastSessionDate = new Date().toISOString().split('T')[0];
  }

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
