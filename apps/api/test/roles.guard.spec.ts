import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { AccountRole, AuditEntityType, StaffRole } from '@unimovil/contracts';
import {
  AUDIT_DENIED_TARGET_KEY,
  ROLES_METADATA_KEY,
  RolesGuard,
} from '../src/auth/roles.guard';
import type { AuthenticatedUser } from '../src/auth/auth.service';
import type { IncidentAuditService } from '../src/incidents/incident-audit.service';

function makeContext(user?: AuthenticatedUser, params: Record<string, string> = {}) {
  const handler = () => undefined;
  class DummyController {}
  return {
    getHandler: () => handler,
    getClass: () => DummyController,
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as unknown as ExecutionContext;
}

function makeGuard(
  requiredRoles: StaffRole[] | undefined,
  auditTarget?: { entityType: AuditEntityType; paramName?: string; fallbackEntityId?: string },
) {
  const recorded: unknown[] = [];
  const reflector = {
    getAllAndOverride: (key: string) => {
      if (key === ROLES_METADATA_KEY) return requiredRoles;
      if (key === AUDIT_DENIED_TARGET_KEY) return auditTarget;
      return undefined;
    },
  } as unknown as Reflector;
  const audit = {
    recordRejectedAttempt: async (entry: unknown) => {
      recorded.push(entry);
    },
  } as unknown as IncidentAuditService;
  return { guard: new RolesGuard(reflector, audit), recorded };
}

function userWithRole(role: AccountRole): AuthenticatedUser {
  return {
    id: '2d72bf36-8a74-4ef2-9eaf-2f389b33f9ba',
    email: null,
    source: 'cookie',
    role,
  };
}

describe('RolesGuard', () => {
  it('denies unauthenticated requests when roles are required', async () => {
    const { guard, recorded } = makeGuard(['manager', 'admin']);
    await assert.rejects(guard.canActivate(makeContext(undefined)), ForbiddenException);
    assert.equal(recorded.length, 0);
  });

  it('denies ordinary users and records an access_denied audit attempt', async () => {
    const { guard, recorded } = makeGuard(['manager', 'admin'], {
      entityType: 'incident',
      paramName: 'incidentId',
    });
    const incidentId = '11111111-1111-4111-8111-111111111111';

    await assert.rejects(
      guard.canActivate(makeContext(userWithRole('user'), { incidentId })),
      ForbiddenException,
    );
    assert.equal(recorded.length, 1);
    assert.deepEqual(recorded[0], {
      actorId: '2d72bf36-8a74-4ef2-9eaf-2f389b33f9ba',
      actorRole: 'user',
      action: 'access_denied',
      reasonCode: 'FORBIDDEN_ROLE',
      entityType: 'incident',
      entityId: incidentId,
    });
  });

  it('denies managers from admin-only endpoints such as audit logs', async () => {
    const { guard, recorded } = makeGuard(['admin'], {
      entityType: 'audit_log',
      fallbackEntityId: 'audit-events',
    });

    await assert.rejects(
      guard.canActivate(makeContext(userWithRole('manager'))),
      ForbiddenException,
    );
    assert.equal(recorded.length, 1);
    assert.deepEqual(recorded[0], {
      actorId: '2d72bf36-8a74-4ef2-9eaf-2f389b33f9ba',
      actorRole: 'manager',
      action: 'access_denied',
      reasonCode: 'FORBIDDEN_ROLE',
      entityType: 'audit_log',
      entityId: 'audit-events',
    });
  });

  it('allows managers and admins according to server-assigned roles', async () => {
    const managerGuard = makeGuard(['manager', 'admin']);
    assert.equal(
      await managerGuard.guard.canActivate(makeContext(userWithRole('manager'))),
      true,
    );
    assert.equal(managerGuard.recorded.length, 0);

    const adminGuard = makeGuard(['admin']);
    assert.equal(
      await adminGuard.guard.canActivate(makeContext(userWithRole('admin'))),
      true,
    );
    assert.equal(adminGuard.recorded.length, 0);
  });
});
