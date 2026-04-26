class CompileResumeUseCase {
  constructor(fileService) {
    this.fileService = fileService;
  }

  async execute(latexCode, title) {
    if (!latexCode) {
      throw new Error('LaTeX code is required');
    }

    const fileName = `${title.replace(/\\s+/g, '_')}_${Date.now()}`;
    await this.fileService.saveTempFile(`${fileName}.tex`, latexCode);

    // Mock PDF generation by returning the .tex file metadata
    return {
      message: 'LaTeX compilation triggered',
      fileName: `${fileName}.tex`,
      content: latexCode
    };
  }
}

export default CompileResumeUseCase;
