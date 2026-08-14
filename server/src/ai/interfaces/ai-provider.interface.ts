import { AiProviderResult } from './ai-response.interface';

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction: string;
  timeoutMs?: number;
  responseMimeType?: string;
}

export interface AiProvider {
  getModelName(): string;
  generateText(options: GenerateTextOptions): Promise<AiProviderResult>;
}
