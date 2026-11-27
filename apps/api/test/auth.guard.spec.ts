import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '../src/auth/auth.guard';
import type { AuthenticatedUser, AuthService } from '../src/auth/auth.service';

function contextFor(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  it('rejects requests without a bearer token or a valid web session', async () => {
    const guard = new AuthGuard({
      getWebSession: async () => null,
    } as unknown as AuthService);
    const request = {
      method: 'GET',
      headers: {},
      header: () => undefined,
    };

    await assert.rejects(guard.canActivate(contextFor(request)), UnauthorizedException);
  });

  it('uses the verified bearer identity and ignores client supplied identity fields', async () => {
    const identity: AuthenticatedUser = {
      id: '2d72bf36-8a74-4ef2-9eaf-2f389b33f9ba',
      email: 'person@example.test',
      source: 'bearer',
      role: 'user',
    };
    const guard = new AuthGuard({
      authenticateBearer: async (token: string) => {
        assert.equal(token, 'verified-token');
        return identity;
      },
    } as unknown as AuthService);
    const request: {
      method: string;
      body: { userId: string };
      headers: Record<string, string>;
      header(name: string): string | undefined;
      user?: AuthenticatedUser;
    } = {
      method: 'POST',
      body: { userId: 'another-account' },
      headers: {},
      header: (name: string) =>
        name === 'authorization' ? 'Bearer verified-token' : undefined,
    };

    assert.equal(await guard.canActivate(contextFor(request)), true);
    assert.equal(request.user, identity);
  });

  it('rejects cookie-authenticated mutations from an untrusted origin', async () => {
    const guard = new AuthGuard({
      getWebSession: async () => ({
        id: '2d72bf36-8a74-4ef2-9eaf-2f389b33f9ba',
        email: null,
        source: 'cookie',
        role: 'user',
      }),
      isAllowedOrigin: () => false,
    } as unknown as AuthService);
    const request = {
      method: 'DELETE',
      headers: { cookie: 'unimovil_session=session' },
      header: (name: string) =>
        name === 'origin' ? 'https://attacker.invalid' : undefined,
    };

    await assert.rejects(guard.canActivate(contextFor(request)), ForbiddenException);
  });
});
