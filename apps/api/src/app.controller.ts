import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { APP_VERSION } from '@nutrirace/shared';

@ApiTags('meta')
@Controller({ version: '1' })
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API metadata.' })
  @ApiOkResponse({ description: 'Name and version of the API.' })
  info(): { name: string; version: string; apiVersion: string } {
    return { name: 'nutrirace-api', version: APP_VERSION, apiVersion: 'v1' };
  }
}
