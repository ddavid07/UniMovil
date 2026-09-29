# Historias de usuario: rutas y transporte

## HU-020 — Introducir origen y destino

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero indicar un origen y un destino, para obtener una ruta dentro del campus.
- **Criterios de aceptación:**
  - El usuario puede introducir origen y destino mediante búsqueda.
  - Puede seleccionar ambos puntos desde el mapa.
  - Puede utilizar su ubicación actual como origen si concede permiso.
  - El sistema valida que ambos puntos sean válidos.
  - Si falta uno de los puntos, se informa de lo que debe completar.
- **Reglas y dependencias:** Las rutas están limitadas al campus de Moncloa y sus accesos definidos.

## HU-021 — Consultar una ruta a pie

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero obtener una ruta a pie, para llegar a mi destino de forma sencilla.
- **Criterios de aceptación:**
  - La ruta muestra un trazado sobre el mapa.
  - Muestra distancia y duración estimadas.
  - Incluye indicaciones ordenadas.
  - Tiene en cuenta caminos peatonales y accesos conocidos.
  - Si no existe una ruta válida, explica el motivo.
- **Reglas y dependencias:** La estimación depende de la calidad y actualización de los datos geográficos.

## HU-022 — Consultar rutas con diferentes medios

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero comparar rutas a pie, en bicicleta y en autobús, para elegir cómo desplazarme.
- **Criterios de aceptación:**
  - La aplicación muestra los medios disponibles para el trayecto.
  - Cada alternativa indica duración, distancia y transbordos si existen.
  - Las rutas en autobús incluyen el tramo a pie hasta y desde la parada.
  - Las opciones no disponibles se identifican claramente.
  - El usuario puede seleccionar una alternativa para ver sus detalles.
- **Reglas y dependencias:** Las opciones dependen de los datos disponibles para cada medio.

## HU-023 — Consultar indicaciones paso a paso

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero ver las instrucciones de una ruta, para seguirla sin interpretar el mapa constantemente.
- **Criterios de aceptación:**
  - Las instrucciones están ordenadas desde el origen hasta el destino.
  - Cada instrucción identifica el siguiente punto relevante.
  - El mapa resalta el tramo correspondiente a la instrucción seleccionada.
  - El usuario puede volver a consultar cualquier paso.
  - Las instrucciones indican los cambios de medio o de línea.
- **Reglas y dependencias:** Las indicaciones no sustituyen a un sistema de navegación de emergencia.

## HU-024 — Consultar una ruta accesible

- **Prioridad:** Alta
- **Historia:** Como persona con movilidad reducida, quiero calcular una ruta accesible, para evitar escaleras, obstáculos y accesos no adaptados.
- **Criterios de aceptación:**
  - El usuario puede activar la preferencia de ruta accesible.
  - La ruta evita los obstáculos catalogados.
  - La ruta identifica ascensores, rampas y entradas adaptadas.
  - Si no existe una ruta completamente accesible, la aplicación lo comunica.
  - Los datos desconocidos no se presentan como accesibles por defecto.
- **Reglas y dependencias:** Requiere información fiable sobre accesos, pendientes y obstáculos.

## HU-025 — Comparar y ajustar alternativas

- **Prioridad:** Media
- **Historia:** Como usuario, quiero elegir entre rutas rápidas, accesibles o con menos transbordos, para adaptar el desplazamiento a mis necesidades.
- **Criterios de aceptación:**
  - La aplicación ofrece alternativas cuando existen.
  - El usuario puede seleccionar una preferencia antes de calcular.
  - La alternativa seleccionada queda diferenciada.
  - El sistema explica de forma breve por qué una alternativa es distinta.
  - Si una preferencia no puede cumplirse, se informa antes de mostrar el resultado.
- **Reglas y dependencias:** Las preferencias se combinan con las restricciones activas del campus.

## HU-026 — Consultar una línea de autobús

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero consultar una línea de autobús que recorre el campus, para saber por dónde pasa y cuándo puedo utilizarla.
- **Criterios de aceptación:**
  - El usuario puede buscar una línea por nombre o número.
  - Se muestra su recorrido sobre el mapa.
  - Se muestran sus paradas ordenadas.
  - Se muestran horarios y días de servicio cuando estén disponibles.
  - Se indica la fuente y la fecha de actualización de la información.
- **Reglas y dependencias:** UniMovil no presume que los autobuses sean propiedad de la UCM; debe identificar al operador o fuente correspondiente.

## HU-027 — Consultar una parada

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero consultar una parada de autobús, para saber qué líneas pasan por ella.
- **Criterios de aceptación:**
  - La parada aparece en el mapa con su nombre y ubicación.
  - La ficha muestra las líneas asociadas.
  - Muestra próximos horarios cuando existan.
  - Permite iniciar una ruta hasta la parada.
  - Informa de cambios, cierres o incidencias activos.
- **Reglas y dependencias:** Una parada sin datos actualizados debe identificarse como tal.

## HU-028 — Consultar información en tiempo real

- **Prioridad:** Media
- **Historia:** Como usuario, quiero ver retrasos o llegadas estimadas, para decidir si espero al autobús o busco otra ruta.
- **Criterios de aceptación:**
  - La aplicación diferencia horario planificado y estimación en tiempo real.
  - Muestra la hora de última actualización.
  - Si la fuente deja de responder, muestra el último estado conocido como desactualizado o no lo muestra.
  - Los retrasos y cancelaciones se reflejan en la línea o parada correspondiente.
- **Reglas y dependencias:** Esta historia solo puede funcionar si el operador ofrece una fuente de datos compatible y autorizada.

## HU-029 — Guardar y consultar rutas recientes

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero guardar y repetir mis rutas habituales, para ahorrar tiempo al planificar desplazamientos frecuentes.
- **Criterios de aceptación:**
  - El usuario puede guardar una ruta con un nombre identificativo.
  - Puede consultar sus rutas guardadas y recientes.
  - Puede iniciar una ruta desde una ruta guardada.
  - Puede editar o eliminar una ruta guardada.
  - El sistema no guarda la ubicación continua del usuario como consecuencia de esta función.
- **Reglas y dependencias:** Depende de HU-020 y de las preferencias del usuario.
