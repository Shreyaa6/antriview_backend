import User from '../../../domain/entities/User.js';

class AddSessionUseCase {
  constructor(userRepository, sessionRepository) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
  }

  async execute(email, item, track) {
    const rawUser = await this.userRepository.findUserByEmail(email);
    if (!rawUser) throw new Error('User not found');

    const user = new User({
      email: rawUser.email,
      name: rawUser.name,
      stats: rawUser.stats,
      history: rawUser.history,
      streak: rawUser.streak,
      lastSessionDate: rawUser.last_session_date,
      selectedPersona: rawUser.selected_persona,
      resumeData: rawUser.resume_data,
      skills: rawUser.skills,
    });

    // Delegate domain logic to the User entity
    user.addSession(item, track);

    // Save session record via Infrastructure layer
    await this.sessionRepository.createSession({
      userEmail: email,
      role: item.role,
      type: item.type,
      track,
      scoreText: item.score,
      report: item.report
    });

    // Persist mutated User entity
    const updatedRawUser = await this.userRepository.updateUserByEmail(email, {
      history: user.history,
      stats: user.stats,
      skills: user.skills,
      streak: user.streak,
      lastSessionDate: user.lastSessionDate,
    });

    return updatedRawUser;
  }
}

export default AddSessionUseCase;
