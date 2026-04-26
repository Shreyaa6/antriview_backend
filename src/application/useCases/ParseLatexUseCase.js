class ParseLatexUseCase {
  constructor(aiService) {
    this.aiService = aiService;
  }

  async execute(latexCode) {
    const prompt = `
You are an expert LaTeX parser. Extract the structured information from the provided LaTeX resume code and return it as a CLEAN JSON object.
Follow this EXACT schema:
{
  "general": { "name": "...", "email": "...", "phone": "...", "summary": "..." },
  "socialLinks": { "github": "...", "linkedin": "...", "portfolio": "..." },
  "education": [{ "institution": "...", "degree": "...", "field": "...", "end_date": "..." }],
  "experience": [{ "company": "...", "role": "...", "location": "...", "start_date": "...", "end_date": "...", "description": "..." }],
  "projects": [{ "name": "...", "description": "...", "technologies": ["...", "..."] }],
  "skills": [{ "category": "...", "items": ["...", "..."] }]
}

Return ONLY the JSON. No explanations.

LaTeX Code:
${latexCode}
`;

    try {
      const content = await this.aiService.parseLatex(prompt);
      return JSON.parse(content);
    } catch (error) {
      console.error('LaTeX Parse Error:', error);
      throw new Error('Failed to parse LaTeX to JSON');
    }
  }
}

export default ParseLatexUseCase;
