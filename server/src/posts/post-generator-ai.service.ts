import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PostType, PostTone, PostVersion } from './schemas/post.schema';
import { RefinementAction } from './dto/refine-post.dto';
import { randomUUID } from 'node:crypto';

export interface GeneratedPostContent {
  postType: PostType;
  tone: PostTone;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  mentions: string[];
}

@Injectable()
export class PostGeneratorAiService {
  private readonly logger = new Logger(PostGeneratorAiService.name);

  constructor(private readonly aiService: AiService) {}

  async generateStructuredPost(options: {
    postType?: PostType;
    tone?: PostTone;
    conversationContext?: string;
    profileContext?: any;
    customInstructions?: string;
  }): Promise<GeneratedPostContent> {
    const postType = options.postType || PostType.ACHIEVEMENT;
    const tone = options.tone || PostTone.PROFESSIONAL;

    const systemPrompt = this.buildSystemPrompt(postType, tone);
    const userPrompt = this.buildUserPrompt(options);

    return this.generateAndValidateWithRetry(userPrompt, systemPrompt, postType, tone);
  }

  async refineStructuredPost(options: {
    currentVersion: {
      postType?: PostType;
      tone?: PostTone;
      hook: string;
      body: string;
      cta?: string;
      hashtags: string[];
      mentions: string[];
    };
    action: RefinementAction;
    newTone?: PostTone;
    instructions?: string;
    profileContext?: any;
  }): Promise<GeneratedPostContent> {
    const { currentVersion, action, newTone, instructions, profileContext } = options;
    const targetTone = newTone || currentVersion.tone || PostTone.PROFESSIONAL;
    const postType = currentVersion.postType || PostType.ACHIEVEMENT;

    const systemPrompt = this.buildRefinementSystemPrompt(action, targetTone);
    const userPrompt = `CURRENT WORKING POST:
Hook: ${currentVersion.hook}
Body: ${currentVersion.body}
CTA: ${currentVersion.cta || 'None'}
Hashtags: ${currentVersion.hashtags.join(', ')}
Mentions: ${currentVersion.mentions.join(', ')}

REFINEMENT ACTION: ${action}
${newTone ? `NEW TARGET TONE: ${newTone}` : ''}
${instructions ? `USER INSTRUCTIONS: ${instructions}` : ''}
${profileContext ? `USER PROFILE: ${JSON.stringify(profileContext)}` : ''}

Refine the current working post according to the action. Strictly adhere to Zero Fabrication rules and return valid JSON.`;

    return this.generateAndValidateWithRetry(userPrompt, systemPrompt, postType, targetTone);
  }

  async generateAlternativeVersions(options: {
    currentPost: GeneratedPostContent;
    profileContext?: any;
    conversationContext?: string;
  }): Promise<PostVersion[]> {
    const tonesToGenerate: { label: string; tone: PostTone; promptHint: string }[] = [
      {
        label: 'Professional & Direct',
        tone: PostTone.PROFESSIONAL,
        promptHint: 'Write an executive, polished, and structured version emphasizing outcomes and clear takeaways.',
      },
      {
        label: 'Personal & Authentic',
        tone: PostTone.PERSONAL,
        promptHint: 'Write a candid, warm first-person story focusing on personal learnings, mindset, and honest experience.',
      },
      {
        label: 'Storytelling Narrative',
        tone: PostTone.STORYTELLING,
        promptHint: 'Structure as a narrative arc with a problem, discovery, and insightful conclusion.',
      },
    ];

    const versions: PostVersion[] = [];

    for (const item of tonesToGenerate) {
      try {
        const generated = await this.generateStructuredPost({
          postType: options.currentPost.postType,
          tone: item.tone,
          conversationContext: options.conversationContext,
          profileContext: options.profileContext,
          customInstructions: `${item.promptHint} Base everything strictly on the provided facts without inventing any tools.`,
        });

        versions.push({
          id: randomUUID(),
          label: item.label,
          tone: item.tone,
          hook: generated.hook,
          body: generated.body,
          cta: generated.cta,
          hashtags: generated.hashtags,
          mentions: generated.mentions,
          createdAt: new Date().toISOString(),
        });
      } catch (err: any) {
        this.logger.warn(`Failed to generate alternative version [${item.label}]: ${err.message}`);
      }
    }

    return versions;
  }

