import bcrypt from 'bcryptjs';


class SignupUseCase {
  constructor(userRepository, tokenService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
  }

  async execute(email, name, password) {
    const existing = await this.userRepository.findUserByEmail(email);
    if (existing) {
      throw new Error('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRow = await this.userRepository.createUser({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
    });

    const token = this.tokenService.signToken(userRow.email);
    return { token, user: userRow };
  }
}

export default SignupUseCase;
