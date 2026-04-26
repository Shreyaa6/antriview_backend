import bcrypt from 'bcryptjs';


class LoginUseCase {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async execute(email, password) {
    const userRow = await this.userRepository.findUserByEmail(email.toLowerCase().trim());
    if (!userRow) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, userRow.password_hash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const token = this.tokenService.signToken(userRow.email);
    return { token, user: userRow };
  }
}

export default LoginUseCase;