  private async generateAndValidateWithRetry(
    userPrompt: string,
    systemPrompt: string,
    postType: PostType,
    tone: PostTone,
  ): Promise<GeneratedPostContent> {
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await this.aiService.generateContent({
        prompt: userPrompt,
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      });

      try {
        const parsed = this.parseAndValidatePostJson(response.content, postType, tone);
        return parsed;
      } catch (err: any) {
        this.logger.warn(`Structured post validation failed on attempt ${attempt}: ${err.message}`);
        if (attempt === maxAttempts) {
          throw new InternalServerErrorException(
            `Failed to generate valid structured post: ${err.message}`,
          );
        }
      }
    }

    throw new InternalServerErrorException('Failed to generate valid structured post');
  }

  private cleanMarkdownMarkers(text: string): string {
    if (!text) return '';
    // Strip raw asterisks (**bold** -> bold, *italic* -> italic) for clean LinkedIn plain text
    return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').trim();
  }

  private parseAndValidatePostJson(
    rawContent: string,
    fallbackType: PostType,
    fallbackTone: PostTone,
  ): GeneratedPostContent {
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

    // Extract first JSON object substring if model wrapped it in prose
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    const obj = JSON.parse(cleaned);

    if (!obj || typeof obj !== 'object') {
      throw new Error('AI output is not a JSON object');
    }

    if (!obj.hook || typeof obj.hook !== 'string' || !obj.hook.trim()) {
      throw new Error('Post missing valid hook');
    }

    if (!obj.body || typeof obj.body !== 'string' || !obj.body.trim()) {
      throw new Error('Post missing valid body');
    }

    // Hashtag Normalization & Strict Count Validation
    const rawTags = Array.isArray(obj.hashtags) ? obj.hashtags : [];
    const normalizedTags: string[] = [];

    for (const tag of rawTags) {
      if (typeof tag === 'string' && tag.trim()) {
        let cleanTag = tag.trim().replace(/[^a-zA-Z0-9#_]/g, '');
        if (!cleanTag.startsWith('#')) {
          cleanTag = `#${cleanTag}`;
        }
        if (cleanTag.length > 2 && !normalizedTags.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
          normalizedTags.push(cleanTag);
        }
      }
    }

    // Fallback default tags if model returned fewer than 5
    if (normalizedTags.length < 5) {
      const topicTag = `#${(obj.postType || fallbackType).toLowerCase().replace(/_/g, '')}`;
      if (!normalizedTags.includes(topicTag)) normalizedTags.push(topicTag);
      if (!normalizedTags.includes('#CareerGrowth')) normalizedTags.push('#CareerGrowth');
      if (!normalizedTags.includes('#TechCommunity')) normalizedTags.push('#TechCommunity');
      if (!normalizedTags.includes('#ProfessionalDevelopment')) normalizedTags.push('#ProfessionalDevelopment');
      if (!normalizedTags.includes('#LearningInPublic')) normalizedTags.push('#LearningInPublic');
    }

    const finalTags = normalizedTags.slice(0, 7);

    // Mention Safety: Only preserve explicitly provided verified mentions
    const rawMentions = Array.isArray(obj.mentions) ? obj.mentions : [];
    const verifiedMentions = rawMentions.filter(
      (m: any) => typeof m === 'string' && m.trim() && (m.startsWith('@') || m.length > 2),
    );

    return {
      postType: Object.values(PostType).includes(obj.postType) ? obj.postType : fallbackType,
      tone: Object.values(PostTone).includes(obj.tone) ? obj.tone : fallbackTone,
      hook: this.cleanMarkdownMarkers(obj.hook),
      body: this.cleanMarkdownMarkers(obj.body),
      cta: typeof obj.cta === 'string' ? this.cleanMarkdownMarkers(obj.cta) : '',
      hashtags: finalTags,
      mentions: verifiedMentions,
    };
  }

  private buildSystemPrompt(postType: PostType, tone: PostTone): string {
    return `You are Dastaan AI, an elite, authentic LinkedIn content creator.

OBJECTIVE:
Craft an authentic, engaging, platform-ready LinkedIn post based STRICTLY and ONLY on verified user context.

CRITICAL ZERO-FABRICATION & FACTUAL GROUNDING RULES:
1. STRICT CONTEXT BOUNDARY: You may ONLY reference technologies, frameworks, libraries, tools, services, databases, platforms, companies, roles, dates, metrics, and achievements explicitly provided in the User Profile Context, Conversation History, or Instructions.
2. ABSOLUTE PROHIBITION ON GUESSING TECH STACKS:
   - If the user says "I completed my AI automation internship" and mentions "Gemini, n8n, MongoDB, Vercel", you MUST NOT mention Next.js, React, Node.js, OpenAI, AWS, Docker, Python, or any other unstated technology.
   - If tech is unspecified, describe the work conceptually (e.g. "building automated workflows", "designing data pipelines") without inventing or guessing any technology name.
3. NO INVENTED METRICS: Do NOT fabricate statistics or metrics (e.g. "increased throughput by 40%") unless explicitly stated by the user.
4. NO CLICHÉS: Never use "I am thrilled to announce...", "I had the humble privilege...", "This incredible journey...", "In today's fast-paced world...", "Game-changer".
5. NO RAW MARKDOWN ASTERISKS: Do not use **bold** or *italic* asterisks in the text. Write clean, natural plain text with well-spaced paragraph breaks suitable for LinkedIn.

HASHTAG POLICY:
- Provide strictly 5 to 7 highly relevant hashtags. Only hashtag topics and tools that actually appear in the post context.

MENTION POLICY:
- If no specific collaborator or company handle was provided, return "mentions": [].

JSON SCHEMA REQUIREMENT:
You MUST return ONLY valid JSON matching this exact structure:
{
  "postType": "${postType}",
  "tone": "${tone}",
  "hook": "Concise, compelling opening line without clichés or asterisks",
  "body": "Multi-paragraph post body explaining the concrete experience, learnings, and insights with clean line breaks",
  "cta": "Natural concluding question or CTA (or empty string)",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "mentions": []
}`;
  }

  private buildRefinementSystemPrompt(action: RefinementAction, targetTone: PostTone): string {
    return `You are Dastaan AI, refining an existing LinkedIn post draft.

REFINEMENT ACTION: ${action}
TARGET TONE: ${targetTone}

REFINEMENT INSTRUCTIONS:
- Apply the requested refinement action directly while PRESERVING all user manual edits, facts, and concrete details.
- ACTION RULES:
  * REGENERATE: Produce a fresh angle on the exact same verified facts.
  * IMPROVE_HOOK: Craft a sharper, more captivating opening line.
  * MAKE_SHORTER: Condense the body, cutting fluff while retaining all key facts.
  * MAKE_MORE_PERSONAL: Infuse authentic first-person voice, personal reflection, and mindset.
  * MAKE_MORE_TECHNICAL: Highlight technical mechanics and implementation specifics provided in context.
  * MAKE_MORE_PROFESSIONAL: Polish tone to be authoritative, clear, and executive.
  * ADD_CTA: Add an engaging concluding question inviting peer discussion.
  * REMOVE_CTA: Remove the CTA field (set "cta": "").
  * IMPROVE_FLOW: Enhance paragraph transitions and readability.
  * SIMPLIFY: Remove jargon and simplify phrasing for high readability.
- ZERO FABRICATION: Do NOT introduce any new technologies, metrics, or companies not present in the current working post or user profile.
- NO MARKDOWN ASTERISKS: No **bold** or *italic* asterisks.
- HASHTAGS: Return 5 to 7 unique relevant hashtags.

RETURN ONLY VALID JSON:
{
  "postType": "ACHIEVEMENT",
  "tone": "${targetTone}",
  "hook": "Refined hook line",
  "body": "Refined body paragraphs",
  "cta": "Refined CTA line (or empty string)",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"],
  "mentions": []
}`;
  }

  private buildUserPrompt(options: any): string {
    const parts: string[] = [];

    if (options.profileContext) {
      parts.push(`AUTHENTIC USER PROFILE CONTEXT:
- Name: ${options.profileContext.name || 'User'}
- Profession: ${options.profileContext.profession || 'Professional'}
- Skills: ${Array.isArray(options.profileContext.skills) ? options.profileContext.skills.join(', ') : 'None'}
- Projects: ${Array.isArray(options.profileContext.projects) ? options.profileContext.projects.join(', ') : 'None'}
- Experience: ${options.profileContext.experience || 'None'}
- Bio: ${options.profileContext.bio || 'None'}`);
    }

    if (options.conversationContext) {
      parts.push(`CONVERSATION CONTEXT & NOTES (SOURCE OF TRUTH):\n${options.conversationContext}`);
    }

    if (options.customInstructions) {
      parts.push(`CUSTOM USER INSTRUCTIONS:\n${options.customInstructions}`);
    }

    return parts.join('\n\n') || 'Generate a professional LinkedIn post based strictly on user context.';
  }
}
