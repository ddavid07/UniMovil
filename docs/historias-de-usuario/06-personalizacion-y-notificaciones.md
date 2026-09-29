# Historias de usuario: personalización y notificaciones

## HU-060 — Guardar favoritos

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero guardar lugares, paradas y líneas como favoritos, para acceder a ellos rápidamente.
- **Criterios de aceptación:**
  - El usuario puede guardar un lugar, parada, línea o recurso compatible.
  - Puede consultar sus favoritos desde su cuenta.
  - Puede eliminar cualquier favorito.
  - Los favoritos se conservan al cerrar sesión y volver a entrar.
  - Si un elemento deja de estar disponible, se informa sin bloquear el resto de favoritos.
- **Reglas y dependencias:** Los favoritos son privados salvo que el usuario decida compartir un enlace público al elemento.

## HU-061 — Consultar búsquedas y rutas recientes

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero consultar mis búsquedas y rutas recientes, para repetir desplazamientos habituales.
- **Criterios de aceptación:**
  - La aplicación muestra elementos recientes ordenados por fecha.
  - El usuario puede repetir una búsqueda o ruta.
  - Puede eliminar elementos individuales o todo el historial.
  - El historial no se comparte con otros usuarios.
  - La aplicación informa si una ruta ya no puede calcularse con los datos actuales.
- **Reglas y dependencias:** La conservación del historial debe respetar las preferencias de privacidad.

## HU-062 — Configurar preferencias de movilidad

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero configurar mis preferencias de transporte, para recibir resultados adaptados a mis hábitos.
- **Criterios de aceptación:**
  - El usuario puede elegir medios preferidos.
  - Puede seleccionar preferencia por rapidez, accesibilidad o menos transbordos.
  - Puede modificar o restablecer las preferencias.
  - Las preferencias se utilizan al calcular rutas sin impedir consultar otras opciones.
  - Las preferencias se guardan de forma privada.
- **Reglas y dependencias:** Las preferencias generales de movilidad no sustituyen las preferencias específicas de accesibilidad.

## HU-063 — Configurar notificaciones

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero elegir qué notificaciones recibo, para recibir información útil sin saturarme.
- **Criterios de aceptación:**
  - El usuario puede activar o desactivar categorías de notificaciones.
  - Puede configurar un horario de silencio.
  - Puede elegir recibir avisos sobre favoritos, incidencias propias y alertas generales.
  - El sistema respeta tanto las preferencias de la cuenta como los permisos del dispositivo.
  - Los cambios se aplican sin afectar a otras preferencias.
- **Reglas y dependencias:** Las alertas críticas pueden tratarse de forma diferente según la política de la aplicación.

## HU-064 — Recibir una notificación relevante

- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero recibir avisos relevantes sobre mis rutas o servicios favoritos, para reaccionar a cambios de movilidad.
- **Criterios de aceptación:**
  - La notificación identifica claramente el motivo.
  - Al seleccionarla, abre el aviso, incidencia, línea o parada relacionada.
  - No se envía si el usuario ha desactivado esa categoría.
  - No se envían notificaciones duplicadas por el mismo evento.
  - Si el dispositivo no permite notificaciones, el aviso permanece disponible dentro de la aplicación.
- **Reglas y dependencias:** Requiere un servicio de notificaciones configurado y una fuente de eventos válida.

## HU-065 — Cambiar idioma y preferencias de presentación

- **Prioridad:** Baja
- **Historia:** Como usuario, quiero elegir el idioma y las unidades de la aplicación, para utilizarla de forma cómoda.
- **Criterios de aceptación:**
  - El usuario puede elegir entre los idiomas disponibles.
  - Puede elegir unidades de distancia y formato horario cuando proceda.
  - Los cambios se reflejan en las pantallas compatibles.
  - Los textos no traducidos se identifican durante las pruebas y no aparecen como contenido roto.
- **Reglas y dependencias:** El castellano será el idioma base de UniMovil.

## HU-066 — Compartir una ruta

- **Prioridad:** Media
- **Historia:** Como usuario, quiero compartir una ruta, para que otra persona pueda consultarla y llegar al mismo destino.
- **Criterios de aceptación:**
  - El usuario puede compartir origen, destino y medio seleccionado.
  - El enlace no expone el historial ni la identidad del usuario.
  - La ruta compartida se recalcula si los datos han cambiado.
  - Si el destino deja de estar disponible, se informa al abrir el enlace.
- **Reglas y dependencias:** El enlace compartido debe seguir funcionando aunque se actualicen los datos del mapa.
