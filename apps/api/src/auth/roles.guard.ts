import {
  ForbiddenException,
  Inject,
  Injectable,
  SetMetadata,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuditEntityType, StaffRole } from '@unimovil/contracts';
import type { AuthenticatedRequest } from './auth.guard';
import { IncidentAuditService } from '../incidents/incident-audit.service';

export const ROLES_METADATA_KEY = 'unimovil:required_roles';
export const AUDIT_DENIED_TARGET_KEY = 'unimovil:audit_denied_target';

export interface AuditDeniedTargetMetadata {
  entityType: AuditEntityType;
  paramName?: string;
  fallbackEntityId?: string;
}

export const Roles = (...roles: StaffRole[]) => SetMetadata(ROLES_METADATA_KEY, roles);

export const AuditDeniedTarget = (
  entityType: AuditEntityType,
  paramName?: string,
  fallbackEntityId = 'collection',
) =>
  SetMetadata(AUDIT_DENIED_TARGET_KEY, {
    entityType,
    paramName,
    fallbackEntityId,
  } satisfies AuditDeniedTargetMetadata);

/**
 * Enforces server-assigned roles after AuthGuard and logs rejected authenticated
 * attempts without leaking private payload fields.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(IncidentAuditService) private readonly audit: IncidentAuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<StaffRole[] | undefined>(
      ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException(
        'No tienes permisos suficientes para realizar esta operación.',
      );
    }

    if (requiredRoles.includes(user.role as StaffRole)) {
      return true;
    }

    const target = this.reflector.getAllAndOverride<
      AuditDeniedTargetMetadata | undefined
    >(AUDIT_DENIED_TARGET_KEY, [context.getHandler(), context.getClass()]);
    const paramValue = target?.paramName
      ? (request.params?.[target.paramName] as string | undefined)
      : undefined;
    const entityId = paramValue || target?.fallbackEntityId || 'collection';

    await this.audit.recordRejectedAttempt({
      actorId: user.id,
      actorRole: user.role,
      action: 'access_denied',
      reasonCode: 'FORBIDDEN_ROLE',
      entityType: target?.entityType ?? 'incident',
      entityId,
    });

    throw new ForbiddenException(
      'No tienes permisos suficientes para realizar esta operación.',
    );
  }
}
