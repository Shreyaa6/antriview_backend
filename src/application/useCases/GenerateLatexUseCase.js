class GenerateLatexUseCase {
  constructor(aiService) {
    this.aiService = aiService;
  }

  async execute(structuredData) {
    const prompt = `
Convert this structured resume JSON into a clean, professional LaTeX resume using a modern template (like 'moderncv' style or similar clean tech style).
Include all sections: General, Experience, Projects, Skills, Education.

Return ONLY valid LaTeX code. No preamble text, no markdown code blocks, just the raw LaTeX content starting with \\documentclass.

JSON Content:
${JSON.stringify(structuredData, null, 2)}
`;

    try {
      let content = await this.aiService.generateLatex(prompt);
      if (!content) throw new Error('No content returned from AI');

      // Clean up if AI included markdown blocks
      content = content.replace(/```latex/g, '').replace(/```/g, '').trim();
      
      return content;
    } catch (error) {
      console.error('LaTeX Generation Error:', error);
      throw new Error('Failed to generate LaTeX');
    }
  }
}

export default GenerateLatexUseCase;
