import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { favoriteSchema, profilePatchSchema } from '@unimovil/contracts';
import { AuthGuard, CurrentUser } from '../auth/auth.guard';
import { AuthService, type AuthenticatedUser } from '../auth/auth.service';
import { DatabaseService } from '../database/database.service';
import { IncidentsService } from '../incidents/incidents.service';

@ApiTags('Cuenta')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('me')
export class AccountController {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(IncidentsService) private readonly incidents: IncidentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Consultar el perfil propio' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.database.withRole('authenticated', user.id, (client) =>
      client.query(
        `SELECT relationship, created_at, updated_at
         FROM unimovil.profiles WHERE user_id = $1`,
        [user.id],
      ),
    );
    const profile = result.rows[0];
    if (!profile) throw new NotFoundException('No se encontró el perfil.');
    return { id: user.id, email: user.email, role: user.role, ...profile };
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar los datos permitidos del perfil propio' })
  async updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    const parsed = profilePatchSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException('Los datos del perfil no son válidos.');
    const result = await this.database.withRole('authenticated', user.id, (client) =>
      client.query(
        `UPDATE unimovil.profiles
         SET relationship = $2, updated_at = now()
         WHERE user_id = $1
         RETURNING relationship, created_at, updated_at`,
        [user.id, parsed.data.relationship],
      ),
    );
    if (!result.rows[0]) throw new NotFoundException('No se encontró el perfil.');
    return { id: user.id, ...result.rows[0] };
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Listar favoritos privados' })
  async listFavorites(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.database.withRole('authenticated', user.id, (client) =>
      client.query(
        `SELECT id, resource_type AS "resourceType", resource_id AS "resourceId", created_at AS "createdAt"
         FROM unimovil.favorites WHERE user_id = $1 ORDER BY created_at DESC, id`,
        [user.id],
      ),
    );
    return { favorites: result.rows };
  }

  @Post('favorites')
  @ApiOperation({ summary: 'Guardar un favorito privado' })
  async addFavorite(@CurrentUser() user: AuthenticatedUser, @Body() body: unknown) {
    const parsed = favoriteSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException('El favorito no es válido.');
    const favorite = await this.database.withRole(
      'authenticated',
      user.id,
      async (client) => {
        const inserted = await client.query(
          `INSERT INTO unimovil.favorites (user_id, resource_type, resource_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, resource_type, resource_id) DO NOTHING
         RETURNING id, resource_type AS "resourceType", resource_id AS "resourceId", created_at AS "createdAt"`,
          [user.id, parsed.data.resourceType, parsed.data.resourceId],
        );
        if (inserted.rows[0]) return inserted.rows[0];
        const existing = await client.query(
          `SELECT id, resource_type AS "resourceType", resource_id AS "resourceId", created_at AS "createdAt"
         FROM unimovil.favorites WHERE user_id = $1 AND resource_type = $2 AND resource_id = $3`,
          [user.id, parsed.data.resourceType, parsed.data.resourceId],
        );
        return existing.rows[0];
      },
    );
    return favorite;
  }

  @Delete('favorites/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un favorito propio' })
  async removeFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.database.withRole('authenticated', user.id, (client) =>
      client.query('DELETE FROM unimovil.favorites WHERE id = $1 AND user_id = $2', [
        id,
        user.id,
      ]),
    );
  }

  @Get('incidents')
  @ApiOperation({ summary: 'Consultar las incidencias propias' })
  async listIncidents(@CurrentUser() user: AuthenticatedUser) {
    return { incidents: await this.incidents.listOwn(user.id) };
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar la cuenta y sus datos asociados' })
  async deleteAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.incidents.removeEvidenceForUser(user.id);
    await this.auth.deleteUser(user.id);
    response.setHeader('Set-Cookie', (await this.auth.logout(undefined)) ?? '');
    response.setHeader('Cache-Control', 'no-store');
  }
}
