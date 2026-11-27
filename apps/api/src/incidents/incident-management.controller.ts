import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  adminIncidentPublicationSchema,
  adminIncidentQueueQuerySchema,
  adminIncidentTransitionSchema,
  adminIncidentUpdateSchema,
  auditQuerySchema,
} from '@unimovil/contracts';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import type { AuthenticatedUser } from '../auth/auth.service';
import { AuditDeniedTarget, Roles, RolesGuard } from '../auth/roles.guard';
import { IncidentAuditService } from './incident-audit.service';
import { IncidentManagementService } from './incident-management.service';

@ApiTags('Gestión de incidencias y auditoría')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('admin')
export class IncidentManagementController {
  constructor(
    @Inject(IncidentManagementService)
    private readonly management: IncidentManagementService,
    @Inject(IncidentAuditService) private readonly audit: IncidentAuditService,
  ) {}

  @Get('managers')
  @Roles('manager', 'admin')
  @AuditDeniedTarget('incident', undefined, 'managers')
  @ApiOperation({ summary: 'Listar cuentas con rol de gestor para asignación' })
  async listManagers(@Res({ passthrough: true }) response: Response) {
    response.setHeader('Cache-Control', 'no-store');
    return { managers: await this.management.listManagers() };
  }

  @Get('incidents')
  @Roles('manager', 'admin')
  @AuditDeniedTarget('incident', undefined, 'queue')
  @ApiOperation({ summary: 'Consultar la cola de gestión de incidencias' })
  async listQueue(
    @CurrentUser() user: AuthenticatedUser,
    @Query() rawQuery: Record<string, unknown>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const parsed = adminIncidentQueueQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new BadRequestException(
        'Los filtros de consulta de la cola no son válidos.',
      );
    }
    response.setHeader('Cache-Control', 'no-store');
    return this.management.listQueue(user.id, parsed.data);
  }

  @Get('incidents/:incidentId')
  @Roles('manager', 'admin')
  @AuditDeniedTarget('incident', 'incidentId')
  @ApiOperation({ summary: 'Consultar el detalle administrativo de una incidencia' })
  async getDetail(
    @Param('incidentId') incidentId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.setHeader('Cache-Control', 'no-store');
    return { incident: await this.management.getDetail(incidentId) };
  }

  @Patch('incidents/:incidentId')
  @Roles('manager', 'admin')
  @AuditDeniedTarget('incident', 'incidentId')
  @ApiOperation({
    summary: 'Actualizar categoría, prioridad de gestión o asignación',
  })
  async updateIncident(
    @CurrentUser() user: AuthenticatedUser,
    @Param('incidentId') incidentId: string,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const parsed = adminIncidentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues.map((issue) => issue.message));
    }
    response.setHeader('Cache-Control', 'no-store');
    return {
      incident: await this.management.updateIncident(user, incidentId, parsed.data),
    };
  }

  @Post('incidents/:incidentId/transitions')
  @Roles('manager', 'admin')
  @AuditDeniedTarget('incident', 'incidentId')
  @ApiOperation({ summary: 'Aplicar una transición válida de estado operativo' })
  async transitionIncident(
    @CurrentUser() user: AuthenticatedUser,
    @Param('incidentId') incidentId: string,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const parsed = adminIncidentTransitionSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues.map((issue) => issue.message));
    }
    response.setHeader('Cache-Control', 'no-store');
    return {
      incident: await this.management.transitionIncident(user, incidentId, parsed.data),
    };
  }

  @Post('incidents/:incidentId/publication')
  @Roles('manager', 'admin')
  @AuditDeniedTarget('incident', 'incidentId')
  @ApiOperation({
    summary: 'Publicar una proyección segura o retirar la publicación',
  })
  async moderatePublication(
    @CurrentUser() user: AuthenticatedUser,
    @Param('incidentId') incidentId: string,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const parsed = adminIncidentPublicationSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues.map((issue) => issue.message));
    }
    response.setHeader('Cache-Control', 'no-store');
    return {
      incident: await this.management.moderatePublication(
        user,
        incidentId,
        parsed.data,
      ),
    };
  }

  @Get('incidents/:incidentId/attachments/:attachmentId')
  @Roles('manager', 'admin')
  @AuditDeniedTarget('incident_attachment', 'attachmentId')
  @ApiOperation({
    summary: 'Descargar una evidencia privada autorizada con registro de auditoría',
  })
  async getEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('incidentId') incidentId: string,
    @Param('attachmentId') attachmentId: string,
    @Res() response: Response,
  ) {
    const buffer = await this.management.getEvidenceForManagement(
      user,
      incidentId,
      attachmentId,
    );
    response.setHeader('Content-Type', 'image/webp');
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.send(buffer);
  }

  @Get('audit-events')
  @Roles('admin')
  @AuditDeniedTarget('audit_log', undefined, 'audit-events')
  @ApiOperation({
    summary: 'Consultar eventos de auditoría administrativa (solo administrador)',
  })
  async listAuditEvents(
    @Query() rawQuery: Record<string, unknown>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const parsed = auditQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      throw new BadRequestException(
        'Los filtros de consulta de auditoría no son válidos.',
      );
    }
    response.setHeader('Cache-Control', 'no-store');
    return this.audit.listEvents(parsed.data);
  }
}
