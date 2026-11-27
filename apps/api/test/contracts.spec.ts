import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  adminIncidentPublicationSchema,
  adminIncidentTransitionSchema,
  adminIncidentUpdateSchema,
  auditQuerySchema,
  createIncidentSchema,
  favoriteSchema,
  incidentConfirmationSchema,
  profilePatchSchema,
} from '@unimovil/contracts';

describe('shared API contracts', () => {
  it('accepts only an incident with required category, text and campus coordinates', () => {
    const valid = createIncidentSchema.safeParse({
      category: 'access_obstruction',
      description: 'Incidencia sintética para validación.',
      coordinates: { latitude: 40.4486, longitude: -3.7262 },
    });
    const outside = createIncidentSchema.safeParse({
      category: 'access_obstruction',
      description: 'Incidencia sintética para validación.',
      coordinates: { latitude: 40.4, longitude: -3.8 },
    });
    const invalidCategory = createIncidentSchema.safeParse({
      category: 'security',
      description: 'Incidencia sintética para validación.',
      coordinates: { latitude: 40.4486, longitude: -3.7262 },
    });

    assert.equal(valid.success, true);
    assert.equal(outside.success, false);
    assert.equal(invalidCategory.success, false);
  });

  it('accepts catalog resource types and rejects empty favorite identifiers', () => {
    assert.equal(
      favoriteSchema.safeParse({ resourceType: 'transit-stop', resourceId: 'emt-123' })
        .success,
      true,
    );
    assert.equal(
      favoriteSchema.safeParse({ resourceType: 'place', resourceId: ' ' }).success,
      false,
    );
    assert.equal(
      favoriteSchema.safeParse({ resourceType: 'administrator', resourceId: 'x' })
        .success,
      false,
    );
  });

  it('limits profile updates to the optional university relationship', () => {
    assert.equal(
      profilePatchSchema.safeParse({ relationship: 'student' }).success,
      true,
    );
    assert.equal(profilePatchSchema.safeParse({ relationship: null }).success, true);
    assert.equal(
      profilePatchSchema.safeParse({ relationship: 'student', role: 'admin' }).success,
      false,
    );
  });

  it('validates Sprint 8 management, publication, confirmation and audit schemas', () => {
    assert.equal(
      adminIncidentUpdateSchema.safeParse({
        expectedRevision: 1,
        managementPriority: 'high',
      }).success,
      true,
    );
    assert.equal(
      adminIncidentUpdateSchema.safeParse({ expectedRevision: 1 }).success,
      false,
    );
    assert.equal(
      adminIncidentPublicationSchema.safeParse({
        expectedRevision: 1,
        visibility: 'published',
      }).success,
      false,
    );
    assert.equal(
      adminIncidentPublicationSchema.safeParse({
        expectedRevision: 1,
        visibility: 'published',
        publicSummary: 'Acceso lateral cerrado temporalmente.',
        approximateZone: 'Facultad de Informática',
      }).success,
      true,
    );
    assert.equal(
      adminIncidentTransitionSchema.safeParse({
        expectedRevision: 1,
        toStatus: 'under_review',
      }).success,
      true,
    );
    assert.equal(
      incidentConfirmationSchema.safeParse({ outcome: 'still_active' }).success,
      true,
    );
    assert.equal(
      auditQuerySchema.safeParse({ action: 'update_incident', page: 1, limit: 25 })
        .success,
      true,
    );
  });
});
