import GroqAIService from './infrastructure/services/GroqAIService.js';
import LocalFileService from './infrastructure/services/LocalFileService.js';
import JwtTokenService from './infrastructure/services/JwtTokenService.js';
import * as resumeRepositoryRaw from './infrastructure/repositories/resumeRepository.js';
import * as usersRepositoryRaw from './infrastructure/repositories/usersRepository.js';
import SessionRepository from './infrastructure/repositories/sessionRepository.js';

import GenerateLatexUseCase from './application/useCases/GenerateLatexUseCase.js';
import ParseLatexUseCase from './application/useCases/ParseLatexUseCase.js';
import EvaluateResumeUseCase from './application/useCases/EvaluateResumeUseCase.js';
import CompileResumeUseCase from './application/useCases/resume/CompileResumeUseCase.js';

import SignupUseCase from './application/useCases/auth/SignupUseCase.js';
import LoginUseCase from './application/useCases/auth/LoginUseCase.js';
import GoogleLoginUseCase from './application/useCases/auth/GoogleLoginUseCase.js';
import AddSessionUseCase from './application/useCases/sessions/AddSessionUseCase.js';

// 1. Instantiate Infrastructure
const aiService = new GroqAIService();
const fileService = new LocalFileService();
const tokenService = new JwtTokenService();
const sessionRepository = new SessionRepository();

// Note: For simple modules without classes (like existing users/resume repo), we pass them directly.
const usersRepository = usersRepositoryRaw;
const resumeRepository = resumeRepositoryRaw;

// 2. Instantiate Use Cases
const generateLatexUseCase = new GenerateLatexUseCase(aiService);
const parseLatexUseCase = new ParseLatexUseCase(aiService);
const evaluateResumeUseCase = new EvaluateResumeUseCase(aiService, resumeRepository);
const compileResumeUseCase = new CompileResumeUseCase(fileService);

const signupUseCase = new SignupUseCase(usersRepository, tokenService);
const loginUseCase = new LoginUseCase(usersRepository, tokenService);
const googleLoginUseCase = new GoogleLoginUseCase(usersRepository, tokenService);
const addSessionUseCase = new AddSessionUseCase(usersRepository, sessionRepository);

// 3. Export configured dependencies
export const diContainer = {
  infrastructure: {
    aiService,
    fileService,
    tokenService,
    sessionRepository,
    usersRepository,
    resumeRepository
  },
  useCases: {
    generateLatexUseCase,
    parseLatexUseCase,
    evaluateResumeUseCase,
    compileResumeUseCase,
    signupUseCase,
    loginUseCase,
    googleLoginUseCase,
    addSessionUseCase
  }
};
