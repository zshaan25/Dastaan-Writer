import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'System Health Check', description: 'Returns the operational health and readiness status of the Dastaan API server.' })
  @ApiResponse({
    status: 200,
    description: 'System is operational and ready to serve requests.',
    schema: {
      example: {
        status: 'ok',
        service: 'Dastaan API',
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      service: 'Dastaan API',
    };
  }
}
