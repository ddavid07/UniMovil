# Fundamentos de UniMovil

Esta carpeta reúne las decisiones generales y los fundamentos técnicos de UniMovil: producto, tecnologías, arquitectura, repositorio, seguridad, calidad y gobierno del proyecto.

La documentación debe responder a tres preguntas:

1. Qué estamos construyendo.
2. Con qué principios y tecnologías lo construiremos.
3. Qué reglas debe seguir el equipo para mantener el proyecto coherente y seguro.

## Estructura

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

- [Funcionalidades](../funcionalidades.md): catálogo funcional del producto.
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
- MapLibre React Native renderizará los mapas.
- MapTiler Cloud Free será el proveedor inicial de mapas base.
- openrouteservice se utilizará inicialmente para el cálculo de rutas.
- OpenStreetMap será una fuente geográfica, respetando su atribución y políticas de uso.
- El proyecto utilizará Apache License 2.0.
- El repositorio seguirá una política de pull requests, CI, revisiones y protección de `main`.

## Decisiones todavía abiertas

Estas cuestiones no se deben inventar en documentos posteriores hasta que el equipo las confirme:

- Proveedor concreto de autenticación.
- Proveedor de despliegue del backend y de la base de datos.
- Existencia y formato de los datos reales de autobuses de la UCM.
- Si el panel de gestión será una aplicación web independiente.
- Si se publicará una versión web para usuarios finales.
- Estrategia definitiva de almacenamiento de fotografías de incidencias.
- Política definitiva de retención de datos y registros.
- Configuración exacta de las tiendas y credenciales de publicación móvil.

Las decisiones abiertas se resolverán mediante un ADR cuando exista información suficiente.
