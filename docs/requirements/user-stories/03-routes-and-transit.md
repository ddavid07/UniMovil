# Historias de usuario: rutas y transporte

## HU-020 — Introducir origen y destino

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero indicar un origen y un destino, para obtener una ruta dentro del campus.
- **Criterios de aceptación:**
  - **HU-020.1** El usuario puede introducir origen y destino mediante búsqueda.
  - **HU-020.2** Puede seleccionar ambos puntos desde el mapa.
  - **HU-020.3** Puede utilizar su ubicación actual como origen si concede permiso.
  - **HU-020.4** El sistema valida que ambos puntos sean válidos.
  - **HU-020.5** Si falta uno de los puntos, se informa de lo que debe completar.
- **Reglas y dependencias:** Las rutas están limitadas al campus de Moncloa y sus accesos definidos.

**Análisis INVEST:**

- **I · Independiente.** La selección y validación de origen y destino se puede probar con un grafo mínimo antes de incorporar alternativas multimodales o preferencias avanzadas.
- **N · Negociable.** Se puede acordar cómo intercambiar origen y destino o si se permite seleccionar un nodo directamente desde el mapa.
- **V · Valiosa.** Fija los extremos del desplazamiento de forma clara antes de lanzar el cálculo.
- **E · Estimable.** Validar cobertura dentro del campus, puntos faltantes y selección por búsqueda o mapa acota claramente el trabajo.
- **S · Pequeña.** Constituye una entrega pequeña centrada en entrada, selección y validación de extremos.
- **T · Comprobable.** Introducir origen válido sin destino para verificar el aviso, seleccionar ambos puntos dentro del alcance y probar un punto fuera de cobertura.

## HU-021 — Consultar una ruta a pie

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero obtener una ruta a pie, para llegar a mi destino de forma sencilla.
- **Criterios de aceptación:**
  - **HU-021.1** La ruta muestra un trazado sobre el mapa.
  - **HU-021.2** Muestra distancia y duración estimadas.
  - **HU-021.3** Incluye indicaciones ordenadas.
  - **HU-021.4** Tiene en cuenta caminos peatonales y accesos conocidos.
  - **HU-021.5** Si no existe una ruta válida, explica el motivo.
- **Reglas y dependencias:** La estimación depende de la calidad y actualización de los datos geográficos.

**Análisis INVEST:**

- **I · Independiente.** Funciona sobre el grafo peatonal local sin requerir cuentas, horarios EMT ni cálculo en tiempo real.
- **N · Negociable.** La velocidad media peatonal estimada y la presentación visual de la polilínea son ajustables con el Product Owner.
- **V · Valiosa.** Resuelve la necesidad principal de orientarse caminando entre dos facultades o paradas del campus.
- **E · Estimable.** Con la red peatonal local y los casos sin conexión en el grafo se estima con precisión.
- **S · Pequeña.** Calcular la ruta peatonal, dibujar el trazado, estimar distancia/duración y manejar error de grafo cabe en una iteración.
- **T · Comprobable.** Calcular una ruta entre dos facultades conectadas verificando trazado, metros y minutos estimados, y probar un par sin conexión válida.

## HU-022 — Consultar rutas con diferentes medios

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero comparar rutas a pie, en bicicleta y en autobús, para elegir cómo desplazarme.
- **Criterios de aceptación:**
  - **HU-022.1** La aplicación muestra los medios disponibles para el trayecto.
  - **HU-022.2** Cada alternativa indica duración, distancia y transbordos si existen.
  - **HU-022.3** Las rutas en autobús incluyen el tramo a pie hasta y desde la parada.
  - **HU-022.4** Las opciones no disponibles se identifican claramente.
  - **HU-022.5** El usuario puede seleccionar una alternativa para ver sus detalles.
- **Reglas y dependencias:** Las opciones dependen de los datos disponibles para cada medio.

**Análisis INVEST:**

