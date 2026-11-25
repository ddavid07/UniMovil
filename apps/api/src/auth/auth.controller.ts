import {
  Body,
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
});

const passwordUpdateSchema = z.object({
  accessToken: z.string().min(20).max(8192),
  password: z.string().min(12).max(128),
});

function parseCredentials(value: unknown): z.infer<typeof credentialsSchema> {
  const result = credentialsSchema.safeParse(value);
  if (!result.success) throw new BadRequestException('Correo o contraseña no válidos.');
  return result.data;
}

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Crear una cuenta y enviar confirmación de correo' })
  async signUp(@Body() body: unknown) {
    const credentials = parseCredentials(body);
    const result = await this.auth.signUp(credentials.email, credentials.password);
    return {
      confirmationRequired: result.confirmationRequired,
      message:
        'Si los datos permiten crear la cuenta, recibirás instrucciones para confirmar el correo.',
    };
  }

  @Post('sign-in')
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión web con cookie de servidor' })
  async signIn(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const credentials = parseCredentials(body);
    const result = await this.auth.signInWeb(credentials.email, credentials.password);
    response.setHeader('Set-Cookie', result.cookie);
    response.setHeader('Cache-Control', 'no-store');
    return { user: result.user };
  }

  @Get('session')
  @ApiOperation({ summary: 'Consultar la sesión web actual' })
  async session(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.setHeader('Cache-Control', 'no-store');
    try {
      return { user: await this.auth.getWebSession(request.headers.cookie) };
    } catch {
      return { user: null };
    }
  }

  @Post('recovery')
  @HttpCode(202)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  async recovery(@Body() body: unknown) {
    const emailSchema = z.object({ email: z.string().trim().email().max(254) });
    const result = emailSchema.safeParse(body);
    if (result.success) await this.auth.requestRecovery(result.data.email);
    return {
      message:
        'Si la cuenta puede recuperarse, se enviarán instrucciones de recuperación.',
    };
  }

  @Post('update-password')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Actualizar la contraseña con un enlace de recuperación válido',
  })
  async updatePassword(@Body() body: unknown) {
    const result = passwordUpdateSchema.safeParse(body);
    if (!result.success)
      throw new BadRequestException('La contraseña o el enlace no son válidos.');
    await this.auth.updatePassword(result.data.accessToken, result.data.password);
  }

  @Post('sign-out')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cerrar sesión web e invalidar su cookie' })
  async signOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.setHeader(
      'Set-Cookie',
      (await this.auth.logout(request.headers.cookie)) ?? '',
    );
    response.setHeader('Cache-Control', 'no-store');
  }
}
