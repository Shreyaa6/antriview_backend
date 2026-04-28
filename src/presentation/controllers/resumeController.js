export const makeResumeController = ({
  generateLatexUseCase,
  parseLatexUseCase,
  evaluateResumeUseCase,
  compileResumeUseCase,
  resumeRepository,
  usersRepository
}) => {


  const createResume = async (req, res, next) => {
  try {
    const { title, target_role, data } = req.body;
    const user = await usersRepository.findUserByEmail(req.auth.email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resume = await resumeRepository.createResume(user.id, title, target_role, data || {});
    res.status(201).json(resume);
  } catch (error) {
    next(error);
  }
};

  const getAllResumes = async (req, res, next) => {
  try {
    const user = await usersRepository.findUserByEmail(req.auth.email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resumes = await resumeRepository.getAllResumes(user.id);
    res.json(resumes);
  } catch (error) {
    next(error);
  }
};

  const getResumeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await resumeRepository.getResumeById(id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    next(error);
  }
};

  const updateResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, target_role, data, latex_code } = req.body;
    await resumeRepository.updateResume(id, title, target_role, data, latex_code);
    res.json({ message: 'Resume updated successfully' });
  } catch (error) {
    next(error);
  }
};

  const evaluateResume = async (req, res, next) => {
  try {
    const { id, data, rawText, target_role: rawTargetRole } = req.body;
    let resumeData = data;
    let resumeId = id;
    let targetRole = rawTargetRole;

    if (rawText) {
      const feedback = await evaluateResumeUseCase.execute({ 
        rawText, 
        target_role: targetRole || 'Software Engineer' 
      });
      return res.json(feedback);
    }

    if (resumeId && !resumeData) {
      const resume = await resumeRepository.getResumeById(resumeId);
      if (!resume) return res.status(404).json({ message: 'Resume not found' });
      resumeData = { ...resume.data, target_role: resume.target_role };
      targetRole = resume.target_role;
    }

    if (!resumeData) {
      return res.status(400).json({ message: 'Resume data or raw text is required' });
    }

    const feedback = await evaluateResumeUseCase.execute(resumeData);
    
    if (resumeId) {
      await resumeRepository.saveFeedback(resumeId, feedback);
    }

    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

  const generateLatex = async (req, res, next) => {
  try {
    const { data } = req.body;
    const latex = await generateLatexUseCase.execute(data);
    res.json({ latex });
  } catch (error) {
    next(error);
  }
};

  const parseLatex = async (req, res, next) => {
  try {
    const { latex_code } = req.body;
    const data = await parseLatexUseCase.execute(latex_code);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

  const compileResume = async (req, res, next) => {
    try {
      const { latex_code, title } = req.body;
      const result = await compileResumeUseCase.execute(latex_code, title);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  const deleteResume = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await resumeRepository.deleteResume(id);
      if (!deleted) return res.status(404).json({ message: 'Resume not found' });
      res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  return {
    createResume,
    getAllResumes,
    getResumeById,
    updateResume,
    evaluateResume,
    generateLatex,
    parseLatex,
    compileResume,
    deleteResume
  };
};
