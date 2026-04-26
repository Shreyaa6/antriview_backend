import Groq from 'groq-sdk';
import { config } from '../config.js';

const groq = new Groq({
  apiKey: config.groqApiKey,
});

export const generateLatexFromJSON = async (structuredData) => {
  const prompt = `
Convert this structured resume JSON into a clean, professional LaTeX resume using a modern template (like 'moderncv' style or similar clean tech style).
Include all sections: General, Experience, Projects, Skills, Education.

Return ONLY valid LaTeX code. No preamble text, no markdown code blocks, just the raw LaTeX content starting with \\documentclass.

JSON Content:
${JSON.stringify(structuredData, null, 2)}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
    });

    let content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error('No content returned from AI');

    // Clean up if AI included markdown blocks
    content = content.replace(/```latex/g, '').replace(/```/g, '').trim();
    
    return content;
  } catch (error) {
    console.error('Groq LaTeX Generation Error:', error);
    throw new Error('Failed to generate LaTeX');
  }
};

export const parseLatexToJSON = async (latexCode) => {
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
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq LaTeX Parse Error:', error);
    throw new Error('Failed to parse LaTeX to JSON');
  }
};

export const evaluateResumeAI = async (resumeData) => {
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
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from AI');
    }

    // Attempt to parse JSON directly
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // Fallback: extract JSON using regex if parsing fails
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw parseError;
    }
  } catch (error) {
    console.error('Groq AI Evaluation Error:', error);
    throw new Error('Failed to evaluate resume with AI');
  }
};
