const FILLER_WORDS = ['um', 'umm', 'uh', 'like', 'you know', 'actually', 'basically', 'literally'];

function clampScore(value) {
  return Math.max(20, Math.min(98, Math.round(value)));
}

function countFillerWords(answer) {
  const lower = answer.toLowerCase();
  return FILLER_WORDS.reduce((sum, word) => {
    return sum + (lower.match(new RegExp(`\\b${word}\\b`, 'g'))?.length ?? 0);
  }, 0);
}

function estimateWpm(answer, elapsedSec) {
  if (!elapsedSec) return 0;
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  return Math.round((words / elapsedSec) * 60);
}

function generateFollowUp(answer) {
  const lower = answer.toLowerCase();
  if (lower.includes('redis')) return 'Why would Redis be the right fit compared with a simpler in-memory cache?';
  if (lower.includes('microservice')) return 'What failure mode would you plan for between those services?';
  if (lower.includes('cache')) return 'How would you handle cache invalidation and stale reads?';
  if (lower.includes('team')) return 'What specific action did you take to influence the team outcome?';
  return 'What trade-off did you consider, and what alternative did you reject?';
}

function generateIdealAnswer(question) {
  const lower = question.toLowerCase();
  if (lower.includes('maximum subarray')) {
    return "Use Kadane's algorithm in O(n) time and O(1) space, tracking the current best ending at each index and the global best. Call out all-negative arrays and empty-input handling.";
  }
  if (lower.includes('linked list') && lower.includes('cycle')) {
    return "Use Floyd's slow and fast pointer technique. If the pointers meet, a cycle exists; if the fast pointer reaches null, there is no cycle. This runs in O(n) time and O(1) space.";
  }
  if (lower.includes('url shortener')) {
    return 'Separate read and write paths, generate compact IDs with collision handling, store URL mappings durably, cache hot links, enforce rate limits, and discuss observability and abuse controls.';
  }
  if (lower.includes('activation metric')) {
    return 'Validate the metric, segment affected users, inspect release diffs and funnels, form hypotheses, roll back or mitigate if needed, and use experiments or logs to confirm root cause.';
  }
  return 'Use a clear structure: context, action, trade-off, measurable impact, and what you would improve next time.';
}

class EvaluateInterviewAnswerUseCase {
  execute({ question, answer, elapsedSec, bodyLanguageScore, finishedInTime }) {
    const safeAnswer = answer?.trim() || 'No answer provided.';
    const fillerWords = countFillerWords(safeAnswer);
    const speakingPaceWpm = estimateWpm(safeAnswer, elapsedSec);
    const concisePenalty = Math.max(0, Math.floor(safeAnswer.length / 450) * 8);
    const fillerPenalty = fillerWords * 3;
    const pacePenalty = speakingPaceWpm > 190 || speakingPaceWpm < 95 ? 8 : 0;
    const timePenalty = finishedInTime ? 0 : 12;
    const emptyPenalty = safeAnswer === 'No answer provided.' ? 30 : 0;

    const base = 85 - concisePenalty - fillerPenalty - pacePenalty - timePenalty - emptyPenalty;
    const confidence = clampScore(base - fillerPenalty + Math.floor((bodyLanguageScore ?? 70) / 10));
    const communication = clampScore(base - 4 + (fillerWords < 3 ? 5 : 0));
    const conciseness = clampScore(92 - concisePenalty - Math.max(0, fillerWords - 2) * 2 - emptyPenalty);
    const score = clampScore(base + (safeAnswer.toLowerCase().includes('complexity') ? 6 : 0));

    return {
      idealAnswer: generateIdealAnswer(question),
      followUp: generateFollowUp(safeAnswer),
      score,
      communication,
      confidence,
      conciseness,
      fillerWords,
      speakingPaceWpm,
    };
  }
}

export default EvaluateInterviewAnswerUseCase;
