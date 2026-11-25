import {
  createParamDecorator,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type AuthenticatedUser } from './auth.service';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.header('authorization');
    if (authorization?.startsWith('Bearer ')) {
      request.user = await this.auth.authenticateBearer(authorization.slice(7));
      return true;
    }

    const identity = await this.auth.getWebSession(request.headers.cookie);
    if (!identity)
      throw new UnauthorizedException('La sesión ha caducado. Inicia sesión de nuevo.');
    if (
      request.method !== 'GET' &&
      !this.auth.isAllowedOrigin(request.header('origin'))
    ) {
      throw new ForbiddenException('El origen de la solicitud no está autorizado.');
    }
    request.user = identity;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) throw new UnauthorizedException();
    return request.user;
  },
);
