import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BadRequestException } from '@nestjs/common';
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
