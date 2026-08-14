export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiProviderResult {
  content: string;
  model: string;
  usage?: TokenUsage;
}

export interface AiResponse {
  success: boolean;
  generationId: string;
  content: string;
  model?: string;
  usage?: TokenUsage;
}
