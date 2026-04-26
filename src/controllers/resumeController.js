import * as resumeRepository from '../repositories/resumeRepository.js';
import * as usersRepository from '../repositories/usersRepository.js';
import * as aiService from '../services/aiService.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export const createResume = async (req, res, next) => {
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

export const getAllResumes = async (req, res, next) => {
  try {
    const user = await usersRepository.findUserByEmail(req.auth.email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resumes = await resumeRepository.getAllResumes(user.id);
    res.json(resumes);
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await resumeRepository.getResumeById(id);
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    next(error);
  }
};

export const updateResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, target_role, data, latex_code } = req.body;
    await resumeRepository.updateResume(id, title, target_role, data, latex_code);
    res.json({ message: 'Resume updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const evaluateResume = async (req, res, next) => {
  try {
    const { id, data, rawText, target_role: rawTargetRole } = req.body;
    let resumeData = data;
    let resumeId = id;
    let targetRole = rawTargetRole;

    if (rawText) {
      const feedback = await aiService.evaluateResumeAI({ 
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

    const feedback = await aiService.evaluateResumeAI(resumeData);
    
    if (resumeId) {
      await resumeRepository.saveFeedback(resumeId, feedback);
    }

    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

export const generateLatex = async (req, res, next) => {
  try {
    const { data } = req.body;
    const latex = await aiService.generateLatexFromJSON(data);
    res.json({ latex });
  } catch (error) {
    next(error);
  }
};

export const parseLatex = async (req, res, next) => {
  try {
    const { latex_code } = req.body;
    const data = await aiService.parseLatexToJSON(latex_code);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const compileResume = async (req, res, next) => {
  try {
    const { latex_code, title } = req.body;
    if (!latex_code) return res.status(400).json({ message: 'LaTeX code is required' });

    // For now, since pdflatex might not be installed, we return a mock PDF or just the tex file
    // In a real environment, we would save to a temp file, run pdflatex, and stream the result
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const fileName = `${title.replace(/\s+/g, '_')}_${Date.now()}`;
    const texPath = path.join(tempDir, `${fileName}.tex`);
    fs.writeFileSync(texPath, latex_code);

    // MOCK PDF: Just return the tex file for now as 'pdf' to show flow
    // res.setHeader('Content-Type', 'application/pdf');
    // res.download(texPath); 
    
    res.json({ message: 'LaTeX compilation triggered', fileName: `${fileName}.tex`, content: latex_code });
  } catch (error) {
    next(error);
  }
};
