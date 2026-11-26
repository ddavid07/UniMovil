# Historias de usuario: mapa, búsqueda y lugares

## HU-010 — Consultar el mapa del campus

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero ver un mapa interactivo del campus de Moncloa, para ubicarme y entender cómo se distribuyen sus espacios.
- **Criterios de aceptación:**
  - **HU-010.1** El mapa muestra los límites y elementos principales del campus.
  - **HU-010.2** El usuario puede acercar, alejar y desplazar el mapa.
  - **HU-010.3** Los elementos se muestran con símbolos y nombres comprensibles.
  - **HU-010.4** El mapa informa cuando no puede cargar los datos.
  - **HU-010.5** El mapa se adapta a distintos tamaños de pantalla.
- **Reglas y dependencias:** El mapa utilizará una fuente geográfica autorizada y deberá indicar sus condiciones de uso cuando sea necesario.

**Análisis INVEST:**

- **I · Independiente.** Con un catálogo local y la delimitación del campus se puede probar sin GPS, cuentas ni cálculo de rutas.
- **N · Negociable.** La simbología, nivel de zoom inicial y alternativa textual se pueden ajustar con el equipo.
- **V · Valiosa.** Permite situar facultades, paradas y servicios dentro del Campus de Moncloa desde la apertura inicial.
- **E · Estimable.** Delimitar el área del campus, los gestos de navegación, la atribución y los tamaños de pantalla permite acotar el esfuerzo.
- **S · Pequeña.** Un visor del campus con desplazamiento, zoom, atribución y aviso ante fallo de carga constituye un primer corte completo.
- **T · Comprobable.** Desplazar y ampliar el mapa, verificar la atribución visible y forzar un fallo de carga para comprobar el mensaje y reintento.

## HU-011 — Mostrar la ubicación actual

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero ver mi posición en el mapa, para saber dónde me encuentro dentro del campus.
- **Criterios de aceptación:**
  - **HU-011.1** La aplicación no solicita permiso al abrirse. Una acción visible y accesible inicia el flujo de ubicación.
  - **HU-011.2** Antes del diálogo del sistema, explica que obtiene una posición aproximada para mostrarla y centrar el mapa, que la conserva solo en memoria y que el proveedor cartográfico recibe solicitudes de teselas del área visible y puede inferir la zona consultada.
  - **HU-011.3** Si el permiso de primer plano está concedido, realiza una consulta puntual con precisión equilibrada, muestra un indicador identificable y centra el mapa en la posición obtenida.
  - **HU-011.4** La persona puede volver a centrar el mapa en esa posición mientras se conserva en memoria.
  - **HU-011.5** Si se deniega el permiso, puede continuar con el mapa manual. Si el sistema ya no permite volver a preguntar, se ofrece acceso a Ajustes.
  - **HU-011.6** Si los servicios de ubicación están desactivados o no se obtiene una posición válida, se explica el estado y se ofrece reintento cuando proceda.
  - **HU-011.7** Si la consulta no responde en 15 segundos, la pantalla deja de mostrar la carga y permite reintentar sin bloquear el mapa manual.
- **Reglas y dependencias:** No se solicita permiso de segundo plano, no se inicia seguimiento continuo y las coordenadas no se guardan en disco ni se envían directamente a una API o telemetría. El proveedor de teselas puede inferir el área visible a partir de las solicitudes cartográficas.

**Análisis INVEST:**

- **I · Independiente.** Solo depende del mapa base y de la API de permisos en primer plano; no requiere buscador ni rutas.
- **N · Negociable.** Se puede ajustar la redacción del aviso previo, el icono de posición y la ubicación del botón de centrado.
- **V · Valiosa.** Ayuda a orientarse en el punto exacto donde se encuentra la persona respetando su privacidad.
- **E · Estimable.** Los estados de permiso, el timeout de 15 segundos y la ausencia de persistencia delimitan exactamente la lógica.
- **S · Pequeña.** Se acota a consulta puntual en primer plano y gestión explícita de denegación, error y reintento.
- **T · Comprobable.** Rechazar el aviso previo, denegar el permiso, probar el enlace a ajustes, provocar expiración de consulta y verificar centrado tras conceder permiso.

