import Groq from 'groq-sdk';
import { config } from '../../config.js';

class GroqAIService {
  constructor() {
    this.groq = new Groq({
      apiKey: config.groqApiKey,
    });
  }

  async generateLatex(prompt) {
    const chatCompletion = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
    });
    return chatCompletion.choices[0]?.message?.content;
  }

  async parseLatex(prompt) {
    const chatCompletion = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });
    return chatCompletion.choices[0]?.message?.content;
  }

  async evaluateResume(prompt) {
    const chatCompletion = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
      response_format: { type: 'json_object' },
    });
    return chatCompletion.choices[0]?.message?.content;
  }
}

export default GroqAIService;
