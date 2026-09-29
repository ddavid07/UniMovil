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
  - La aplicación solicita permiso antes de acceder a la ubicación.
  - Si el permiso está concedido, muestra la posición aproximada del dispositivo.
  - El usuario puede centrar el mapa en su posición.
  - Si no hay permiso, se puede seguir utilizando el mapa manualmente.
  - Si la ubicación no está disponible, se muestra un mensaje claro.
- **Reglas y dependencias:** La ubicación se utiliza para la función solicitada y no se almacena de forma permanente por defecto.

## HU-012 — Filtrar categorías del mapa

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero filtrar los elementos del mapa, para encontrar rápidamente el tipo de recurso que necesito.
- **Criterios de aceptación:**
  - El usuario puede activar y desactivar categorías.
  - Las categorías incluyen edificios, transporte, aparcamientos, bicicletas, servicios y accesos.
  - El mapa actualiza los elementos visibles sin reiniciar la pantalla.
  - El usuario puede restablecer los filtros.
  - La leyenda explica los símbolos de las categorías activas.
- **Reglas y dependencias:** Las categorías se gestionan desde el área administrativa.

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
