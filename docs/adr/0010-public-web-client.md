# ADR-0010: cliente público web

- **Estado:** Aceptada
- **Fecha:** 2026-11-24
- **Decisores:** Equipo UniMovil
- **Sustituye parcialmente:** ADR-0001, solo en la exclusión de una web pública para estudiantes

## Contexto

ADR-0001 estableció aplicaciones nativas Android/iOS y excluyó una web pública. Se ha cambiado ese alcance: estudiantes, visitantes y otras personas deben poder consultar UniMovil desde un navegador. La aplicación nativa sigue formando parte del producto y la administración sigue siendo un cliente separado.

## Decisión

- UniMovil ofrecerá un cliente público accesible desde navegadores web además de las aplicaciones nativas Android e iOS.
- El cliente web ofrecerá los flujos públicos de mapa, búsqueda y consulta de información sin exigir una cuenta ni permiso de ubicación. La ubicación del navegador, si se ofrece, requiere una acción expresa y permiso del navegador; denegarla no bloquea la consulta manual.
- Las funciones públicas planificadas para los Sprints 3–13 deberán incluir una experiencia web equivalente cuando sean aplicables. El Sprint 1 y el Sprint 2 quedan como incrementos móviles locales ya cerrados; esta decisión no los reabre ni afirma que exista ya un cliente web.
- El cliente público web no se confundirá con `apps/admin`, que conserva su propósito y control de acceso propios.
- La estrategia adoptada para el primer incremento se concreta en [ADR-0011](0011-public-web-client-and-map-renderer.md): Expo Web estático, React Native Web y Leaflet en navegador, con MapLibre en móvil. La exportación web forma parte de CI. La primera comprobación automatizada cubre Chromium de escritorio y ventana estrecha; no representa todavía una matriz completa de navegadores.

## Alternativas consideradas

- **Mantener solo Android/iOS:** rechazada porque no cumple el nuevo alcance solicitado de acceso desde navegador.
- **Tratar la web administrativa como cliente público:** rechazada porque sus permisos, datos y tareas son distintos.
- **Compartir o separar la implementación de interfaz web:** pendiente de comparación en el Sprint 3, incluyendo Expo Web, componentes web específicos o una aplicación pública separada. Esta ADR no anticipa el resultado.

## Consecuencias

- HU-099 y el Sprint 3 incorporan la base y el primer flujo público web: mapa, búsqueda y consulta textual, además de los servicios/rutas que se seleccionen en ese Sprint.
- Los Sprints 4–12 deberán actualizar los flujos públicos que amplían para que también funcionen en navegador. Los cambios administrativos continuarán en la aplicación administrativa separada.
- El Sprint 13 verificará la experiencia web en la matriz aceptada, incluidos diseño adaptable, teclado, tecnologías de asistencia, estados de error y carga, seguridad de sesión cuando corresponda y CI.
- Se mantienen como trabajo de calidad la ampliación de pruebas entre navegadores y lectoras de pantalla, la decisión futura de sesión, la privacidad de ubicación y la selección de proveedor de teselas de producción. No se presupone soporte de notificaciones web, ubicación automática ni uso offline.
- La PR histórica [#45](https://github.com/ddavid07/UniMovil/pull/45) puede aportar referencias para la investigación técnica; no forma parte de `main` en la fotografía consultada al planificar y su código no se considera aprobado ni reutilizado automáticamente.

## Referencias

- [ADR-0001: plataformas y alcance de producto](0001-product-platform-and-scope.md)
- [HU-099: consultar UniMovil desde un navegador web](../user-stories/09-public-web-client.md)
- [Plan del Sprint 3](../iterations/sprint-03/README.md)
