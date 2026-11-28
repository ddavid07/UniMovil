import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import sharp from 'sharp';
import { IncidentsService } from '../src/incidents/incidents.service';
import type { DatabaseService } from '../src/database/database.service';

process.env.SUPABASE_URL ??= 'http://127.0.0.1:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'local-unit-test-service-role-key';

const service = new IncidentsService({} as DatabaseService);
const processImage = Reflect.get(service, 'processImage') as (file: {
  buffer: Buffer;
  mimetype: string;
}) => Promise<{ buffer: Buffer; sha256: string }>;
const validIdempotencyKey = 'idempotency-key-123456';

describe('incident submission input', () => {
  it('rejects a non-array upload value before processing the form', async () => {
    const invalidFiles = 'unexpected string';

    await assert.rejects(
      service.create(
        'user-id',
        {} as Parameters<IncidentsService['create']>[1],
        invalidFiles,
        validIdempotencyKey,
      ),
      BadRequestException,
    );
  });

  it('rejects array entries that are not uploaded image files', async () => {
    await assert.rejects(
      service.create(
        'user-id',
        {} as Parameters<IncidentsService['create']>[1],
        [null],
        validIdempotencyKey,
      ),
      BadRequestException,
    );
  });
});

describe('incident evidence processing', () => {
  it('decodes an image and returns normalized WebP with a content hash', async () => {
    const png = await sharp({
      create: { width: 16, height: 16, channels: 3, background: '#b71234' },
    })
      .png()
      .toBuffer();
    const result = await processImage.call(service, {
      buffer: png,
      mimetype: 'image/png',
    });
    const metadata = await sharp(result.buffer).metadata();

    assert.equal(metadata.format, 'webp');
    assert.match(result.sha256, /^[a-f0-9]{64}$/);
    assert.equal(metadata.exif, undefined);
  });

  it('rejects MIME spoofing and unsupported formats', async () => {
    const png = await sharp({
      create: { width: 8, height: 8, channels: 3, background: '#b71234' },
    })
      .png()
      .toBuffer();

    await assert.rejects(
      processImage.call(service, { buffer: png, mimetype: 'image/jpeg' }),
      BadRequestException,
    );
    await assert.rejects(
      processImage.call(service, { buffer: png, mimetype: 'image/svg+xml' }),
      BadRequestException,
    );
  });

  it('rejects empty, oversized and corrupt uploads', async () => {
    await assert.rejects(
      processImage.call(service, { buffer: Buffer.alloc(0), mimetype: 'image/png' }),
      BadRequestException,
    );
    await assert.rejects(
      processImage.call(service, {
        buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
        mimetype: 'image/png',
      }),
      BadRequestException,
    );
    await assert.rejects(
      processImage.call(service, {
        buffer: Buffer.from('not an image'),
        mimetype: 'image/png',
      }),
      BadRequestException,
    );
  });
});

describe('own incident detail privacy (HU-055)', () => {
  it('omits internal moderation reasons and actor identifiers from SQL queries and response', async () => {
    const queries: string[] = [];
    const database = {
      withRole: async (
        _role: string,
        _userId: string | null,
        op: (client: {
          query: (sql: string) => Promise<{ rows: unknown[] }>;
        }) => Promise<unknown>,
      ) =>
        op({
          query: async (sql: string) => {
            queries.push(sql);
            if (sql.includes('FROM unimovil.incidents')) {
              return {
                rows: [
                  {
                    id: 'inc-1',
                    publicId: 'pub-1',
                    category: 'other',
                    description: 'Acceso bloqueado',
                    perceivedPriority: 'normal',
                    status: 'resolved',
                    visibility: 'private',
                    latitude: 40.45,
                    longitude: -3.72,
                    createdAt: '2026-11-27T09:00:00.000Z',
                    updatedAt: '2026-11-27T10:00:00.000Z',
                  },
                ],
              };
            }
            return {
              rows: [
                {
                  id: 'hist-1',
                  fromStatus: 'under_review',
                  toStatus: 'resolved',
                  closureKind: null,
                  informantResponse: 'El acceso vuelve a estar despejado.',
                  createdAt: '2026-11-27T10:00:00.000Z',
                },
              ],
            };
          },
        }),
    } as unknown as DatabaseService;

    const localService = new IncidentsService(database);
    const detail = await localService.getOwnDetail('owner-1', 'inc-1');

    const [incidentQuery, historyQuery] = queries;
    assert.ok(incidentQuery && historyQuery);
    assert.doesNotMatch(incidentQuery, /\bclosure_reason\b/i);
    assert.doesNotMatch(historyQuery, /\breason\b|\bactor_id\b/i);
    assert.equal('closureReason' in detail, false);
    assert.equal(detail.statusHistory.length, 1);
    const [firstHistory] = detail.statusHistory;
    assert.ok(firstHistory);
    assert.equal(firstHistory.informantResponse, 'El acceso vuelve a estar despejado.');
    assert.equal('reason' in firstHistory, false);
    assert.equal('actorId' in firstHistory, false);
  });

  it('throws NotFoundException when the incident does not belong to the user', async () => {
    const database = {
      withRole: async (
        _role: string,
        _userId: string | null,
        op: (client: { query: () => Promise<{ rows: unknown[] }> }) => Promise<unknown>,
      ) => op({ query: async () => ({ rows: [] }) }),
    } as unknown as DatabaseService;

    const localService = new IncidentsService(database);
    await assert.rejects(
      localService.getOwnDetail('other-user', 'inc-1'),
      NotFoundException,
    );
  });
});
