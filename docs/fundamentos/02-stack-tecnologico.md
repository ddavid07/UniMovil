# 2. Stack tecnológico

## 2.1. Resumen

UniMovil utilizará TypeScript de extremo a extremo siempre que resulte apropiado: aplicación móvil, backend, contratos, scripts y herramientas del repositorio.

## 2.2. Lenguaje principal: TypeScript

TypeScript se utilizará porque:

- Detecta errores de tipos durante el desarrollo.
- Facilita el trabajo coordinado de cinco personas.
- Mejora el autocompletado y la navegación del código.
- Hace más seguras las refactorizaciones.
- Permite compartir modelos y contratos entre móvil y backend.
- Encaja con React Native, Expo y NestJS.
- Mantiene coherencia con `verification-engine`.

La configuración utilizará `strict: true`. Los tipos no sustituyen la validación de datos externos: las peticiones de API también deberán validarse en tiempo de ejecución.

## 2.3. Aplicación móvil

- React Native.
- Expo.
- Expo Router para navegación.
- TypeScript.
- React Native Testing Library para componentes.
- Adaptación a Android e iOS.

Expo mantiene abierta la posibilidad de utilizar la misma base de código en web, aunque las diferencias entre plataformas deberán evaluarse antes de comprometer esa plataforma.

## 2.4. Backend

- Node.js 24.21.0 LTS, fijado en `.node-version` y en el campo `engines` del monorepo.
- TypeScript.
- NestJS.
- API REST.
- OpenAPI para documentar el contrato.
- Validación explícita de entradas y respuestas.

NestJS se elige por su estructura modular, separación de responsabilidades, inyección de dependencias, guards, testing y facilidad para organizar un backend de varias áreas funcionales.

## 2.5. Base de datos

- Supabase como plataforma gestionada de datos.
- PostgreSQL como base de datos principal.
- PostGIS para coordenadas, geometrías, distancias y consultas geográficas.
- Migraciones versionadas.
- Datos espaciales con un sistema de coordenadas definido y documentado.

Supabase se utilizará sobre todo por la familiaridad del equipo y por ofrecer una base PostgreSQL gestionada adecuada para el proyecto académico. No se utilizará una base de datos documental como sistema principal, porque el proyecto necesita relaciones consistentes entre lugares, rutas, paradas, incidencias, usuarios y fuentes.

## 2.6. API y contratos

- REST sobre HTTPS.
- JSON como formato de intercambio.
- OpenAPI como contrato documentado.
- Versionado de API cuando exista incompatibilidad.
- Errores con estructura consistente.
- Esquemas compartidos cuando sea seguro y práctico.

## 2.7. Organización del código

Se utilizará un monorepo con npm Workspaces:

```text
apps/
  mobile/
  api/
  admin/          # panel web con React y Vite

packages/
  contracts/
  config/
  testing/

docs/
scripts/
```

Los componentes o tokens compartidos tendrán un paquete `ui` cuando exista una reutilización concreta entre las aplicaciones; no se crea una biblioteca vacía por anticipado. Tampoco se añadirá una herramienta de monorepo adicional hasta demostrar que npm Workspaces no cubre las necesidades.

## 2.8. Decisiones cerradas y condicionadas

Las decisiones de acceso a datos, identidad, almacenamiento, notificaciones y E2E están registradas en ADR-0007 a ADR-0013. La selección concreta del hosting queda condicionada a presupuesto, región y titularidad, según ADR-0010; el dominio no dependerá de un proveedor concreto.

- Drizzle para acceso tipado a PostgreSQL, con SQL/migraciones explícitas para PostGIS.
- Supabase Auth, integrado en el backend para las operaciones del producto.
- Supabase Storage privado para evidencias fotográficas.
- Expo Push Service detrás de un adaptador backend.
- Playwright para E2E del panel y Maestro para E2E móvil; integración EAS opcional.