## HU-012 — Filtrar categorías del mapa

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero filtrar los elementos del mapa, para encontrar rápidamente el tipo de recurso que necesito.
- **Criterios de aceptación:**
  - **HU-012.1** La persona puede activar y desactivar edificios, transporte, aparcamientos, bicicletas, servicios y accesos.
  - **HU-012.2** Todas las categorías aparecen activas al abrir la pantalla.
  - **HU-012.3** El mapa y la lista textual aplican los filtros inmediatamente, sin recargar la pantalla.
  - **HU-012.4** Los marcadores identifican cada categoría con una letra y la leyenda muestra la letra y el nombre; la categoría no se comunica solo mediante el color.
  - **HU-012.5** Los controles anuncian el nombre y el estado activo/inactivo con tecnología de asistencia.
  - **HU-012.6** La persona puede restablecer todas las categorías. Si los filtros dejan el mapa o la lista sin lugares, aparece un estado vacío con una acción para restablecerlos.
  - **HU-012.7** La búsqueda conserva su alcance sobre todo el catálogo. Si se selecciona una sugerencia de una categoría desactivada, la aplicación activa la categoría, muestra el lugar y comunica el cambio de forma accesible.
- **Reglas y dependencias:** Los filtros operan en memoria sobre las categorías existentes en el catálogo local y no cambian los datos del catálogo ni persisten entre sesiones.

**Análisis INVEST:**

- **I · Independiente.** Opera en memoria sobre el catálogo cargado; solo interactúa con la búsqueda para reactivar categorías ocultas al elegir resultado.
- **N · Negociable.** Se puede ajustar el diseño de los controles de filtro, la leyenda y el mensaje accesible de reactivación.
- **V · Valiosa.** Reduce el ruido visual en el mapa y facilita localizar rápidamente un tipo concreto de recurso.
- **E · Estimable.** Las seis categorías, la leyenda no dependiente del color, el estado vacío y la regla de reactivación acotan el trabajo.
- **S · Pequeña.** Filtrado en memoria sincronizado entre mapa, lista textual y buscador cabe en una sola iteración.
- **T · Comprobable.** Desactivar todas las categorías para verificar el estado vacío, restablecer, comprobar letras en leyenda y seleccionar una sugerencia de categoría oculta.

## HU-013 — Buscar lugares

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero buscar un edificio, servicio o punto de interés, para localizarlo sin recorrer todo el mapa.
- **Criterios de aceptación:**
  - **HU-013.1** El usuario puede buscar por nombre, categoría o texto relacionado.
  - **HU-013.2** La búsqueda muestra sugerencias mientras se escribe cuando existan coincidencias.
  - **HU-013.3** Los resultados indican nombre, categoría y distancia aproximada cuando sea posible.
  - **HU-013.4** Al seleccionar un resultado, se muestra su ubicación en el mapa.
  - **HU-013.5** Cuando no hay resultados, la aplicación ofrece un mensaje y una opción para modificar la búsqueda.
- **Reglas y dependencias:** La calidad de los resultados depende de que los nombres y alias estén correctamente mantenidos.

**Análisis INVEST:**

- **I · Independiente.** Se puede probar con el catálogo local y alias conocidos sin depender de rutas ni cuentas.
- **N · Negociable.** El criterio de ordenación de coincidencias y el número máximo de sugerencias pueden ajustarse.
- **V · Valiosa.** Permite localizar una facultad o parada por nombre o alias sin explorar todo el campus a mano.
- **E · Estimable.** La normalización textual, los alias del catálogo y los casos sin coincidencias delimitan el esfuerzo.
- **S · Pequeña.** Un flujo de búsqueda textual con sugerencias, selección y estado vacío forma un corte vertical claro.
- **T · Comprobable.** Buscar un término con y sin tildes, seleccionar una sugerencia para centrar el mapa y probar una consulta sin coincidencias.

## HU-014 — Consultar la ficha de un lugar

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero consultar la información detallada de un lugar, para saber qué ofrece y cómo acceder a él.
- **Criterios de aceptación:**
  - **HU-014.1** La ficha muestra nombre, categoría y ubicación.
  - **HU-014.2** Muestra descripción, horario, contacto y enlaces oficiales cuando existan.
  - **HU-014.3** Muestra entradas y características de accesibilidad disponibles.
  - **HU-014.4** Permite iniciar una ruta hasta el lugar.
  - **HU-014.5** Con una sesión iniciada, permite guardar el lugar como favorito.
  - **HU-014.6** La ficha indica cuando un dato no está disponible o está temporalmente afectado.
- **Reglas y dependencias:** Solo se publican datos verificados o identificados como aportados por usuarios.

**Análisis INVEST:**

- **I · Independiente.** La ficha informativa se apoya en un lugar del catálogo; las acciones de ruta y favorito se conectan con sus módulos respectivos.
- **N · Negociable.** Puede ajustarse la jerarquía visual de campos disponibles y cómo se indican datos desconocidos.
- **V · Valiosa.** Reúne en un solo punto los datos útiles del edificio o servicio antes de iniciar el desplazamiento.
- **E · Estimable.** Los campos disponibles del catálogo, sus estados vacíos/no verificados y las dos acciones principales acotan la ficha.
- **S · Pequeña.** Mostrar datos disponibles y desconocidos constituye el núcleo; la acción de favoritos se enlaza con la autenticación.
- **T · Comprobable.** Abrir una ficha con datos parciales, verificar indicación explícita de datos no disponibles, iniciar ruta y probar favorito con y sin sesión.

