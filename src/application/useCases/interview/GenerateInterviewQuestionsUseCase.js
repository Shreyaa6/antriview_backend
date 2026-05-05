const QUESTION_LIMITS = {
  DSA: 1800,
  'System Design': 300,
  'HR / Behavioral': 120,
  'Case Study': 300,
};

function extractSkillsFromJobDescription(jobDescription = '') {
  const matches = jobDescription.match(/[A-Za-z][A-Za-z0-9+#.-]{2,}/g) ?? [];
  const stopWords = new Set([
    'with',
    'this',
    'that',
    'will',
    'have',
    'from',
    'your',
    'years',
    'experience',
    'candidate',
    'role',
    'and',
    'the',
    'for',
  ]);

  const unique = new Set();
  for (const token of matches) {
    const normalized = token.trim();
    if (stopWords.has(normalized.toLowerCase())) continue;
    if (/^\d+$/.test(normalized)) continue;
    unique.add(normalized);
  }

  return Array.from(unique).slice(0, 8);
}

function question(text, type) {
  return {
    text,
    type,
    limitSec: QUESTION_LIMITS[type] ?? 180,
  };
}

class GenerateInterviewQuestionsUseCase {
  execute({ type, jobDescription, resumeData, personaStyle }) {
    const requestedType = type === 'Mixed' ? 'Mixed' : type;
    const questions = [];
    const jdSkills = extractSkillsFromJobDescription(jobDescription);
    const persona = personaStyle && personaStyle !== 'default' ? personaStyle : 'senior interviewer';

    if (resumeData?.experiences?.length) {
      questions.push(
        question(
          `You mentioned "${resumeData.experiences[0]}". Walk me through the hardest trade-off you handled there.`,
          'HR / Behavioral',
        ),
      );
    }

    if (jdSkills.length) {
      questions.push(
        question(
          `This role seems to emphasize ${jdSkills.slice(0, 3).join(', ')}. Describe a project where you applied one of these skills in a production-like setting.`,
          'HR / Behavioral',
        ),
      );
    }

    if (requestedType === 'DSA' || requestedType === 'Mixed') {
      questions.push(
        question(
          'Given an array of integers, return the maximum subarray sum. Explain your approach, edge cases, and time complexity.',
          'DSA',
        ),
      );
      questions.push(
        question(
          'Design an algorithm to detect whether a linked list has a cycle, then explain how you would prove its correctness.',
          'DSA',
        ),
      );
    }

    if (requestedType === 'System Design' || requestedType === 'Mixed') {
      questions.push(
        question(
          'Design a rate-limited URL shortener for 10M daily users. Discuss storage, scaling, caching, and failure modes.',
          'System Design',
        ),
      );
    }

    if (requestedType === 'HR / Behavioral' || requestedType === 'Mixed') {
      questions.push(
        question(
          `As a ${persona}, I want to understand your collaboration style. Tell me about a time you disagreed with a teammate and how you resolved it.`,
          'HR / Behavioral',
        ),
      );
    }

    if (requestedType === 'Case Study' || requestedType === 'Mixed') {
      questions.push(
        question(
          'A product activation metric dropped 20% after a release. How would you diagnose the issue and decide what to do next?',
          'Case Study',
        ),
      );
    }

    if (!questions.length) {
      questions.push(
        question(
          'Walk me through a technically challenging project you built, including the architecture, trade-offs, and measurable outcome.',
          'HR / Behavioral',
        ),
      );
    }

    return questions.slice(0, 5);
  }
}

export default GenerateInterviewQuestionsUseCase;
