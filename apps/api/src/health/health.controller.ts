import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { APP_VERSION, type HealthResponse, type ReadinessResponse } from '@nutrirace/shared';
import type { Response } from 'express';
import { ReadinessService } from './readiness.service';

@ApiTags('health')
@SkipThrottle()
@Controller({ version: '1' })
export class HealthController {
  constructor(private readonly readiness: ReadinessService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness: the process is running and can serve requests.' })
  @ApiOkResponse({ description: 'Process is alive.' })
  health(): HealthResponse {
    return {
      status: 'ok',
      service: 'api',
      version: APP_VERSION,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness: MongoDB and Redis are reachable.' })
  @ApiOkResponse({ description: 'All dependencies are up.' })
  @ApiResponse({ status: 503, description: 'At least one dependency is down.' })
  async ready(@Res({ passthrough: true }) res: Response): Promise<ReadinessResponse> {
    const result = await this.readiness.check();
    if (result.status !== 'ready') res.status(HttpStatus.SERVICE_UNAVAILABLE);
    return result;
  }
}
