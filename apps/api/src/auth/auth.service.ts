import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, type Session, type User } from '@supabase/supabase-js';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { parse, serialize } from 'cookie';
import type { AccountRole } from '@unimovil/contracts';
import { DatabaseService } from '../database/database.service';

const WEB_SESSION_COOKIE = 'unimovil_session';
const WEB_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  source: 'bearer' | 'cookie';
  role: AccountRole;
}

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly url: string;
  private readonly anonKey: string;
  private readonly webAppOrigin: string;
  private readonly adminClient;
  private readonly encryptionKey: Buffer;
  private readonly allowedOrigins: ReadonlySet<string>;

  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {
    this.url = process.env.SUPABASE_URL ?? '';
    this.anonKey = process.env.SUPABASE_ANON_KEY ?? '';
    const webAppUrl = process.env.WEB_APP_URL ?? 'http://localhost:8081';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const encodedKey = process.env.WEB_SESSION_ENCRYPTION_KEY ?? '';
    if (!this.url || !this.anonKey || !serviceRoleKey) {
      throw new Error(
        'SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are required.',
      );
    }
    let parsedWebAppUrl: URL;
    try {
      parsedWebAppUrl = new URL(webAppUrl);
    } catch {
      throw new Error('WEB_APP_URL must be an absolute HTTP or HTTPS URL.');
    }
    if (
      !['http:', 'https:'].includes(parsedWebAppUrl.protocol) ||
      parsedWebAppUrl.username ||
      parsedWebAppUrl.password
    ) {
      throw new Error(
        'WEB_APP_URL must be an absolute HTTP or HTTPS URL without credentials.',
      );
    }
    this.webAppOrigin = parsedWebAppUrl.origin;
    this.encryptionKey = Buffer.from(encodedKey, 'base64');
    if (this.encryptionKey.length !== 32) {
      throw new Error('WEB_SESSION_ENCRYPTION_KEY must decode to exactly 32 bytes.');
    }
    this.allowedOrigins = new Set(
      (process.env.WEB_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    );
    this.adminClient = this.client(serviceRoleKey);
  }

  private client(key = this.anonKey) {
    return createClient(this.url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  isAllowedOrigin(origin: string | undefined): boolean {
    return origin !== undefined && this.allowedOrigins.has(origin);
  }

  async authenticateBearer(token: string): Promise<AuthenticatedUser> {
    const { data, error } = await this.client().auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException('La sesión no es válida.');
    const role = await this.resolveRole(data.user.id);
    return this.toIdentity(data.user, 'bearer', role);
  }

  async signUp(
    email: string,
    password: string,
  ): Promise<{ confirmationRequired: boolean }> {
    const { data, error } = await this.client().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${this.webAppOrigin}/account` },
    });
    if (error) {
      if (error.message.toLowerCase().includes('password')) {
        throw new BadRequestException(
          'La contraseña no cumple los requisitos de seguridad.',
        );
      }
      throw new BadRequestException(
        'No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.',
      );
    }
    return { confirmationRequired: !data.session };
  }

  async signInWeb(
    email: string,
    password: string,
  ): Promise<{
    user: Pick<User, 'id' | 'email'> & { role: AccountRole };
    cookie: string;
  }> {
    const { data, error } = await this.client().auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session || !data.user) {
      throw new UnauthorizedException(
        'No se pudo iniciar sesión. Comprueba el correo y la contraseña.',
      );
    }
    const role = await this.resolveRole(data.user.id);
    return {
      user: { id: data.user.id, email: data.user.email, role },
      cookie: await this.createWebSession(data.session),
    };
  }

  async requestRecovery(email: string): Promise<void> {
    await this.client().auth.resetPasswordForEmail(email, {
      redirectTo: `${this.webAppOrigin}/reset-password`,
    });
  }

  async updatePassword(accessToken: string, password: string): Promise<void> {
    const user = await this.authenticateBearer(accessToken);
    const response = await fetch(`${this.url}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        apikey: this.anonKey,
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      throw new BadRequestException(
        'No se pudo actualizar la contraseña. Solicita un enlace nuevo.',
      );
    }
    if (!user.id)
      throw new UnauthorizedException('El enlace de recuperación no es válido.');
  }

  async getWebSession(
    cookieHeader: string | undefined,
  ): Promise<AuthenticatedUser | null> {
    const sessionId = this.readSessionId(cookieHeader);
    if (!sessionId) return null;
    const sessionHash = this.hashSessionId(sessionId);
    const result = await this.database.runtimeQuery<{
      user_id: string;
      credentials_ciphertext: string;
      access_token_expires_at: Date;
      expires_at: Date;
    }>(
      `SELECT user_id, credentials_ciphertext, access_token_expires_at, expires_at
       FROM unimovil.web_sessions
       WHERE session_hash = $1 AND expires_at > now()`,
      [sessionHash],
    );
    const row = result.rows[0];
    if (!row) return null;

    let tokens = this.decrypt(row.credentials_ciphertext);
    if (row.access_token_expires_at.getTime() < Date.now() + 5 * 60_000) {
      const { data, error } = await this.client().auth.refreshSession({
        refresh_token: tokens.refreshToken,
      });
      if (error || !data.session || data.user?.id !== row.user_id) {
        await this.deleteWebSession(sessionHash);
        return null;
      }
      tokens = this.tokens(data.session);
      await this.database.runtimeQuery(
        `UPDATE unimovil.web_sessions
         SET credentials_ciphertext = $2, access_token_expires_at = $3, updated_at = now()
         WHERE session_hash = $1`,
        [sessionHash, this.encrypt(tokens), new Date(data.session.expires_at! * 1000)],
      );
    }
    const role = await this.resolveRole(row.user_id);
    return { id: row.user_id, email: null, source: 'cookie', role };
  }

  async createMobileWebSession(
    accessToken: string,
    refreshToken: string,
  ): Promise<string> {
    const { data, error } = await this.client().auth.getUser(accessToken);
    if (error || !data.user) throw new UnauthorizedException('La sesión no es válida.');
    const { data: sessionData, error: refreshError } =
      await this.client().auth.refreshSession({
        refresh_token: refreshToken,
      });
    const session = sessionData.session;
    if (refreshError || !session || session.user.id !== data.user.id) {
      throw new UnauthorizedException('La sesión no es válida.');
    }
    return this.createWebSession(session);
  }

  async logout(cookieHeader: string | undefined): Promise<string | null> {
    const sessionId = this.readSessionId(cookieHeader);
    if (!sessionId) return this.clearCookie();
    const sessionHash = this.hashSessionId(sessionId);
    const result = await this.database.runtimeQuery<{ credentials_ciphertext: string }>(
      'SELECT credentials_ciphertext FROM unimovil.web_sessions WHERE session_hash = $1',
      [sessionHash],
    );
    const stored = result.rows[0];
    if (stored) {
      const tokens = this.decrypt(stored.credentials_ciphertext);
      await fetch(`${this.url}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          apikey: this.anonKey,
          authorization: `Bearer ${tokens.accessToken}`,
        },
      }).catch(() => undefined);
      await this.deleteWebSession(sessionHash);
    }
    return this.clearCookie();
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.adminClient.auth.admin.deleteUser(userId);
    if (error)
      throw new BadRequestException(
        'No se pudo eliminar la cuenta. Inténtalo de nuevo.',
      );
  }

  private async createWebSession(session: Session): Promise<string> {
    const sessionId = randomBytes(32).toString('base64url');
    const sessionHash = this.hashSessionId(sessionId);
    const accessTokenExpiresAt = session.expires_at
      ? new Date(session.expires_at * 1000)
      : new Date(Date.now() + 60 * 60 * 1000);
    const expiresAt = new Date(Date.now() + WEB_SESSION_MAX_AGE_SECONDS * 1000);
    await this.database.runtimeQuery(
      `INSERT INTO unimovil.web_sessions
         (session_hash, user_id, credentials_ciphertext, access_token_expires_at, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        sessionHash,
        session.user.id,
        this.encrypt(this.tokens(session)),
        accessTokenExpiresAt,
        expiresAt,
      ],
    );
    return serialize(WEB_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: WEB_SESSION_MAX_AGE_SECONDS,
    });
  }

  private async deleteWebSession(sessionHash: string): Promise<void> {
    await this.database.runtimeQuery(
      'DELETE FROM unimovil.web_sessions WHERE session_hash = $1',
      [sessionHash],
    );
  }

  private readSessionId(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null;
    const sessionId = parse(cookieHeader)[WEB_SESSION_COOKIE];
    return sessionId && /^[A-Za-z0-9_-]{40,60}$/.test(sessionId) ? sessionId : null;
  }

  private hashSessionId(sessionId: string): string {
    return createHash('sha256').update(sessionId).digest('hex');
  }

  private tokens(session: Session): StoredTokens {
    return { accessToken: session.access_token, refreshToken: session.refresh_token };
  }

  private encrypt(tokens: StoredTokens): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(tokens), 'utf8'),
      cipher.final(),
    ]);
    return [iv, cipher.getAuthTag(), ciphertext]
      .map((part) => part.toString('base64url'))
      .join('.');
  }

  private decrypt(value: string): StoredTokens {
    const [encodedIv, encodedTag, encodedCiphertext] = value.split('.');
    if (!encodedIv || !encodedTag || !encodedCiphertext) {
      throw new Error('Web session credential is malformed.');
    }
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(encodedIv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(encodedCiphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
    const tokens = JSON.parse(plaintext) as Partial<StoredTokens>;
    if (
      typeof tokens.accessToken !== 'string' ||
      typeof tokens.refreshToken !== 'string'
    ) {
      throw new Error('Web session credentials are invalid.');
    }
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  private clearCookie(): string {
    return serialize(WEB_SESSION_COOKIE, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  }

  private async resolveRole(userId: string): Promise<AccountRole> {
    const result = await this.database.runtimeQuery<{ role: string }>(
      'SELECT role FROM unimovil.account_roles WHERE user_id = $1',
      [userId],
    );
    const role = result.rows[0]?.role;
    return role === 'manager' || role === 'admin' ? role : 'user';
  }

  private toIdentity(
    user: User,
    source: AuthenticatedUser['source'],
    role: AccountRole,
  ): AuthenticatedUser {
    return { id: user.id, email: user.email ?? null, source, role };
  }
}
