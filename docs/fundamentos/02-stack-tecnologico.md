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

- Node.js en una versión LTS fijada por el repositorio.
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
  admin/          # solo si se confirma el panel web

packages/
  contracts/
  config/
  ui/             # solo si aporta reutilización real

docs/
scripts/
```

No se añadirá una herramienta de monorepo adicional hasta demostrar que npm Workspaces no cubre las necesidades del proyecto.

## 2.8. Decisiones todavía no fijadas

- ORM o estrategia definitiva de acceso a PostgreSQL.
- Si se utilizarán los servicios de autenticación de Supabase o un proveedor independiente.
- Proveedor de almacenamiento de imágenes.
- Proveedor de despliegue.
- Biblioteca definitiva para pruebas end-to-end.
