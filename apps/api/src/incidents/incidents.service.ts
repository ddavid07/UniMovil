import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { createIncidentSchema, type ConfirmationOutcome } from '@unimovil/contracts';
import { DatabaseService } from '../database/database.service';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 40_000_000;
const ALLOWED_INPUT_TYPES = new Map([
  ['image/jpeg', 'jpeg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

interface IncomingImage {
  buffer: Buffer;
  mimetype: string;
}

function isIncomingImage(value: unknown): value is IncomingImage {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('buffer' in value) ||
    !('mimetype' in value)
  ) {
    return false;
  }

  return Buffer.isBuffer(value.buffer) && typeof value.mimetype === 'string';
}

interface ProcessedImage {
  buffer: Buffer;
  sha256: string;
}

interface IncidentForm {
  category: string;
  description: string;
  perceivedPriority?: string;
  coordinates: string;
}

@Injectable()
export class IncidentsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IncidentsService.name);
  private readonly storage;
  private cleanupTimer: ReturnType<typeof setInterval> | undefined;

  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey)
      throw new Error('Supabase server credentials are required.');
    this.storage = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }).storage.from('incident-evidence');
  }

  onModuleInit(): void {
    this.cleanupTimer = setInterval(
      () => void this.retryPendingStorageCleanup(),
      60_000,
    );
    this.cleanupTimer.unref?.();
    void this.retryPendingStorageCleanup();
  }

  onModuleDestroy(): void {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  async listOwn(userId: string) {
    const result = await this.database.withRole('authenticated', userId, (client) =>
      client.query(
        `SELECT id, public_id AS "publicId", category, description,
                perceived_priority AS "perceivedPriority",
                operational_status AS status, visibility,
                extensions.ST_Y(location::extensions.geometry) AS latitude,
                extensions.ST_X(location::extensions.geometry) AS longitude,
                created_at AS "createdAt", updated_at AS "updatedAt"
         FROM unimovil.incidents
         WHERE owner_id = $1
         ORDER BY created_at DESC`,
        [userId],
      ),
    );
    return result.rows;
  }

  async listPublic(category?: string, status?: string) {
    const result = await this.database.withRole('anon', null, (client) =>
      client.query(
        `SELECT public_id AS "publicId", category, description,
                approximate_zone AS "approximateZone",
                operational_status AS status, updated_at AS "updatedAt",
                latitude::double precision, longitude::double precision
         FROM unimovil.public_incidents
         WHERE ($1::text IS NULL OR category = $1)
           AND ($2::text IS NULL OR operational_status = $2)
         ORDER BY updated_at DESC
         LIMIT 500`,
        [category ?? null, status ?? null],
      ),
    );
    return result.rows;
  }

  async getOwnDetail(userId: string, incidentId: string) {
    const incidentResult = await this.database.withRole(
      'authenticated',
      userId,
      (client) =>
        client.query(
          `SELECT id, public_id AS "publicId", category, description,
                perceived_priority AS "perceivedPriority",
                operational_status AS status, visibility,
                closure_reason AS "closureReason",
                extensions.ST_Y(location::extensions.geometry) AS latitude,
                extensions.ST_X(location::extensions.geometry) AS longitude,
                created_at AS "createdAt", updated_at AS "updatedAt"
         FROM unimovil.incidents
         WHERE id = $1 AND owner_id = $2`,
          [incidentId, userId],
        ),
    );
    const incident = incidentResult.rows[0];
    if (!incident) throw new NotFoundException('No se encontró la incidencia.');
    const historyResult = await this.database.withRole(
      'authenticated',
      userId,
      (client) =>
        client.query(
          `SELECT id, from_status AS "fromStatus", to_status AS "toStatus",
                  closure_kind AS "closureKind", reason,
                  informant_response AS "informantResponse",
                  created_at AS "createdAt"
           FROM unimovil.incident_status_history
           WHERE incident_id = $1
           ORDER BY created_at ASC, id ASC`,
          [incidentId],
        ),
    );
    return { ...incident, statusHistory: historyResult.rows };
  }

  async upsertConfirmation(
    userId: string,
    target: { publicId?: string; incidentId?: string },
    outcome: ConfirmationOutcome,
  ) {
    return this.database.withRole('authenticated', userId, async (client) => {
      const incidentResult = target.publicId
        ? await client.query<{ id: string; operational_status: string }>(
            `SELECT id, operational_status
             FROM unimovil.incidents
             WHERE public_id = $1 AND visibility = 'published'`,
            [target.publicId],
          )
        : await client.query<{ id: string; operational_status: string }>(
            `SELECT id, operational_status
             FROM unimovil.incidents
             WHERE id = $1 AND owner_id = $2`,
            [target.incidentId, userId],
          );

      const incident = incidentResult.rows[0];
      if (!incident) throw new NotFoundException('No se encontró la incidencia.');
      if (incident.operational_status === 'closed') {
        throw new BadRequestException(
          'No se aceptan confirmaciones para incidencias cerradas.',
        );
      }

      const saved = await client.query(
        `INSERT INTO unimovil.incident_confirmations (incident_id, user_id, outcome)
         VALUES ($1, $2, $3)
         ON CONFLICT (incident_id, user_id) DO UPDATE
         SET outcome = EXCLUDED.outcome, updated_at = now()
         RETURNING id, outcome, updated_at AS "updatedAt"`,
        [incident.id, userId, outcome],
      );
      return saved.rows[0];
    });
  }

  async create(
    userId: string,
    form: IncidentForm,
    files: unknown,
    idempotencyKey: string | undefined,
  ) {
    if (!idempotencyKey || !/^[A-Za-z0-9_-]{16,128}$/.test(idempotencyKey)) {
      throw new BadRequestException(
        'El envío necesita una clave de idempotencia válida.',
      );
    }
    if (!Array.isArray(files))
      throw new BadRequestException('La lista de imágenes no es válida.');
    if (files.length > 3)
      throw new BadRequestException('Se permiten hasta tres imágenes.');
    const incomingFiles = files.filter(isIncomingImage);
    if (incomingFiles.length !== files.length)
      throw new BadRequestException('Una de las imágenes no es válida.');

    let coordinates: unknown;
    try {
      coordinates = JSON.parse(form.coordinates);
    } catch {
      throw new BadRequestException('La ubicación seleccionada no es válida.');
    }
    const input = createIncidentSchema.safeParse({
      category: form.category,
      description: form.description,
      perceivedPriority: form.perceivedPriority || undefined,
      coordinates,
    });
    if (!input.success) {
      throw new BadRequestException(input.error.issues.map((issue) => issue.message));
    }

    const images = await Promise.all(
      incomingFiles.map((file) => this.processImage(file)),
    );
    const requestHash = createHash('sha256')
      .update(
        JSON.stringify({
          ...input.data,
          images: images.map((image) => image.sha256),
        }),
      )
      .digest('hex');
    const existing = await this.database.withRole('authenticated', userId, (client) =>
      client.query(
        `SELECT id, public_id AS "publicId", request_hash AS "requestHash",
                operational_status AS status, created_at AS "createdAt",
                (SELECT count(*)::integer FROM unimovil.incident_attachments attachment
                 WHERE attachment.incident_id = unimovil.incidents.id) AS "attachmentCount"
         FROM unimovil.incidents WHERE owner_id = $1 AND idempotency_key = $2`,
        [userId, idempotencyKey],
      ),
    );
    if (existing.rows[0]) {
      if (existing.rows[0].requestHash !== requestHash) {
        throw new ConflictException('La clave ya se utilizó con otro contenido.');
      }
      return existing.rows[0];
    }

    const incidentId = randomUUID();
    const publicId = randomUUID();
    const uploadedPaths: string[] = [];
    try {
      for (const image of images) {
        const path = `${userId}/${incidentId}/${randomUUID()}.webp`;
        const { error } = await this.storage.upload(path, image.buffer, {
          contentType: 'image/webp',
          upsert: false,
        });
        if (error)
          throw new BadGatewayException('No se pudo guardar una de las imágenes.');
        uploadedPaths.push(path);
      }

      const incident = await this.database.withRole(
        'authenticated',
        userId,
        async (client) => {
          const inserted = await client.query(
            `INSERT INTO unimovil.incidents
             (id, public_id, owner_id, idempotency_key, request_hash, category,
              description, perceived_priority, operational_status, visibility, location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'received', 'private',
                   extensions.ST_SetSRID(
                     extensions.ST_MakePoint($9::double precision, $10::double precision),
                     4326
                   )::extensions.geography)
           RETURNING id, public_id AS "publicId", category, description,
                     operational_status AS status, visibility,
                     created_at AS "createdAt", updated_at AS "updatedAt"`,
            [
              incidentId,
              publicId,
              userId,
              idempotencyKey,
              requestHash,
              input.data.category,
              input.data.description,
              input.data.perceivedPriority ?? null,
              input.data.coordinates.longitude,
              input.data.coordinates.latitude,
            ],
          );
          for (const [index, path] of uploadedPaths.entries()) {
            await client.query(
              `INSERT INTO unimovil.incident_attachments
               (incident_id, storage_path, content_type, byte_size, sha256)
             VALUES ($1, $2, 'image/webp', $3, $4)`,
              [
                incidentId,
                path,
                images[index]!.buffer.byteLength,
                images[index]!.sha256,
              ],
            );
          }
          return inserted.rows[0];
        },
      );
      return { ...incident, attachmentCount: uploadedPaths.length };
    } catch (error) {
      if (uploadedPaths.length > 0) {
        if (!(await this.removeStorageObjects(uploadedPaths))) {
          await this.enqueueStorageCleanup(uploadedPaths);
          throw new BadGatewayException(
            'El envío no se confirmó y la limpieza de evidencias quedó pendiente para reintento automático.',
          );
        }
      }
      if ((error as { code?: string }).code === '23505') {
        const raced = await this.database.withRole('authenticated', userId, (client) =>
          client.query(
            `SELECT id, public_id AS "publicId", request_hash AS "requestHash",
                    operational_status AS status, created_at AS "createdAt",
                    (SELECT count(*)::integer FROM unimovil.incident_attachments attachment
                     WHERE attachment.incident_id = unimovil.incidents.id) AS "attachmentCount"
             FROM unimovil.incidents WHERE owner_id = $1 AND idempotency_key = $2`,
            [userId, idempotencyKey],
          ),
        );
        if (raced.rows[0]) {
          if (raced.rows[0].requestHash !== requestHash) {
            throw new ConflictException('La clave ya se utilizó con otro contenido.');
          }
          return raced.rows[0];
        }
      }
      if (error instanceof ConflictException || error instanceof BadRequestException)
        throw error;
      throw error;
    }
  }

  async getOwnAttachment(userId: string, incidentId: string, attachmentId: string) {
    const result = await this.database.withRole('authenticated', userId, (client) =>
      client.query<{ storage_path: string }>(
        `SELECT attachment.storage_path
         FROM unimovil.incident_attachments attachment
         JOIN unimovil.incidents incident ON incident.id = attachment.incident_id
         WHERE incident.id = $1 AND incident.owner_id = $2 AND attachment.id = $3`,
        [incidentId, userId, attachmentId],
      ),
    );
    const path = result.rows[0]?.storage_path;
    if (!path) throw new NotFoundException('No se encontró la imagen.');
    return this.downloadPrivateEvidenceByPath(path);
  }

  async downloadPrivateEvidenceByPath(storagePath: string): Promise<Buffer> {
    const { data, error } = await this.storage.download(storagePath);
    if (error || !data) throw new NotFoundException('No se encontró la imagen.');
    return Buffer.from(await data.arrayBuffer());
  }

  async removeEvidenceForUser(userId: string): Promise<void> {
    const result = await this.database.withRole('authenticated', userId, (client) =>
      client.query<{ storage_path: string }>(
        `SELECT attachment.storage_path
         FROM unimovil.incident_attachments attachment
         JOIN unimovil.incidents incident ON incident.id = attachment.incident_id
         WHERE incident.owner_id = $1`,
        [userId],
      ),
    );
    const paths = result.rows.map((row) => row.storage_path);
    if (paths.length === 0) return;
    if (!(await this.removeStorageObjects(paths)))
      await this.enqueueStorageCleanup(paths);
  }

  async seedPublicFixture(): Promise<void> {
    await this.database.runtimeQuery(
      `INSERT INTO unimovil.incidents
         (public_id, category, description, public_summary, approximate_zone,
          operational_status, visibility, revision, published_revision, location)
       VALUES ('local-demo-access-obstruction', 'access_obstruction',
               'Ejemplo local: incidencia de prueba, sin relación con un problema real.',
               'Ejemplo local: incidencia de prueba, sin relación con un problema real.',
               'Entorno de Ciudad Universitaria (ejemplo sintético)',
               'under_review', 'published', 1, 1,
               extensions.ST_SetSRID(
                 extensions.ST_MakePoint(-3.7262::double precision, 40.4486::double precision),
                 4326
               )::extensions.geography)
       ON CONFLICT (public_id) DO NOTHING`,
    );
  }

  private async processImage(file: IncomingImage): Promise<ProcessedImage> {
    if (file.buffer.byteLength < 1 || file.buffer.byteLength > MAX_FILE_BYTES) {
      throw new BadRequestException('Cada imagen debe ocupar como máximo 5 MiB.');
    }
    const expectedFormat = ALLOWED_INPUT_TYPES.get(file.mimetype.toLowerCase());
    if (!expectedFormat)
      throw new BadRequestException('Solo se admiten imágenes JPEG, PNG o WebP.');
    try {
      const image = sharp(file.buffer, {
        limitInputPixels: MAX_IMAGE_PIXELS,
        failOn: 'error',
      });
      const metadata = await image.metadata();
      if (!metadata.format || metadata.format !== expectedFormat) {
        throw new BadRequestException(
          'El tipo declarado no coincide con el contenido de la imagen.',
        );
      }
      const buffer = await image.rotate().webp({ quality: 86, effort: 4 }).toBuffer();
      if (buffer.byteLength > MAX_FILE_BYTES) {
        throw new BadRequestException('La imagen procesada supera el límite de 5 MiB.');
      }
      return { buffer, sha256: createHash('sha256').update(buffer).digest('hex') };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('El archivo no contiene una imagen válida.');
    }
  }

  private async removeStorageObjects(paths: readonly string[]): Promise<boolean> {
    try {
      const { error } = await this.storage.remove([...paths]);
      return !error;
    } catch {
      return false;
    }
  }

  private async enqueueStorageCleanup(paths: readonly string[]): Promise<void> {
    try {
      await Promise.all(
        paths.map((path) =>
          this.database.runtimeQuery(
            `INSERT INTO unimovil.storage_cleanup_queue (storage_path)
             VALUES ($1) ON CONFLICT (storage_path) DO NOTHING`,
            [path],
          ),
        ),
      );
    } catch {
      this.logger.error('Could not persist a pending private evidence cleanup task.');
      throw new BadGatewayException(
        'No se pudo registrar la limpieza pendiente de las evidencias.',
      );
    }
  }

  private async retryPendingStorageCleanup(): Promise<void> {
    try {
      const pending = await this.database.runtimeQuery<{
        id: string;
        storage_path: string;
      }>(
        `SELECT id, storage_path FROM unimovil.storage_cleanup_queue
         ORDER BY created_at LIMIT 50`,
      );
      if (pending.rows.length === 0) return;
      const ids = pending.rows.map((item) => item.id);
      const paths = pending.rows.map((item) => item.storage_path);
      if (await this.removeStorageObjects(paths)) {
        await this.database.runtimeQuery(
          'DELETE FROM unimovil.storage_cleanup_queue WHERE id = ANY($1::uuid[])',
          [ids],
        );
      } else {
        await this.database.runtimeQuery(
          `UPDATE unimovil.storage_cleanup_queue
           SET attempts = attempts + 1, last_attempt_at = now()
           WHERE id = ANY($1::uuid[])`,
          [ids],
        );
      }
    } catch {
      this.logger.warn(
        'Private evidence cleanup retry could not complete; it will retry later.',
      );
    }
  }
}
