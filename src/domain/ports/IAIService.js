/**
 * IAIService — Port Interface (Domain Layer).
 *
 * Abstraction for AI/LLM capabilities used by the application.
 * Today it's Groq (Llama 3.3 70B), but the interface allows
 * swapping to OpenAI, Anthropic, or any other provider.
 *
 * System Design Concepts:
 *
 *  1. STRATEGY PATTERN:
 *     - The AI provider is a strategy that can be swapped at runtime.
 *     - Use cases call this interface; the concrete strategy is injected.
 *     - Switching from Groq to OpenAI requires ONLY a new implementation
 *       of this port — no use case changes.
 *
 *  2. DEPENDENCY INVERSION PRINCIPLE (DIP):
 *     - EvaluateResumeUseCase depends on IAIService, not on Groq SDK.
 *     - The Groq implementation is injected, not imported.
 *
 *  3. OPEN/CLOSED PRINCIPLE (OCP):
 *     - Open for extension: add a new AI provider by implementing this port.
 *     - Closed for modification: existing use cases don't change.
 *
 * @typedef {object} IAIService
 * @property {function(string): Promise<string>} generateLatex
 *   Generate LaTeX code from a prompt.
 * @property {function(string): Promise<string>} parseLatex
 *   Parse LaTeX into structured JSON.
 * @property {function(string): Promise<string>} evaluateResume
 *   Evaluate a resume and return structured feedback as JSON.
 */

/**
 * Validates that an object implements the IAIService contract.
 *
 * @param {object} service - The AI service implementation to validate
 * @throws {Error} If any required method is missing
 */
export function assertAIService(service) {
  const required = ['generateLatex', 'parseLatex', 'evaluateResume'];
  for (const method of required) {
    if (typeof service[method] !== 'function') {
      throw new Error(
        `IAIService contract violation: missing method "${method}". ` +
        `The service must implement: ${required.join(', ')}`
      );
    }
  }
}
