import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { GeminiProvider } from './providers/gemini.provider';
import { GenerateContentDto } from './dto/generate-content.dto';
import { AiResponse } from './interfaces/ai-response.interface';
import { DASTAAN_SYSTEM_INSTRUCTION } from './constants/ai.constants';

export interface GenerateContentOptions {
  prompt: string;
  systemInstruction?: string;
  responseMimeType?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly geminiProvider: GeminiProvider) {}

  async generateContent(generateDto: GenerateContentDto | GenerateContentOptions): Promise<AiResponse> {
    const generationId = randomUUID();
    const startTime = Date.now();

    try {
      const providerResult = await this.geminiProvider.generateText({
        prompt: generateDto.prompt,
        systemInstruction: generateDto.systemInstruction || DASTAAN_SYSTEM_INSTRUCTION,
        responseMimeType: generateDto.responseMimeType,
      });

      const durationMs = Date.now() - startTime;
      const totalTokens = providerResult.usage?.totalTokens ?? 'N/A';

      // Safe server-side metadata logging (never logs API keys, JWT secrets, or full raw prompts)
      this.logger.log(
        `AI Generation Success [generationId=${generationId}] [provider=Gemini] [model=${providerResult.model}] [duration=${durationMs}ms] [totalTokens=${totalTokens}]`,
      );

      return {
        success: true,
        generationId,
        content: providerResult.content,
        model: providerResult.model,
        usage: providerResult.usage,
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      this.logger.error(
        `AI Generation Failed [generationId=${generationId}] [duration=${durationMs}ms] Error: ${error.message || 'Unknown'}`,
      );
      throw error;
    }
  }
}
