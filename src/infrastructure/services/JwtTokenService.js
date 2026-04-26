import jwt from 'jsonwebtoken';
import { config } from '../../config.js';

class JwtTokenService {
  signToken(email) {
    if (!config.jwtSecret) {
      throw new Error('JWT_SECRET is not configured on server');
    }
    return jwt.sign({ email }, config.jwtSecret, { expiresIn: '7d' });
  }
}

export default JwtTokenService;
