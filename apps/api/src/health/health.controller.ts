import { Controller, Get } from '@nestjs/common';

export interface HealthResponse {
  service: 'trevvos-fieldops-api';
  status: 'ok';
  timestamp: string;
}

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      service: 'trevvos-fieldops-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
