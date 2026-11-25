# Historias de usuario: mapa, búsqueda y lugares

## HU-010 — Consultar el mapa del campus

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero ver un mapa interactivo del campus de Moncloa, para ubicarme y entender cómo se distribuyen sus espacios.
- **Criterios de aceptación:**
  - El mapa muestra los límites y elementos principales del campus.
  - El usuario puede acercar, alejar y desplazar el mapa.
  - Los elementos se muestran con símbolos y nombres comprensibles.
  - El mapa informa cuando no puede cargar los datos.
  - El mapa se adapta a distintos tamaños de pantalla.
- **Reglas y dependencias:** El mapa utilizará una fuente geográfica autorizada y deberá indicar sus condiciones de uso cuando sea necesario.

## HU-011 — Mostrar la ubicación actual

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero ver mi posición en el mapa, para saber dónde me encuentro dentro del campus.
- **Criterios de aceptación:**
  - La aplicación no solicita permiso al abrirse. Una acción visible y accesible inicia el flujo de ubicación.
  - Antes del diálogo del sistema, explica que obtiene una posición aproximada para mostrarla y centrar el mapa, que la conserva solo en memoria y que el proveedor cartográfico recibe solicitudes de teselas del área visible y puede inferir la zona consultada.
  - Si el permiso de primer plano está concedido, realiza una consulta puntual con precisión equilibrada, muestra un indicador identificable y centra el mapa en la posición obtenida.
  - La persona puede volver a centrar el mapa en esa posición mientras se conserva en memoria.
  - Si se deniega el permiso, puede continuar con el mapa manual. Si el sistema ya no permite volver a preguntar, se ofrece acceso a Ajustes.
  - Si los servicios de ubicación están desactivados o no se obtiene una posición válida, se explica el estado y se ofrece reintento cuando proceda.
  - Si la consulta no responde en 15 segundos, la pantalla deja de mostrar la carga y permite reintentar sin bloquear el mapa manual.
- **Reglas y dependencias:** No se solicita permiso de segundo plano, no se inicia seguimiento continuo y las coordenadas no se guardan en disco ni se envían directamente a una API o telemetría. El proveedor de teselas puede inferir el área visible a partir de las solicitudes cartográficas.

## HU-012 — Filtrar categorías del mapa

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero filtrar los elementos del mapa, para encontrar rápidamente el tipo de recurso que necesito.
- **Criterios de aceptación:**
  - La persona puede activar y desactivar edificios, transporte, aparcamientos, bicicletas, servicios y accesos.
  - Todas las categorías aparecen activas al abrir la pantalla.
  - El mapa y la lista textual aplican los filtros inmediatamente, sin recargar la pantalla.
  - Los marcadores identifican cada categoría con una letra y la leyenda muestra la letra y el nombre; la categoría no se comunica solo mediante el color.
  - Los controles anuncian el nombre y el estado activo/inactivo con tecnología de asistencia.
  - La persona puede restablecer todas las categorías. Si los filtros dejan el mapa o la lista sin lugares, aparece un estado vacío con una acción para restablecerlos.
  - La búsqueda conserva su alcance sobre todo el catálogo. Si se selecciona una sugerencia de una categoría desactivada, la aplicación activa la categoría, muestra el lugar y comunica el cambio de forma accesible.
- **Reglas y dependencias:** Los filtros operan en memoria sobre las categorías existentes en el catálogo local y no cambian los datos del catálogo ni persisten entre sesiones.

## HU-013 — Buscar lugares

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero buscar un edificio, servicio o punto de interés, para localizarlo sin recorrer todo el mapa.
- **Criterios de aceptación:**
  - El usuario puede buscar por nombre, categoría o texto relacionado.
  - La búsqueda muestra sugerencias mientras se escribe cuando existan coincidencias.
  - Los resultados indican nombre, categoría y distancia aproximada cuando sea posible.
  - Al seleccionar un resultado, se muestra su ubicación en el mapa.
  - Cuando no hay resultados, la aplicación ofrece un mensaje y una opción para modificar la búsqueda.
- **Reglas y dependencias:** La calidad de los resultados depende de que los nombres y alias estén correctamente mantenidos.

## HU-014 — Consultar la ficha de un lugar

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero consultar la información detallada de un lugar, para saber qué ofrece y cómo acceder a él.
- **Criterios de aceptación:**
  - La ficha muestra nombre, categoría y ubicación.
  - Muestra descripción, horario, contacto y enlaces oficiales cuando existan.
  - Muestra entradas y características de accesibilidad disponibles.
  - Permite iniciar una ruta hasta el lugar.
  - Permite guardar el lugar como favorito si el usuario ha iniciado sesión.
  - La ficha indica cuando un dato no está disponible o está temporalmente afectado.
- **Reglas y dependencias:** Solo se publican datos verificados o identificados como aportados por usuarios.

## HU-015 — Consultar servicios cercanos

- **Prioridad:** Media
- **Historia:** Como usuario, quiero ver los servicios cercanos a mi posición o a un lugar, para resolver necesidades durante mi desplazamiento.
- **Criterios de aceptación:**
  - El usuario puede seleccionar una ubicación de referencia.
  - Puede elegir una categoría de servicio.
  - Los resultados se ordenan por distancia o relevancia.
  - Cada resultado puede abrirse en el mapa o utilizarse como destino de una ruta.
  - La distancia se identifica como estimada cuando no sea exacta.
- **Reglas y dependencias:** Requiere que los puntos de interés tengan coordenadas válidas.

## HU-016 — Consultar cierres y restricciones en el mapa

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero ver cierres, obras y restricciones temporales, para evitar obstáculos durante mi desplazamiento.
- **Criterios de aceptación:**
  - Las zonas afectadas aparecen diferenciadas visualmente.
  - Al seleccionar una zona se muestra el motivo y el periodo de vigencia.
  - Los cierres caducados dejan de mostrarse como activos.
  - Las rutas consideran las restricciones activas cuando los datos lo permiten.
  - La aplicación indica cuándo se actualizó la información.
- **Reglas y dependencias:** Los gestores deben poder publicar y retirar restricciones.

## HU-017 — Compartir un lugar o una ubicación

- **Prioridad:** Media
- **Historia:** Como usuario, quiero compartir un lugar del campus, para poder indicar a otra persona dónde encontrarse o cómo llegar.
- **Criterios de aceptación:**
  - El usuario puede compartir la ficha o ubicación de un lugar.
  - El contenido compartido incluye un enlace o identificador que abre UniMovil cuando esté instalada.
  - Si la aplicación no está instalada, el enlace muestra una alternativa comprensible.
  - No se comparten datos privados del usuario.
- **Reglas y dependencias:** El formato de los enlaces debe ser estable para no romper enlaces compartidos.