## HU-015 — Consultar servicios cercanos

- **Prioridad:** Media
- **Historia:** Como usuario, quiero ver los servicios cercanos a mi posición o a un lugar, para resolver necesidades durante mi desplazamiento.
- **Criterios de aceptación:**
  - **HU-015.1** El usuario puede seleccionar una ubicación de referencia.
  - **HU-015.2** Puede elegir una categoría de servicio.
  - **HU-015.3** Los resultados se ordenan por distancia o relevancia.
  - **HU-015.4** Cada resultado puede abrirse en el mapa o utilizarse como destino de una ruta.
  - **HU-015.5** La distancia se identifica como estimada cuando no sea exacta.
- **Reglas y dependencias:** Requiere que los puntos de interés tengan coordenadas válidas.

**Análisis INVEST:**

- **I · Independiente.** Funciona con coordenadas de lugares y categorías existentes, incluso sin permiso GPS seleccionando un lugar de referencia.
- **N · Negociable.** Se puede acordar la fórmula de distancia estimada, el radio o el desempate en ordenación.
- **V · Valiosa.** Permite encontrar rápidamente el recurso más próximo desde donde se está o alrededor de otro edificio.
- **E · Estimable.** Elegir referencia, filtrar categoría, calcular distancia estimada y ordenar resultados acotan la tarea.
- **S · Pequeña.** Cabe como un panel o consulta acotada conectada al mapa y al destino de ruta.
- **T · Comprobable.** Elegir un edificio de referencia y una categoría, comprobar el orden creciente por distancia estimada y abrir un resultado en mapa o ruta.

## HU-016 — Consultar cierres y restricciones en el mapa

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero ver cierres, obras y restricciones temporales, para evitar obstáculos durante mi desplazamiento.
- **Criterios de aceptación:**
  - **HU-016.1** Las zonas afectadas aparecen diferenciadas visualmente.
  - **HU-016.2** Al seleccionar una zona se muestra el motivo y el periodo de vigencia.
  - **HU-016.3** Los cierres caducados dejan de mostrarse como activos.
  - **HU-016.4** Las rutas consideran las restricciones activas cuando los datos lo permiten.
  - **HU-016.5** La aplicación indica cuándo se actualizó la información.
- **Reglas y dependencias:** Los gestores deben poder publicar y retirar restricciones.

**Análisis INVEST:**

- **I · Independiente.** La visualización de zonas activas requiere restricciones con vigencia; su efecto en cálculo depende del motor de rutas.
- **N · Negociable.** Se puede acordar la representación visual de zonas cerradas y el umbral tras el que expiran.
- **V · Valiosa.** Evita desplazamientos hacia pasos cortados u obras activas en el campus.
- **E · Estimable.** Exige definir esquema geométrico, vigencia temporal, aviso textual y regla de expiración.
- **S · Pequeña.** Conviene entregar primero la visualización con vigencia y después la integración con el enrutador si la geometría está validada.
- **T · Comprobable.** Probar una restricción activa y otra caducada, verificar que solo la activa aparece y consultar motivo, fecha de vigencia y actualización.

## HU-017 — Compartir un lugar o una ubicación

- **Prioridad:** Media
- **Historia:** Como usuario, quiero compartir un lugar del campus, para poder indicar a otra persona dónde encontrarse o cómo llegar.
- **Criterios de aceptación:**
  - **HU-017.1** El usuario puede compartir la ficha o ubicación de un lugar.
  - **HU-017.2** El contenido compartido incluye un enlace o identificador que abre UniMovil cuando esté instalada.
  - **HU-017.3** Si la aplicación no está instalada, el enlace muestra una alternativa comprensible.
  - **HU-017.4** No se comparten datos privados del usuario.
- **Reglas y dependencias:** El formato de los enlaces debe ser estable para no romper enlaces compartidos.

**Análisis INVEST:**

- **I · Independiente.** Solo necesita identificadores públicos estables de lugares y rutas de enlace profundo o web; no depende de cuentas.
- **N · Negociable.** Se puede acordar el formato de URL compartida y el contenido del resumen textual al compartir.
- **V · Valiosa.** Facilita quedar o indicar un edificio exacto del campus con un enlace directo.
- **E · Estimable.** El esquema de parámetros de enlace y la apertura en web/app delimitan la implementación.
- **S · Pequeña.** Acotar el enlace al identificador del lugar público forma una entrega pequeña y directa.
- **T · Comprobable.** Generar enlace desde un lugar, abrirlo en navegador/app comprobando que abre el lugar correcto y que no incluye datos personales.
