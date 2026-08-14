import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { GeminiProvider } from '../ai/providers/gemini.provider';
import { ConversationDocument, ConversationIntent } from './schemas/conversation.schema';

export interface StructuredAiDecision {
  action: 'ASK_FOLLOW_UP' | 'GENERATE_DRAFT';
  message: string;
  intent?: string;
  postType?: string;
  collectedContext?: Record<string, any>;
}

@Injectable()
export class DastaanConversationAiService {
  private readonly logger = new Logger(DastaanConversationAiService.name);

  constructor(private readonly geminiProvider: GeminiProvider) {}

  async evaluateConversation(
    conversation: ConversationDocument,
    userProfile: any,
    userMessage: string,
  ): Promise<StructuredAiDecision> {
    const systemPrompt = `You are Dastaan AI, an elite context-gathering assistant for LinkedIn posts.

YOUR GOAL:
Guide the user to share authentic, specific details about their achievement, project, learning, or career milestone so a high-quality post can be generated.

STRICT CONTEXT GROUNDING & ZERO-FABRICATION RULES:
1. Never invent or assume any technologies, tools, companies, metrics, dates, or experiences that the user did not explicitly state.
2. Rely on the User Profile (profession, skills, projects) for background context without asking redundant questions.
3. If the user provides a brief idea or achievement (e.g. "I completed my internship"), ask ONE concise follow-up question regarding key tools/technologies used, specific outcomes, or core learnings. Set "action": "ASK_FOLLOW_UP".
4. When the user has provided enough concrete context (e.g., what they did and key tools/outcomes), set "action": "GENERATE_DRAFT" and write a polite, encouraging message notifying them that their draft post is ready in the Post Editor.
5. You MUST return ONLY valid JSON matching this exact structure:
{
  "action": "ASK_FOLLOW_UP" | "GENERATE_DRAFT",
  "message": "Conversational reply to the user",
  "intent": "ACHIEVEMENT" | "PROJECT" | "LEARNING" | "CAREER_UPDATE" | "ANNOUNCEMENT" | "THOUGHT_LEADERSHIP" | "OTHER",
  "postType": "ACHIEVEMENT" | "PROJECT" | "LEARNING" | "CAREER_UPDATE" | "ANNOUNCEMENT" | "THOUGHT_LEADERSHIP",
  "collectedContext": {
    "topic": "summary of achievement/topic",
    "technologies": ["item1", "item2"],
    "learnings": "key takeaways",
    "outcomes": "results"
  }
}`;

    // Format Profile Context
    const profileSummary = userProfile
      ? `User Profile Context:
- Name: ${userProfile.name || 'User'}
- Profession: ${userProfile.profession || 'Not specified'}
- Bio: ${userProfile.bio || 'Not specified'}
- Skills: ${Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : 'Not specified'}
- Experience: ${userProfile.experience || 'Not specified'}
- Projects: ${Array.isArray(userProfile.projects) ? userProfile.projects.join(', ') : 'Not specified'}
- Preferred Tone: ${userProfile.preferredTone || 'Professional'}`
      : 'User Profile Context: Not available';

    // Format Accumulated Conversation Context & History
    const historyText = conversation.messages
      .slice(-10)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const contextText = conversation.collectedContext
      ? `Current Collected Post Context: ${JSON.stringify(conversation.collectedContext)}`
      : '';

    const promptPayload = `${profileSummary}\n\n${contextText}\n\nConversation History:\n${historyText}\n\nLATEST USER MESSAGE:\nUSER: ${userMessage}\n\nRespond strictly with JSON containing 'action', 'message', 'intent', 'postType', and 'collectedContext'.`;

    // Perform structured generation via Gemini native JSON mode
    const providerResult = await this.geminiProvider.generateText({
      prompt: promptPayload,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    return this.parseAndValidateDecision(providerResult.content);
  }

  private parseAndValidateDecision(rawContent: string): StructuredAiDecision {
    try {
      let cleaned = rawContent.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('AI output is not a JSON object');
      }

      if (parsed.action !== 'ASK_FOLLOW_UP' && parsed.action !== 'GENERATE_DRAFT') {
        this.logger.warn(`AI returned invalid action: ${parsed.action}. Defaulting to ASK_FOLLOW_UP.`);
        parsed.action = 'ASK_FOLLOW_UP';
      }

      if (!parsed.message || typeof parsed.message !== 'string') {
        parsed.message = parsed.action === 'GENERATE_DRAFT'
          ? "I've gathered your details and prepared your structured LinkedIn draft in the Post Editor!"
          : 'Could you share a bit more context about the key tools or outcomes?';
      }

      // Sanitize intent
      const validIntents = Object.values(ConversationIntent);
      const intent = validIntents.includes(parsed.intent as ConversationIntent)
        ? parsed.intent
        : ConversationIntent.OTHER;

      return {
        action: parsed.action,
        message: parsed.message,
        intent,
        postType: (parsed.postType || 'ACHIEVEMENT').toUpperCase(),
        collectedContext: typeof parsed.collectedContext === 'object' && parsed.collectedContext !== null
          ? parsed.collectedContext
          : {},
      };
    } catch (error: any) {
      this.logger.error(`Failed to parse AI structured output: ${error.message}. Raw output: ${rawContent}`);
      throw new InternalServerErrorException('AI assistant returned malformed response structure. Please try again.');
    }
  }
}