- **I · Independiente.** Reutiliza los módulos de ruta a pie y transporte existentes; cada medio puede mostrarse como disponible o no disponible según sus datos.
- **N · Negociable.** Puede ajustarse cómo se comparan las tarjetas de alternativas y qué medios se marcan como no disponibles (por ejemplo bicicleta sin red propia).
- **V · Valiosa.** Permite valorar en una sola vista si compensa ir andando o combinar tramos a pie con autobús.
- **E · Estimable.** Acotar las combinaciones soportadas (a pie y autobús directo con tramos peatonales) y declarar explícitamente medios no cubiertos delimita el alcance.
- **S · Pequeña.** Se acota a comparar los medios soportados y mostrar estado no disponible cuando falten datos del medio.
- **T · Comprobable.** Consultar un trayecto con alternativa a pie y autobús verificando duración, transbordos y mensaje claro para bicicleta no calculada.

## HU-023 — Consultar indicaciones paso a paso

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero ver las instrucciones de una ruta, para seguirla sin interpretar el mapa constantemente.
- **Criterios de aceptación:**
  - **HU-023.1** Las instrucciones están ordenadas desde el origen hasta el destino.
  - **HU-023.2** Cada instrucción identifica el siguiente punto relevante.
  - **HU-023.3** El mapa resalta el tramo correspondiente a la instrucción seleccionada.
  - **HU-023.4** El usuario puede volver a consultar cualquier paso.
  - **HU-023.5** Las instrucciones indican los cambios de medio o de línea.
- **Reglas y dependencias:** Las indicaciones no sustituyen a un sistema de navegación de emergencia.

**Análisis INVEST:**

- **I · Independiente.** Depende de disponer de una ruta calculada con segmentos o pasos ordenados; no necesita cuentas ni GPS continuo.
- **N · Negociable.** El nivel de detalle textual de cada giro o tramo y el resaltado visual del paso seleccionado son negociables.
- **V · Valiosa.** Ofrece una alternativa textual estructurada y accesible frente a interpretar únicamente el trazado en el mapa.
- **E · Estimable.** Transformar los segmentos del enrutador en pasos seleccionables con sincronización al mapa acota bien el esfuerzo.
- **S · Pequeña.** Generar la lista ordenada de pasos y resaltar en el mapa el tramo elegido forma un corte manejable.
- **T · Comprobable.** Seleccionar el paso 2 de una ruta, comprobar el resaltado del tramo en mapa, volver al paso 1 y verificar cambios de medio cuando haya autobús.

## HU-024 — Consultar una ruta accesible

- **Prioridad:** Alta
- **Historia:** Como persona con movilidad reducida, quiero calcular una ruta accesible, para evitar escaleras, obstáculos y accesos no adaptados.
- **Criterios de aceptación:**
  - **HU-024.1** El usuario puede activar la preferencia de ruta accesible.
  - **HU-024.2** Puede elegir evitar escaleras; puede solicitar criterios de silla de ruedas cuando los tramos y accesos dispongan de los atributos confirmados necesarios.
  - **HU-024.3** La ruta solo se presenta como accesible si todos los atributos críticos de tramos y accesos están confirmados y satisfacen las preferencias.
  - **HU-024.4** La ruta identifica ascensores, rampas y entradas adaptadas únicamente cuando hay información confirmada.
  - **HU-024.5** Si no existe una ruta que cumpla los criterios, hay cobertura insuficiente o algún atributo crítico es desconocido, se explica que no puede determinarse una ruta accesible.
  - **HU-024.6** Una ruta peatonal normal puede seguir consultándose, pero nunca se etiqueta como accesible por defecto.
- **Reglas y dependencias:** Requiere información fiable sobre accesos, pendientes y obstáculos.

**Análisis INVEST:**

- **I · Independiente.** El corte seguro de filtrado de escaleras y verificación de certeza de atributos se apoya en el enrutador y el ADR-0017; la validación real completa depende de datos confirmados de campo.
- **N · Negociable.** Se puede acordar la forma de explicar qué atributos faltan y cómo ofrecer la ruta peatonal ordinaria sin etiquetarla como accesible.
- **V · Valiosa.** Evita prometer falsamente una ruta adaptada cuando la cartografía no certifica pendientes, ascensores o continuidad.
- **E · Estimable.** Distinguir el corte seguro implementado (evitar escaleras conocidas y advertir incertidumbre) de la historia completa con atributos confirmados permite estimarlo sin ambigüedad.
- **S · Pequeña.** Conviene separar el filtro conservador de atributos desconocidos de la futura incorporación de datos verificados de campo en el panel de gestión.
- **T · Comprobable.** Activar preferencia accesible en tramos sin atributos confirmados y comprobar que no se marca como accesible aunque permita consultar la ruta normal.

