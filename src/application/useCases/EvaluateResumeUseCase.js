class EvaluateResumeUseCase {
  constructor(aiService, resumeRepository) {
    this.aiService = aiService;
    this.resumeRepository = resumeRepository; // optional dependency based on flow
  }

  async execute(resumeData, resumeId = null) {
    const { target_role } = resumeData;

    const prompt = `
You are a senior recruiter at a top tech company.

Evaluate this resume for the role: ${target_role}

Analyze ALL sections:
* General (summary clarity)
* Social Links (missing or weak links)
* Education
* Experience (impact, metrics)
* Projects (technical depth, real-world use)
* Skills (relevance to role)
* Certificates
* Co-curricular (leadership, impact)

Rules:
* Be brutally honest
* Do NOT give generic advice
* Highlight missing sections
* Identify lack of metrics or vague descriptions

Return STRICT JSON ONLY:
{
"overall_score": number,
"executive_summary": "A 2-3 sentence overview of the resume quality and role fit.",
"section_feedback": {
"general": { "issues": [], "suggestions": [] },
"socialLinks": { "issues": [], "suggestions": [] },
"education": { "issues": [], "suggestions": [] },
"experience": { "issues": [], "suggestions": [] },
"projects": { "issues": [], "suggestions": [] },
"skills": { "issues": [], "suggestions": [] },
"certificates": { "issues": [], "suggestions": [] },
"coCurricular": { "issues": [], "suggestions": [] }
},
"missing_sections": ["list of section keys that are empty or vital missing info"],
"overall_suggestions": ["high-level strategic advice"],
"roadmap": [
  { "step": "Specific action item", "priority": "high | medium | low", "reason": "Why this matters" }
]
}

Resume Content:
${resumeData.rawText ? resumeData.rawText : JSON.stringify(resumeData, null, 2)}
`;

    try {
      const content = await this.aiService.evaluateResume(prompt);
      if (!content) {
        throw new Error('No content returned from AI');
      }

      let parsedFeedback;
      try {
        parsedFeedback = JSON.parse(content);
      } catch (parseError) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedFeedback = JSON.parse(jsonMatch[0]);
        } else {
          throw parseError;
        }
      }

      if (resumeId && this.resumeRepository) {
        await this.resumeRepository.saveFeedback(resumeId, parsedFeedback);
      }

      return parsedFeedback;
    } catch (error) {
      console.error('AI Evaluation Error:', error);
      throw new Error('Failed to evaluate resume with AI');
    }
  }
}

export default EvaluateResumeUseCase;
