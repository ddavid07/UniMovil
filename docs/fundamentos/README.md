# Fundamentos de UniMovil

Esta carpeta reúne las decisiones generales y los fundamentos técnicos de UniMovil: producto, tecnologías, arquitectura, repositorio, seguridad, calidad y gobierno del proyecto.

La documentación debe responder a tres preguntas:

1. Qué estamos construyendo.
2. Con qué principios y tecnologías lo construiremos.
3. Qué reglas debe seguir el equipo para mantener el proyecto coherente y seguro.

## Estructura

- [00. Catálogo de funcionalidades](funcionalidades.md)
- [01. Fundamentos del producto](01-fundamentos-del-producto.md)
- [02. Stack tecnológico](02-stack-tecnologico.md)
- [03. Arquitectura](03-arquitectura.md)
- [04. Mapas, cartografía y rutas](04-mapas-cartografia-y-rutas.md)
- [05. GitHub y configuración del repositorio](05-github-y-repositorio.md)
- [06. Toolchain y estándares de desarrollo](06-toolchain-y-estandares.md)
- [07. Seguridad y privacidad](07-seguridad-y-privacidad.md)
- [08. Documentación y gobierno del proyecto](08-documentacion-y-gobierno.md)
- [ADRs](adr/README.md)

## Relación con el resto de la documentación

- [Funcionalidades](funcionalidades.md): catálogo funcional del producto.
- [Plan de acción](../plan-de-accion.md): orden completo de implementación y puesta en producción.
- [Historias de usuario](../historias-de-usuario/README.md): comportamiento esperado desde la perspectiva de los usuarios.
- [Licencia](../../LICENSE): Apache License 2.0.
- [.gitignore](../../.gitignore): archivos excluidos del control de versiones.

## Decisiones confirmadas

- UniMovil se centrará en los desplazamientos dentro del campus de Moncloa de la Universidad Complutense de Madrid.
- La aplicación estará dirigida principalmente a estudiantes, profesores y personal universitario, pero permitirá el acceso de visitantes y personas externas.
- La información de movilidad será pública para su consulta.
- Se utilizará un modelo simplificado de roles: público, usuario registrado, gestor y administrador.
- La aplicación móvil tendrá como objetivo Android e iOS.
- TypeScript será el lenguaje principal del proyecto.
- React Native con Expo será la tecnología de la aplicación móvil.
- Node.js con TypeScript y NestJS se utilizará para el backend.
- Supabase proporcionará la plataforma de datos, utilizando PostgreSQL con PostGIS como base de datos principal.
- La comunicación se realizará mediante una API REST documentada con OpenAPI.
- npm Workspaces organizará el monorepo.
- El panel de administración será una aplicación web React con Vite en `apps/admin`.
- Node.js 24.21.0 LTS será la versión inicial fijada por el repositorio.
- MapLibre React Native renderizará los mapas.
- MapTiler Cloud Free será el proveedor inicial de mapas base.
- openrouteservice se utilizará inicialmente para el cálculo de rutas.
- OpenStreetMap será una fuente geográfica, respetando su atribución y políticas de uso.
- El proyecto utilizará Apache License 2.0.
- El repositorio seguirá una política de pull requests, CI, revisiones y protección de `main`.
- Supabase Auth proporcionará identidad; los permisos de UniMovil se aplicarán en la API.
- Drizzle será la capa tipada de acceso a PostgreSQL y SQL explícito cubrirá PostGIS.
- Supabase Storage privado guardará las fotografías de incidencias, mediadas por la API.
- El producto de usuario se limitará a Android/iOS y al panel administrativo; no se compromete web pública.
- Expo Push Service será el primer transporte de notificaciones, desacoplado mediante adaptador backend.
- Playwright cubrirá E2E del panel y Maestro cubrirá E2E móvil en builds nativos.
- Solo se integrarán fuentes oficiales/autorizadas de transporte y se mostrará su vigencia.

## Decisiones cerradas y condiciones externas

Las decisiones de producto y arquitectura para iniciar la implementación están registradas en ADR. Las condiciones siguientes delimitan acciones que dependen de cuentas, información o aprobaciones externas y no reabren dichas decisiones:

- El hosting concreto de API y panel se elegirá al confirmar presupuesto, región y titularidad; la arquitectura será portable y Supabase seguirá como plataforma de datos.
- No consta un feed UCM/operador autorizado para autobuses en tiempo real. Hasta verificarlo se usarán datos oficiales estáticos/manuales, con fecha/estado visibles; nunca se simulará tiempo real.
- Las retenciones que requieran aprobación jurídica/institucional se fijarán antes de tratar datos reales. Hasta entonces se minimizan datos, no se conserva historial de ubicación y se usan fixtures ficticios.
- La titularidad de las cuentas Apple Developer y Google Play Console se acordará antes de crear cuentas de publicación o certificados definitivos.
- El repositorio es público y tiene activados secret scanning, push protection, CodeQL, Dependency Review y protección de `main`; véase [ADR-0014](adr/0014-repositorio-publico-y-controles-github.md).
- CODEOWNERS conserva al propietario actual como responsable temporal hasta confirmar los cinco usuarios y responsables de área.

Estas condiciones están asignadas a las fases que las necesitan y no impiden comenzar el desarrollo con datos ficticios.