## HU-025 — Comparar y ajustar alternativas

- **Prioridad:** Media
- **Historia:** Como usuario, quiero elegir entre rutas rápidas, accesibles o con menos transbordos, para adaptar el desplazamiento a mis necesidades.
- **Criterios de aceptación:**
  - **HU-025.1** La aplicación ofrece alternativas cuando existen.
  - **HU-025.2** El usuario puede seleccionar una preferencia antes de calcular.
  - **HU-025.3** La alternativa seleccionada queda diferenciada.
  - **HU-025.4** El sistema explica de forma breve por qué una alternativa es distinta.
  - **HU-025.5** Si una preferencia no puede cumplirse, se informa antes de mostrar el resultado.
- **Reglas y dependencias:** Las preferencias se combinan con las restricciones activas del campus.

**Análisis INVEST:**

- **I · Independiente.** Opera sobre las rutas ya calculadas por los motores a pie y en autobús; se puede probar sin persistir perfil.
- **N · Negociable.** Pueden ajustarse los criterios de ordenación, desempate y textos explicativos entre alternativas.
- **V · Valiosa.** Ayuda a elegir la mejor opción según prioridad personal de tiempo, transbordos o accesibilidad disponible.
- **E · Estimable.** Los tres modos de preferencia y el aviso cuando una preferencia no puede satisfacerse acotan el alcance.
- **S · Pequeña.** Aplicar filtros/ordenación sobre el conjunto de alternativas devuelto cabe en una iteración.
- **T · Comprobable.** Elegir preferencia de menos transbordos o menor distancia, comparar explicación diferencial y probar un caso donde la preferencia no pueda cumplirse.

## HU-026 — Consultar una línea de autobús

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero consultar una línea de autobús que recorre el campus, para saber por dónde pasa y cuándo puedo utilizarla.
- **Criterios de aceptación:**
  - **HU-026.1** El usuario puede buscar una línea por nombre o número.
  - **HU-026.2** Se muestra su recorrido sobre el mapa.
  - **HU-026.3** Se muestran sus paradas ordenadas.
  - **HU-026.4** Se muestran horarios y días de servicio cuando estén disponibles.
  - **HU-026.5** Se indica la fuente y la fecha de actualización de la información.
- **Reglas y dependencias:** UniMovil no presume que los autobuses sean propiedad de la UCM; debe identificar al operador o fuente correspondiente.

**Análisis INVEST:**

- **I · Independiente.** Se apoya en el snapshot GTFS local de EMT sin necesitar cuentas ni tiempo real.
- **N · Negociable.** Se puede acordar cómo agrupar sentidos/cabeceras y resumir franjas horarias en pantalla pequeña.
- **V · Valiosa.** Permite consultar de un vistazo el recorrido, todas las paradas ordenadas y horarios programados de líneas del campus.
- **E · Estimable.** Con el conjunto GTFS importado, el buscador de líneas, mapa, paradas ordenadas y atribución de fuente delimitan el esfuerzo.
- **S · Pequeña.** Consultar ficha de línea estática con mapa, paradas y horarios programados forma un corte autocontenido.
- **T · Comprobable.** Buscar una línea por número, comprobar paradas ordenadas y horarios según tipo de día y verificar fecha y fuente EMT visibles.

## HU-027 — Consultar una parada

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero consultar una parada de autobús, para saber qué líneas pasan por ella.
- **Criterios de aceptación:**
  - **HU-027.1** La parada aparece en el mapa con su nombre y ubicación.
  - **HU-027.2** La ficha muestra las líneas asociadas.
  - **HU-027.3** Muestra próximos horarios cuando existan.
  - **HU-027.4** Permite iniciar una ruta hasta la parada.
  - **HU-027.5** Informa de cambios, cierres o incidencias activos.
- **Reglas y dependencias:** Una parada sin datos actualizados debe identificarse como tal.

