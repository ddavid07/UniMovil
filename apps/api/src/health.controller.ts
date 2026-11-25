import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Salud')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Comprobar que la API responde' })
  health() {
    return { status: 'ok' };
  }
}
