import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';

@Module({
  controllers: [AiController],
  providers: [AiService, GeminiProvider, OpenAIProvider],
  exports: [AiService, GeminiProvider, OpenAIProvider],
})
export class AiModule {}
