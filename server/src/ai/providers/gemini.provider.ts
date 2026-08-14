import { Injectable, Logger, InternalServerErrorException, BadGatewayException, GatewayTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { AiProvider, GenerateTextOptions } from '../interfaces/ai-provider.interface';
import { AiProviderResult, TokenUsage } from '../interfaces/ai-response.interface';

@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private ai?: GoogleGenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const model = this.configService.get<string>('GEMINI_MODEL');

    if (!model || !model.trim()) {
      this.logger.error('FATAL: GEMINI_MODEL environment variable is missing!');
      throw new Error('FATAL: GEMINI_MODEL environment variable is missing!');
    }

    this.modelName = model.trim();

    if (apiKey && apiKey.trim()) {
      this.ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      this.logger.log(`Initialized Google Gemini SDK Provider with model: ${this.modelName}`);
    } else {
      this.logger.warn(`GEMINI_API_KEY is empty in server/.env. Add your Google Gemini API key to server/.env to activate AI features.`);
    }
  }

  getModelName(): string {
    return this.modelName;
  }

  async generateText(options: GenerateTextOptions): Promise<AiProviderResult> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || !apiKey.trim()) {
      throw new BadGatewayException(
        'GEMINI_API_KEY is missing or empty in server/.env. Please add your Google Gemini API key to server/.env to use AI generation.',
      );
    }

    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    }

    const { prompt, systemInstruction, timeoutMs = 45000, responseMimeType } = options;
    const maxAttempts = 2; // Initial call + max 1 controlled retry for transient errors

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const reqConfig: any = {};
        if (systemInstruction) {
          reqConfig.systemInstruction = systemInstruction;
        }
        if (responseMimeType) {
          reqConfig.responseMimeType = responseMimeType;
        }

        const response = await this.ai.models.generateContent({
          model: this.modelName,
          contents: prompt,
          config: reqConfig,
        });

        clearTimeout(timeoutId);

        const content = response.text || '';

        if (!content) {
          throw new InternalServerErrorException('Google Gemini provider returned empty response content');
        }

        // Parse token usage metadata where provided by Gemini API
        let usage: TokenUsage | undefined;
        if (response.usageMetadata) {
          const u = response.usageMetadata;
          usage = {
            inputTokens: u.promptTokenCount || 0,
            outputTokens: u.candidatesTokenCount || 0,
            totalTokens: u.totalTokenCount || 0,
          };
        }

        return {
          content,
          model: this.modelName,
          usage,
        };
      } catch (error: any) {
        const status = error.status || error.statusCode;
        const isAbortError = error.name === 'AbortError' || error.message?.includes('aborted');

        // Priority 1: Catch 429 quota / rate limit errors explicitly
        if (
          status === 429 ||
          error.message?.includes('429') ||
          error.message?.includes('quota') ||
          error.message?.includes('RESOURCE_EXHAUSTED')
        ) {
          this.logger.error(`Google Gemini Quota/Rate Limit Exceeded (429): ${error.message}`);
          throw new BadGatewayException(
            'AI service quota exceeded or rate limit reached (HTTP 429). Please check your Google Gemini API billing or quota settings.',
          );
        }

        // Controlled Retry Logic: Retry only on transient 5xx server/network errors
        const isTransientError = isAbortError || (status && status >= 500 && status < 600);

        if (isTransientError && attempt < maxAttempts) {
          this.logger.warn(`Transient Google Gemini API error on attempt ${attempt}. Retrying in 1s...`);
          await new Promise((res) => setTimeout(res, 1000));
          continue;
        }

        this.logger.error(`Google Gemini provider error (Attempt ${attempt}): ${error.message || 'Unknown error'}`);

        if (isAbortError) {
          throw new GatewayTimeoutException('Google Gemini request timed out (45s limit). Please try again.');
        }

        if (error instanceof InternalServerErrorException) {
          throw error;
        }

        throw new BadGatewayException(
          error.message || 'Failed to complete AI request via Google Gemini provider',
        );
      }
    }

    throw new BadGatewayException('Failed to generate AI content after retries');
  }
}
