import { z } from 'zod';
import { isWithinCampusCoverage } from './campus-coverage';
export { isWithinCampusCoverage };

export const relationshipSchema = z.enum([
  'student',
  'faculty',
  'staff',
  'visitor',
  'other',
]);

export const profilePatchSchema = z
  .object({
    relationship: relationshipSchema.nullable(),
  })
  .strict();

export const favoriteTypes = [
  'place',
  'transit-stop',
  'transit-line',
  'mobility-resource',
] as const;

export const favoriteSchema = z.object({
  resourceType: z.enum(favoriteTypes),
  resourceId: z.string().trim().min(1).max(160),
});

export const incidentCategories = [
  'access_obstruction',
  'lift_or_elevator',
  'adapted_access_or_service',
  'parking',
  'bicycle_resource',
  'other',
] as const;

export const incidentStatuses = [
  'received',
  'under_review',
  'in_progress',
  'resolved',
  'closed',
] as const;

export const incidentPriorities = ['low', 'normal', 'high'] as const;

export const campusCoordinatesSchema = z
  .object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
  })
  .refine((coordinates) => isWithinCampusCoverage(coordinates), {
    message: 'El punto debe estar dentro de la cobertura aproximada del campus.',
  });

export const createIncidentSchema = z.object({
  category: z.enum(incidentCategories),
  description: z.string().trim().min(1).max(2000),
  perceivedPriority: z.enum(incidentPriorities).optional(),
  coordinates: campusCoordinatesSchema,
});

export type FavoriteInput = z.infer<typeof favoriteSchema>;
export type IncidentCategory = (typeof incidentCategories)[number];
export type IncidentStatus = (typeof incidentStatuses)[number];
export type IncidentPriority = (typeof incidentPriorities)[number];
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

export interface PublicIncident {
  publicId: string;
  category: IncidentCategory;
  description: string;
  status: IncidentStatus;
  updatedAt: string;
  latitude: number;
  longitude: number;
}
