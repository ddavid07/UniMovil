# Fundamentos del producto

## 1. Propósito

UniMovil facilita la orientación y los desplazamientos por el Campus de Moncloa de la Universidad Complutense de Madrid. Reúne información de lugares, mapas, rutas, transporte, recursos de movilidad e incidencias con su procedencia y límites conocidos.

El producto se dirige tanto a personas que conocen el campus como a quienes lo visitan por primera vez. La consulta pública de mapa y lugares no requiere registrarse ni conceder permiso de ubicación.

## 2. Alcance geográfico

- Campus de Moncloa de la UCM y su cobertura cartográfica aproximada.
- Lugares, accesos y recursos incluidos en el catálogo local vigente.
- Red peatonal y paradas de EMT que cubren el campus cuando la fuente permite representarlas.
- Los desplazamientos a otros campus, la movilidad académica y la navegación en interiores no forman parte del alcance actual.

El polígono de cobertura procede de OpenStreetMap y no certifica lindes oficiales, catastrales ni de propiedad de la Universidad. La procedencia y la fecha de los datos se describen en [Fuentes de datos y atribuciones](../development/data-sources.md).

## 3. Usuarios y roles de producto

### Público

Puede consultar mapa, lugares, búsqueda, rutas disponibles y transporte público sin iniciar sesión. La ubicación del dispositivo es opcional y solo se consulta tras una acción expresa.

### Usuario registrado

Puede gestionar su cuenta, consultar y borrar sus datos y guardar favoritos privados. Los Sprints 6–7 amplían el alcance con el envío e historial privado de incidencias. La relación opcional con la UCM es un dato de perfil y no concede permisos de gestión.

### Gestor

El modelo de producto prevé revisar incidencias y mantener avisos o información de movilidad. La interfaz de gestión y la asignación de permisos todavía no están implementadas; sus primeros cortes aparecen en los planes de Sprints 8–11.

### Administrador

El modelo prevé administrar cuentas, roles, fuentes y configuración global. Es alcance futuro y debe estar protegido por autorización de servidor; no existe aún una aplicación administrativa implementada.

## 4. Principios del producto

- La información pública se puede consultar sin crear una cuenta.
- El uso de ubicación comienza tras una acción explícita; no hay seguimiento continuo.
- La aplicación conserva una alternativa textual cuando la información se presenta en un mapa.
- Los datos externos conservan fuente, licencia, fecha y ámbito cuando corresponda.
- Un dato desconocido no se presenta como confirmado, accesible, disponible o vigente.
- Las incidencias y sus evidencias son privadas por defecto; la publicación requiere revisión autorizada.
- La autorización se comprueba en el servidor, no solo ocultando controles en la interfaz.
- Los clientes públicos y la administración tienen propósitos y controles separados.
- Las dependencias externas se usan dentro de sus condiciones y límites documentados.
- La documentación de requisitos, arquitectura y datos se mantiene junto al código.

## 5. Plataformas

- **Android e iOS:** cliente móvil Expo/React Native con Expo Router y MapLibre React Native.
- **Navegador:** cliente público Expo Web/React Native Web con Leaflet en el mapa.
- **Administración:** cliente separado previsto en la arquitectura y en planes futuros; no está implementado.

El producto se ofrece en Android, iOS y web. La exportación web actual y la validación Android constan en los planes de Sprint; no se ha realizado validación nativa iOS en los Sprints 1–7 por falta de macOS/Xcode. La exportación del bundle iOS no sustituye un build nativo.

## 6. Estado del producto y límites de operación

Los incrementos de los Sprints 1–7 están incorporados a main mediante [PR #50](https://github.com/ddavid07/UniMovil/pull/50). Comprenden mapa y búsqueda, ubicación puntual y filtros, cliente web, rutas peatonales y transporte estático, recursos de movilidad, cuentas, favoritos e incidencias.

El desarrollo de cuentas e incidencias utiliza Supabase local y datos sintéticos. No existe una instancia Supabase remota configurada, SMTP gestionado ni un proceso institucional de moderación. La consulta pública de incidencias se verifica con datos sintéticos; no representa reportes reales. Las limitaciones restantes y los planes Sprints 8–13 se mantienen en el [Product Backlog](../backlog/product-backlog.md) y el [índice de Iterations](../iterations/README.md).

## 7. Documentos relacionados

- [Catálogo funcional](functional-catalog.md)
- [Historias de usuario](user-stories/README.md)
- [Product Backlog](../backlog/product-backlog.md)
- [Metodología de trabajo](../methodology/README.md)
- [Planes de Sprint](../iterations/README.md)
- [Decisiones de arquitectura](../adr/README.md)
- [Fuentes de datos](../development/data-sources.md)
