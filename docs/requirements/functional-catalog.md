# Catálogo funcional de UniMovil

## 1. Descripción del producto

UniMovil ofrece una experiencia pública para orientarse por el Campus de Moncloa y consultar lugares, rutas y transporte. El catálogo registra las capacidades del producto junto con su estado actual: implementado y publicado, parcialmente disponible, propuesto o no disponible por falta de fuente o verificación.

Los Sprints 1–7 están incorporados a main mediante [PR #50](https://github.com/ddavid07/UniMovil/pull/50). Las funcionalidades futuras no se consideran implementadas por aparecer en una historia o plan de Sprint.

## 2. Tipos de usuario

### 2.1. Público

- Consultar el mapa, buscar lugares y ver resultados en una lista alternativa.
- Consultar rutas y horarios disponibles sin registrarse.
- Solicitar ubicación puntual opcionalmente.
- **Estado:** las capacidades públicas incluidas en los Sprints 1–5 están implementadas y publicadas; sus límites se detallan en las historias y planes enlazados.

### 2.2. Usuario registrado

- Crear, recuperar y eliminar una cuenta.
- Consultar el perfil propio y guardar favoritos privados.
- Comunicar incidencias y consultar su historial.
- **Estado:** las capacidades implementadas de cuenta, favoritos e incidencias se probaron localmente con Supabase y datos sintéticos y se publicaron. No hay servicio de producción configurado.

### 2.3. Gestor de movilidad

- Revisar incidencias y mantener datos o avisos cuando exista autorización.
- **Estado:** rol previsto. La aplicación administrativa y la moderación se proponen en Sprints 8–11.

### 2.4. Administrador

- Administrar roles, fuentes y configuración global.
- **Estado:** rol previsto; el panel y sus operaciones aún no están implementados.

## 3. Registro, acceso y cuenta

**Historias relacionadas:** HU-001–007, HU-090–093.
**Estado:** corte implementado en el Sprint 6.

- La consulta pública de mapa y búsqueda no exige cuenta.
- El flujo de cuenta incluye registro, inicio y cierre de sesión, recuperación, consulta y modificación del perfil mínimo y eliminación.
- La identidad y autenticación usan Supabase Auth; NestJS valida las solicitudes privadas y aplica autorización.
- La sesión nativa se guarda con Expo SecureStore. La sesión web usa un BFF NestJS y cookie segura; los tokens de renovación se protegen en servidor.
- Los favoritos se asocian a la cuenta y persisten entre sesiones.
- Las pruebas utilizan el stack Supabase local y usuarios sintéticos. No se configuraron servicio remoto, SMTP gestionado ni cuentas de producción.

## 4. Mapa del Campus de Moncloa

**Historias relacionadas:** HU-010–012, HU-016.
**Estado:** mapa base, delimitación aproximada, marcadores, atribución, controles y filtros implementados; los avisos y cierres del campus son futuros.

- Mostrar un mapa interactivo con movimiento, zoom y recuadre del campus.
- Dibujar el polígono de cobertura y los lugares del catálogo.
- Mantener visible la atribución cartográfica.
- Activar y desactivar categorías de lugares.
- Solicitar ubicación puntual solo después de una acción y conservar el mapa manual si se deniega el permiso.
- No presentar la cobertura OSM como linde oficial.
- No precargar ni descargar teselas; el mapa base no ofrece uso offline.
- HU-016 —cierres y restricciones— está propuesta para el Sprint 9.

## 5. Búsqueda y consulta de lugares

**Historias relacionadas:** HU-013–017.
**Estado:** búsqueda local y selección implementadas; las capacidades de una ficha dependen de los datos confirmados.

- Buscar por nombre, categoría y términos asociados disponibles en el catálogo.
- Mostrar sugerencias y un estado comprensible sin coincidencias.
- Seleccionar un resultado para centrar y resaltar su marcador.
- Ofrecer una lista textual que no depende exclusivamente del mapa.
- Mostrar la información disponible sin inferir horarios, entradas, accesibilidad o servicios que la fuente no confirma.
- Los enlaces compartidos y otras funciones de lugares no incluidos en los incrementos publicados siguen sujetos al backlog.

## 6. Puntos de interés y servicios

**Historias relacionadas:** HU-010, HU-014–015, HU-041–045.
**Estado:** catálogo local publicado; cobertura y datos variables según fuente.

El catálogo contiene 20 puntos de referencia derivados de OpenStreetMap, comprobados el 23 de noviembre de 2026. Incluye edificios y lugares universitarios, servicios, transporte, aparcamientos, bicicletas y accesos cartografiados. Cada registro conserva metadatos de fuente, licencia y fecha.

- Consultar los lugares del catálogo en mapa y lista.
- Filtrar categorías y abrir un punto como referencia o destino.
- Consultar recursos cercanos desde una ubicación elegida; la distancia geográfica aproximada se distingue de la distancia de una ruta.
- No se infieren operación, disponibilidad, horario, entrada o accesibilidad a partir de una geometría o etiqueta OSM.
- La gestión del catálogo, las categorías y sus fuentes se propone para los Sprints 10–11.

## 7. Planificación de rutas

**Historias relacionadas:** HU-020–025, HU-029, HU-040, HU-024.
**Estado:** rutas peatonales locales y alternativa directa de autobús implementadas; varias modalidades no están disponibles o siguen pendientes.

- Elegir origen y destino mediante búsqueda o selección en mapa.
- Calcular rutas peatonales sobre el grafo local de OpenStreetMap con Dijkstra.
- Mostrar distancia y duración como estimaciones, instrucciones ordenadas y el tramo asociado a cada paso.
- Si no existe cobertura o conectividad, comunicar que la ruta no está disponible; no dibujar una conexión recta como si fuera camino.
- El grafo conecta un punto con la red solo cuando el nodo más próximo está dentro del límite documentado de 100 metros.
- Comparar una alternativa directa de autobús con tramos peatonales cuando los horarios y conexiones la respaldan.
- No se ofrecen transbordos calculados, red ciclista verificada ni navegación giro a giro en tiempo real.
- HU-024 no se cierra: una preferencia para evitar escaleras conocidas no basta para afirmar que una ruta sea accesible.

## 8. Transporte público y autobuses

**Historias relacionadas:** HU-022, HU-025–028.
**Estado:** horarios programados y consulta de líneas/paradas implementados; operación en tiempo real no disponible.

- Consultar el snapshot GTFS oficial de EMT Madrid con 25 líneas y 65 paradas del campus.
- Mostrar líneas, sentidos, recorridos, paradas ordenadas, calendario y salidas programadas.
- Mostrar fuente, licencia y fecha de actualización.
- Consultar paradas en el mapa y utilizarlas en el planificador.
- Ofrecer una conexión de autobús directa solo cuando la fuente y los tramos a pie la respaldan.
- Los horarios son programados; no representan llegadas, retrasos o posiciones en tiempo real.
- No se copian ni sincronizan avisos operativos de EMT; la interfaz enlaza con la fuente oficial.
- HU-028 depende de una fuente autorizada y de la clave requerida por el servicio ETA; permanece fuera del horizonte actual.

## 9. Aparcamiento y estacionamiento

**Historias relacionadas:** HU-042.
**Estado:** se muestran puntos cartografiados donde existen; condiciones y disponibilidad no están verificadas.

- Consultar puntos de aparcamiento incluidos en el catálogo.
- Mostrar su ubicación y procedencia.
- No afirmar disponibilidad de plazas, horario, autorización de acceso, plazas adaptadas ni condiciones de uso sin una fuente confirmada.
- La administración y actualización de estos datos se propone para el Sprint 10.

## 10. Bicicletas, patinetes y movilidad personal

**Historias relacionadas:** HU-022, HU-043–044.
**Estado:** consulta de recursos cartografiados con certeza explícita; ruta ciclista no disponible.

- Consultar recursos para bicicletas o movilidad personal incluidos en el catálogo.
- Mostrar estados desconocidos cuando no haya confirmación de operación o disponibilidad.
- No calcular rutas en bicicleta: no existe una red y unos criterios de circulación verificados para ofrecerlas.
- La incorporación de fuentes confirmadas depende del refinamiento de los datos y del Sprint 10.

## 11. Accesibilidad y movilidad adaptada

**Historias relacionadas:** HU-024, HU-040–045.
**Estado:** preferencia de sesión y tratamiento de certeza implementados; ruta accesible no demostrada.

- Consultar recursos con fuente, fecha, ámbito y estado de certeza.
- Distinguir atributos confirmados, desconocidos, no disponibles o afectados.
- Aplicar durante la sesión la preferencia disponible para evitar tramos cartografiados como escaleras.
- No presentar una ruta como accesible para silla de ruedas si faltan atributos confirmados de cualquier tramo o acceso crítico.
- HU-024 permanece abierta hasta disponer de un recorrido real respaldado por atributos confirmados.
- OpenStreetMap se trata como fuente cartográfica comunitaria, no como certificación institucional de accesibilidad.

## 12. Incidencias, problemas y sugerencias

**Historias relacionadas:** HU-050–056.
**Estado:** envío privado, evidencias, historial propio y consulta pública minimizada implementados; gestión institucional pendiente.

- Una persona registrada puede enviar una incidencia con categoría, descripción, prioridad percibida opcional y ubicación seleccionada manualmente.
- La incidencia empieza privada y en estado operativo «received».
- Se permiten hasta tres imágenes por incidencia, de hasta 5 MiB cada una; la API valida el contenido, elimina metadatos EXIF y guarda los archivos en Storage privado.
- El acceso a evidencias pasa por la API autenticada y comprueba la propiedad de la incidencia.
- La persona puede consultar su historial. La vista pública usa una proyección minimizada de registros que estén publicados.
- Las pruebas de feed público utilizan una fixture sintética; no representa una incidencia real.
- No se ha implementado el panel de moderación ni existe un proceso institucional de publicación. Su primer corte está propuesto para el Sprint 8.

## 13. Avisos y comunicaciones

**Historias relacionadas:** HU-016, HU-057–059.
**Estado:** gestión de avisos del campus no implementada; propuesta para el Sprint 9.

- La aplicación no mantiene actualmente un ciclo de creación, programación y publicación de avisos propios del campus.
- Las incidencias operativas de EMT se consultan desde el enlace oficial, no mediante una copia local.
- La propuesta de Sprint 9 contempla avisos con fuente, zona, vigencia, publicación autorizada y retirada trazable.

## 14. Notificaciones

**Historias relacionadas:** HU-063–064.
**Estado:** no implementadas; propuestas para el Sprint 12.

El proyecto no envía notificaciones push. Su diseño depende de una decisión aceptada sobre proveedor, permisos, eventos de origen, seguridad, retención y compatibilidad web/móvil, además del refinamiento de las historias.

## 15. Personalización del usuario

**Historias relacionadas:** HU-029, HU-060–066.
**Estado:** favoritos persistentes implementados; otras preferencias y funciones guardadas son futuras.

- Guardar y eliminar favoritos privados de lugares y recursos en una cuenta.
- Mantener navegación pública disponible sin iniciar sesión.
- Preferencias de accesibilidad de Sprint 5 limitadas a la sesión.
- Historial de rutas y búsquedas, rutas guardadas, enlaces compartidos, notificaciones y preferencias de presentación están propuestos para Sprint 12.

## 16. Área de administración y gestión de contenidos

**Historias relacionadas:** HU-054–059, HU-070–080.
**Estado:** no existe una aplicación administrativa implementada.

- La revisión y transición autorizada de incidencias y su auditoría se proponen para Sprint 8.
- La publicación de avisos del campus se propone para Sprint 9.
- La gestión de lugares, categorías, accesibilidad y permisos se propone para Sprint 10.
- La importación y supervisión de fuentes y transporte se propone para Sprint 11.
- Ningún cliente público recibe borradores ni debe poder conceder roles de gestión.

## 17. Estadísticas y análisis

**Historias relacionadas:** HU-078–079.
**Estado:** no implementado y fuera del horizonte actual.

No se recogen estadísticas de uso ni se exportan informes. Cualquier capacidad futura requiere justificar finalidad, minimización, acceso y retención antes de priorizarla.

## 18. Integraciones y fuentes de información

**Estado:** integraciones locales trazables; los servicios de producción no están configurados.

- OpenStreetMap aporta el catálogo, la delimitación aproximada, el grafo peatonal y las teselas raster, con licencias y fechas documentadas.
- EMT Madrid aporta el snapshot GTFS estático usado para recorridos, paradas y horarios.
- Supabase local proporciona Auth, PostgreSQL/PostGIS y Storage para desarrollo y pruebas sintéticas.
- NestJS expone las operaciones privadas y las integraciones de negocio.
- No hay una instancia Supabase remota configurada ni una clave ETA de EMT en el cliente.
- La fuente de cada recurso se mantiene separada del proveedor de teselas; los límites y fechas se actualizan en [Fuentes de datos](../development/data-sources.md).

## 19. Seguridad, privacidad y control de datos

**Historias relacionadas:** HU-001–007, HU-090–093, HU-050–053.
**Estado:** controles de cuenta e incidencias implementados y comprobados localmente; operación real no configurada.

- La consulta pública no requiere cuenta ni permiso de ubicación.
- La ubicación se consulta bajo demanda, se mantiene en memoria y no se envía directamente a servicios de rutas.
- La API valida la identidad y aplica autorización por propietario y rol.
- Los clientes no contienen claves administrativas ni credenciales de servicio.
- En móvil se utiliza almacenamiento seguro del sistema; la sesión web se media con cookie segura y BFF.
- Las incidencias empiezan privadas; las evidencias se guardan en un bucket privado.
- Las pruebas utilizan identidades y datos sintéticos, no reportes personales reales.
- La política de operación con datos reales, titularidad del servicio, SMTP, retención y moderación institucional sigue pendiente.

## 20. Experiencia de uso y soporte

**Historias relacionadas:** HU-094–098.
**Estado:** estados básicos accesibles, lista textual y cliente web publicados; resiliencia y preparación integral de versión futuras.

- La interfaz incluye estados de carga, error recuperable, reintento y ausencia de resultados en los flujos cubiertos.
- La lista de resultados ofrece una alternativa textual al mapa.
- El cliente web se comprobó con Chromium en ventanas de 1280 × 800 y 390 × 844.
- Esa comprobación no certifica Firefox, Safari, Edge ni todos los lectores de pantalla.
- No se ofrece uso offline del mapa base.
- Ayuda y soporte, actualización resiliente y preparación de versión están propuestos para el Sprint 13.

## Documentación relacionada

- [Fundamentos del producto](product-foundations.md)
- [Historias de usuario y criterios de aceptación](user-stories/README.md)
- [Product Backlog](../backlog/product-backlog.md)
- [Planes de Sprint](../iterations/README.md)
- [Decisiones arquitectónicas](../adr/README.md)
- [Fuentes de datos y atribuciones](../development/data-sources.md)