**Análisis INVEST:**

- **I · Independiente.** Puede probarse con el catálogo de paradas GTFS y sus líneas asociadas antes de integrar avisos en tiempo real.
- **N · Negociable.** Puede acordarse cuántos próximos horarios programados se muestran y el enlace hacia la fuente oficial de avisos EMT.
- **V · Valiosa.** Facilita comprobar desde una parada concreta qué líneas paran allí y cómo llegar caminando hasta ella.
- **E · Estimable.** Los campos de la ficha de parada, la relación inversa con líneas y la acción de ruta hacia la parada acotan la tarea.
- **S · Pequeña.** Ficha de parada con líneas, horarios programados e inicio de ruta cabe como corte propio junto a HU-026.
- **T · Comprobable.** Seleccionar una parada compartida entre líneas, verificar líneas asociadas y horarios programados y lanzar ruta hacia la parada.

## HU-028 — Consultar información en tiempo real

- **Prioridad:** Media
- **Historia:** Como usuario, quiero ver retrasos o llegadas estimadas, para decidir si espero al autobús o busco otra ruta.
- **Criterios de aceptación:**
  - **HU-028.1** La aplicación diferencia horario planificado y estimación en tiempo real.
  - **HU-028.2** Muestra la hora de última actualización.
  - **HU-028.3** Si la fuente deja de responder, muestra el último estado conocido como desactualizado o no lo muestra.
  - **HU-028.4** Los retrasos y cancelaciones se reflejan en la línea o parada correspondiente.
- **Reglas y dependencias:** Esta historia solo puede funcionar si el operador ofrece una fuente de datos compatible y autorizada.

**Análisis INVEST:**

- **I · Independiente.** Su ejecución real depende de una fuente autorizada de tiempo real externa hoy fuera del horizonte inmediato; el tratamiento en UI puede modelarse con contratos simulados solo cuando la fuente exista.
- **N · Negociable.** Se puede acordar el intervalo de refresco y a partir de cuántos minutos se marca una estimación como obsoleta.
- **V · Valiosa.** Evitaría esperas innecesarias cuando haya retrasos o supresiones respecto al horario estático.
- **E · Estimable.** No es estimable con precisión definitiva hasta confirmar contrato técnico, cuota y autorización de la API externa del operador.
- **S · Pequeña.** Conviene acotarla tras confirmar fuente oficial, separando ingesta/caché de presentación en parada y línea.
- **T · Comprobable.** Diferenciar visualmente horario programado vs tiempo real y comprobar degradación controlada al simular caída de la fuente.

## HU-029 — Guardar rutas habituales

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero guardar y repetir mis rutas habituales, para ahorrar tiempo al planificar desplazamientos frecuentes.
- **Criterios de aceptación:**
  - **HU-029.1** El usuario puede guardar una ruta con un nombre identificativo.
  - **HU-029.2** Puede consultar la lista de rutas que ha guardado.
  - **HU-029.3** Puede iniciar una ruta desde una ruta guardada.
  - **HU-029.4** Puede editar o eliminar una ruta guardada.
  - **HU-029.5** El sistema no guarda la ubicación continua del usuario como consecuencia de esta función.
- **Reglas y dependencias:** Depende de HU-020 y de las preferencias del usuario.

**Análisis INVEST:**

- **I · Independiente.** Depende de autenticación (Sprint 6) y cálculo de rutas (HU-020), pero puede implementarse sin notificaciones ni compartir enlaces.
- **N · Negociable.** Se puede acordar si se guarda también el modo preferido junto a origen/destino y el límite máximo por cuenta.
- **V · Valiosa.** Ahorra repetir origen y destino en trayectos diarios entre metro y facultades.
- **E · Estimable.** CRUD autenticado por propietario (origen, destino, etiqueta, medio) y recálculo al pulsar repetir delimitan claramente el esfuerzo.
- **S · Pequeña.** Cabe en una entrega vertical con persistencia API, lista en cuenta/rutas y edición o borrado.
- **T · Comprobable.** Guardar una ruta personalizada, recargar sesión, repetir el cálculo, renombrarla, eliminarla y comprobar aislamiento entre cuentas.
