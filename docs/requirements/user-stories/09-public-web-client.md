# HU-099 — Consultar UniMovil desde un navegador web

- **Prioridad:** por acordar en el Product Backlog
- **Estado:** implementada localmente en Sprint 3; verificación Chromium y exportación web registradas en el plan del Sprint
- **Relación:** decisión de alcance en [ADR-0010](../../adr/0010-public-web-client.md)

## Historia

Como estudiante o visitante, quiero consultar UniMovil desde el navegador de mi ordenador o móvil, para orientarme por el Campus de Moncloa sin instalar la aplicación.

## Criterios de aceptación

- **CA-099.1** El cliente público puede abrirse en los navegadores y tamaños de ventana definidos en la matriz de compatibilidad del Sprint 3 y adapta su presentación a pantalla de escritorio y móvil.
- **CA-099.2** Se puede consultar el mapa del campus, buscar lugares públicos, filtrar categorías, seleccionar un resultado y consultar los resultados también como contenido textual.
- **CA-099.3** La consulta de información pública no exige cuenta ni permiso de ubicación.
- **CA-099.4** Si el producto ofrece ubicación del navegador, solo la obtiene tras una acción explícita y la autorización del navegador. Si se deniega o no está disponible, mapa, búsqueda y selección manual siguen utilizables.
- **CA-099.5** La información pública utiliza los contratos y fuentes de datos comunes aprobados para el producto; no expone borradores, datos personales ni funciones administrativas.
- **CA-099.6** La interfaz proporciona navegación por teclado, nombres accesibles, foco visible, estados comprensibles de carga, error y ausencia de resultados, y una alternativa textual a la información cartográfica.
- **CA-099.7** El mapa mantiene visible su atribución y las limitaciones de la fuente cartográfica, conforme a los ADR y a `docs/development/data-sources.md`.

## Reglas y dependencias

- La estrategia inicial de cliente, renderizador cartográfico y matriz de compatibilidad está en [ADR-0011](../../adr/0011-public-web-client-and-map-renderer.md); la comprobación automatizada actual cubre Chromium de escritorio y ventana estrecha.
- HU-099 establece el primer acceso web y el flujo base de mapa/búsqueda; las capacidades web de rutas, transporte, cuentas, incidencias y demás funciones se implementan con sus historias y Sprints respectivos.
- La historia no implica notificaciones web, funcionamiento sin conexión del mapa, geolocalización continua ni publicación externa.
- La aplicación administrativa no forma parte de esta experiencia pública.

## Análisis INVEST

- **I · Independiente.** Puede desplegarse y validarse sobre el catálogo público y el renderizador web definidos en ADR-0010 y ADR-0011 sin esperar a cuentas ni administración.
- **N · Negociable.** Los puntos de corte entre escritorio y móvil, así como la progresiva incorporación de capacidades de Sprints posteriores en web, son ajustables con el Product Owner.
- **V · Valiosa.** Permite orientarse por el Campus de Moncloa desde cualquier navegador sin necesidad de instalar una aplicación nativa.
- **E · Estimable.** Los flujos base de mapa, búsqueda, filtros, atribución y la matriz de tamaños (`1280×800` y `390×844`) acotan con claridad el alcance.
- **S · Pequeña.** Se limita al acceso público base de mapa y búsqueda en navegador, dejando rutas, transporte, cuentas e incidencias para sus Sprints respectivos.
- **T · Comprobable.** Exportar el bundle web y recorrer mapa, búsqueda, filtros, teclado, alternativa textual y atribución en Chromium de escritorio y ventana estrecha.
