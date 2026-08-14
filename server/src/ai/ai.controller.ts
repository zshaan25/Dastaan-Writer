import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateContentDto } from './dto/generate-content.dto';
import { AiResponse } from './interfaces/ai-response.interface';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Direct Gemini AI generation',
    description: 'Generates text content using the configured Gemini AI provider model.',
  })
  @ApiBody({ type: GenerateContentDto })
  @ApiResponse({
    status: 200,
    description: 'Content generated successfully.',
    schema: {
      example: {
        success: true,
        generationId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        content: 'Generated text output...',
        model: 'gemini-2.5-flash',
        usage: {
          promptTokens: 45,
          candidatesTokens: 120,
          totalTokens: 165,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid generation prompt payload.' })
  @ApiResponse({ status: 500, description: 'AI provider generation failure.' })
  async generate(@Body() generateDto: GenerateContentDto): Promise<AiResponse> {
    return this.aiService.generateContent(generateDto);
  }
}
