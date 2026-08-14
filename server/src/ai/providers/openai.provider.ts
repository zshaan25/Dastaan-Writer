import { Injectable, Logger, InternalServerErrorException, BadGatewayException, GatewayTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiProviderResult, TokenUsage } from '../interfaces/ai-response.interface';
import { AiProvider, GenerateTextOptions } from '../interfaces/ai-provider.interface';

export { GenerateTextOptions };

@Injectable()
export class OpenAIProvider implements AiProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly openai: OpenAI;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');

    this.modelName = model.trim();
    if (apiKey && apiKey.trim()) {
      this.openai = new OpenAI({
        apiKey: apiKey.trim(),
        timeout: 45000,
      });
    } else {
      this.logger.warn('OPENAI_API_KEY is not set. OpenAIProvider remains dormant while Gemini is active.');
    }
  }

  getModelName(): string {
    return this.modelName;
  }

  async generateText(options: GenerateTextOptions): Promise<AiProviderResult> {
    const { prompt, systemInstruction, timeoutMs = 45000 } = options;
    const maxAttempts = 2; // Initial call + max 1 controlled retry for transient errors

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        let response: any;
        const responsesApi = (this.openai as any).responses;

        if (responsesApi && typeof responsesApi.create === 'function') {
          response = await responsesApi.create(
            {
              model: this.modelName,
              input: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt },
              ],
            },
            { signal: controller.signal },
          );
        } else {
          response = await this.openai.chat.completions.create(
            {
              model: this.modelName,
              messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: prompt },
              ],
            },
            { signal: controller.signal },
          );
        }

        clearTimeout(timeoutId);

        // Parse generated content text
        const content =
          response.output_text ||
          response.choices?.[0]?.message?.content ||
          '';

        if (!content) {
          throw new InternalServerErrorException('OpenAI provider returned empty response content');
        }

        // Parse token usage metadata
        let usage: TokenUsage | undefined;
        if (response.usage) {
          const u = response.usage;
          usage = {
            inputTokens: u.input_tokens || u.prompt_tokens || 0,
            outputTokens: u.output_tokens || u.completion_tokens || 0,
            totalTokens: u.total_tokens || 0,
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

        // Translate specific provider status codes BEFORE checking generic timeout aborts
        if (status === 429 || error.message?.includes('429') || error.message?.includes('credits')) {
          this.logger.error(`OpenAI Quota Exceeded (429): ${error.message}`);
          throw new BadGatewayException(
            'AI service quota exceeded or no credits remaining (HTTP 429). Please check your OpenAI billing settings.',
          );
        }

        // Controlled Retry Logic: Retry only on 5xx transient server errors or network timeouts
        const isTransientError = isAbortError || (status && status >= 500 && status < 600);

        if (isTransientError && attempt < maxAttempts) {
          this.logger.warn(`Transient OpenAI API error on attempt ${attempt}. Retrying in 1s...`);
          await new Promise((res) => setTimeout(res, 1000));
          continue;
        }

        // Log exact error for server diagnosis (without exposing API keys)
        this.logger.error(`OpenAI provider error (Attempt ${attempt}): ${error.message || 'Unknown provider error'}`);

        if (isAbortError) {
          throw new GatewayTimeoutException('AI provider request timed out (45s limit). Please try again.');
        }

        if (error instanceof InternalServerErrorException) {
          throw error;
        }

        throw new BadGatewayException(
          error.message || 'Failed to complete AI request via provider',
        );
      }
    }

    throw new BadGatewayException('Failed to generate AI content after retries');
  }
}
