import {
  Controller,
  BadRequestException,
  Get,
  Headers,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import type { AuthenticatedUser } from '../auth/auth.service';
import { IncidentsService } from './incidents.service';
import { incidentCategories, incidentStatuses } from '@unimovil/contracts';

@ApiTags('Incidencias')
@Controller('incidents')
export class IncidentsController {
  constructor(@Inject(IncidentsService) private readonly incidents: IncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar incidencias revisadas y publicadas' })
  @ApiQuery({ name: 'category', required: false, enum: incidentCategories })
  @ApiQuery({ name: 'status', required: false, enum: incidentStatuses })
  async listPublic(
    @Query('category') category?: string,
    @Query('status') status?: string,
  ) {
    const filters = z
      .object({
        category: z.enum(incidentCategories).optional(),
        status: z.enum(incidentStatuses).optional(),
      })
      .strict()
      .safeParse({ category, status });
    if (!filters.success)
      throw new BadRequestException('Los filtros de consulta no son válidos.');
    return {
      incidents: await this.incidents.listPublic(
        filters.data.category,
        filters.data.status,
      ),
    };
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      limits: { fileSize: 5 * 1024 * 1024, files: 3 },
    }),
  )
  @ApiOperation({ summary: 'Enviar una incidencia privada con evidencias opcionales' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @UploadedFiles() files: { buffer: Buffer; mimetype: string }[] = [],
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    response.setHeader('Cache-Control', 'no-store');
    return this.incidents.create(
      user.id,
      request.body as {
        category: string;
        description: string;
        perceivedPriority?: string;
        coordinates: string;
      },
      files,
      idempotencyKey,
    );
  }
}

@ApiTags('Incidencias propias')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('me/incidents')
export class OwnIncidentsController {
  constructor(@Inject(IncidentsService) private readonly incidents: IncidentsService) {}

  @Get(':incidentId/attachments/:attachmentId')
  @ApiOperation({ summary: 'Descargar una evidencia privada propia' })
  async getAttachment(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Res() response: Response,
    @Query('incidentId') _ignored?: string,
  ) {
    const { incidentId, attachmentId } = request.params as {
      incidentId: string;
      attachmentId: string;
    };
    const buffer = await this.incidents.getOwnAttachment(
      user.id,
      incidentId,
      attachmentId,
    );
    response.setHeader('Content-Type', 'image/webp');
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.send(buffer);
  }
}
