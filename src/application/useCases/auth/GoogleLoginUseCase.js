import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

import { config } from '../../../config.js';

class GoogleLoginUseCase {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async execute(credential) {
    if (!config.googleClientId) {
      throw new Error('Google auth is not configured on server');
    }

    const googleClient = new OAuth2Client(config.googleClientId);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new Error('Invalid Google token payload');
    }

    const email = payload.email.toLowerCase().trim();
    let userRow = await this.userRepository.findUserByEmail(email);

    if (!userRow) {
      const generatedPassword = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(generatedPassword, 10);
      userRow = await this.userRepository.createUser({
        email,
        name: payload.name?.trim() || email.split('@')[0],
        passwordHash,
      });
    }

    const token = this.tokenService.signToken(userRow.email);
    return { token, user: userRow };
  }
}

export default GoogleLoginUseCase;
