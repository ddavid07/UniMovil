# Historias de usuario: accesibilidad y recursos de movilidad

## HU-040 — Configurar preferencias de accesibilidad

- **Prioridad:** Alta
- **Historia:** Como usuario con necesidades específicas de movilidad, quiero configurar mis preferencias, para que la aplicación adapte la información y las rutas.
- **Criterios de aceptación:**
  - **HU-040.1** El usuario puede indicar que necesita evitar escaleras.
  - **HU-040.2** Puede solicitar rutas para silla de ruedas u otras necesidades de movilidad.
  - **HU-040.3** Puede modificar o desactivar sus preferencias.
  - **HU-040.4** Las preferencias se aplican al calcular rutas y mostrar accesos.
  - **HU-040.5** Las preferencias no se hacen públicas.
- **Refinamiento Sprint 5:** Las preferencias se conservan solo durante la sesión actual y se borran al terminarla. La primera preferencia disponible es evitar escaleras; el criterio de silla de ruedas solo se ofrece cuando la red tiene atributos confirmados suficientes. No se envían a servicios externos.
- **Reglas y dependencias:** Las preferencias no sustituyen una valoración profesional ni garantizan que todos los datos del campus estén completos.

**Análisis INVEST:**

- **I · Independiente.** La configuración en memoria durante la sesión no requiere cuenta persistente ni base de datos, solo el motor de rutas y accesos.
- **N · Negociable.** Puede ajustarse cómo se agrupan las opciones disponibles frente a las pendientes de cobertura verificada.
- **V · Valiosa.** Adapta resultados a necesidades concretas sin obligar a registrarse ni exponer datos sensibles.
- **E · Estimable.** Activar, desactivar, aplicar al cálculo de sesión y mantener fuera de servidor delimitan el trabajo.
- **S · Pequeña.** Primer corte centrado en evitar escaleras en sesión; criterios más exigentes se activan cuando exista cobertura verificada.
- **T · Comprobable.** Activar evitar escaleras, recalcular una ruta con escaleras conocidas, desactivarlo y comprobar que vuelve a considerarse y no se persiste fuera de sesión.

## HU-041 — Consultar accesos y servicios adaptados

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero saber qué edificios tienen accesos adaptados, para planificar mi entrada y desplazamiento.
- **Criterios de aceptación:**
  - **HU-041.1** La ficha de un edificio muestra sus accesos adaptados conocidos.
  - **HU-041.2** Se identifican rampas, ascensores y aseos adaptados cuando los datos existan.
  - **HU-041.3** Los accesos temporalmente fuera de servicio se muestran como afectados.
  - **HU-041.4** El usuario puede iniciar una ruta hacia un acceso concreto.
  - **HU-041.5** La aplicación diferencia entre información confirmada y no disponible.
- **Refinamiento Sprint 5:** Cada afirmación de accesibilidad muestra fuente y fecha de comprobación. Un acceso sin revisión autorizada se presenta como desconocido, no como adaptado.
- **Reglas y dependencias:** Los datos deben ser revisados por un gestor antes de publicarse como información oficial.

**Análisis INVEST:**

- **I · Independiente.** La visualización de accesos y estados de certeza depende solo del modelo de lugares y ADR-0017; la actualización editorial llega en Sprint 10.
- **N · Negociable.** Se puede acordar la forma visual de mostrar fuente, fecha y estado desconocido frente a confirmado o afectado.
- **V · Valiosa.** Evita desplazamientos en balde mostrando con honestidad qué está confirmado y qué es desconocido.
- **E · Estimable.** Mostrar atributos con fuente, fecha, estado desconocido e inicio de ruta acota con precisión la ficha.
- **S · Pequeña.** Lectura de accesos con etiquetas de certeza en la ficha y ruta hasta el punto forma una entrega acotada.
- **T · Comprobable.** Abrir un lugar con acceso desconocido y otro con atributo de fuente conocida, verificar etiquetas explícitas y lanzar ruta hacia el recurso.

## HU-042 — Consultar aparcamientos

- **Prioridad:** Media
- **Historia:** Como usuario, quiero localizar aparcamientos y conocer sus condiciones, para decidir dónde estacionar.
- **Criterios de aceptación:**
  - **HU-042.1** El mapa muestra los aparcamientos registrados.
  - **HU-042.2** La ficha indica ubicación, acceso, horario y restricciones cuando estén disponibles.
  - **HU-042.3** Se identifican las plazas reservadas para personas con movilidad reducida.
  - **HU-042.4** El usuario puede calcular una ruta hasta el aparcamiento.
  - **HU-042.5** La aplicación indica si la disponibilidad es real, estimada o desconocida.
- **Refinamiento Sprint 5:** La disponibilidad se considera desconocida salvo que una fuente permita etiquetarla como real o estimada; la ubicación por sí sola no demuestra acceso, horario o plazas PMR.
- **Reglas y dependencias:** No se mostrará disponibilidad en tiempo real si no existe una fuente fiable.

**Análisis INVEST:**

- **I · Independiente.** Funciona con el catálogo local de aparcamientos sin esperar a sensores ni panel de administración.
- **N · Negociable.** El detalle de campos secundarios y la etiqueta de disponibilidad desconocida pueden ajustarse en la ficha.
- **V · Valiosa.** Permite ubicar zonas de estacionamiento y conocer sus condiciones reales sin inducir a error sobre plazas libres.
- **E · Estimable.** Mostrar ubicación, campos opcionales con procedencia, estado desconocido de disponibilidad y ruta de llegada acota la historia.
- **S · Pequeña.** Cabe como tipo específico de recurso de movilidad conectado al filtro, ficha y planificador.
- **T · Comprobable.** Abrir un aparcamiento desde mapa o panel de recursos, verificar disponibilidad marcada como desconocida si no hay fuente e iniciar ruta hacia él.

## HU-043 — Consultar recursos para bicicletas y patinetes

- **Prioridad:** Media
- **Historia:** Como usuario que utiliza bicicleta o patinete, quiero localizar zonas autorizadas y aparcamientos, para estacionar de forma adecuada.
- **Criterios de aceptación:**
  - **HU-043.1** El mapa muestra aparcamientos y estaciones registradas.
  - **HU-043.2** Se diferencian los recursos para bicicletas de otras zonas.
  - **HU-043.3** La ficha muestra normas de uso cuando estén disponibles.
  - **HU-043.4** El usuario puede iniciar una ruta hasta el recurso.
  - **HU-043.5** Se pueden comunicar recursos dañados o inexistentes mediante una incidencia.
- **Refinamiento Sprint 5:** Las normas y autorizaciones se muestran solo con una fuente confirmada; los puntos de OSM no prueban por sí mismos que un espacio esté autorizado para estacionar.
- **Reglas y dependencias:** La aplicación no presenta como autorizada una zona cuya regulación no esté confirmada.

**Análisis INVEST:**

- **I · Independiente.** La consulta y diferenciación visual funcionan de forma autónoma sobre el catálogo; reportar incidencia enlaza con HU-050 cuando haya sesión.
- **N · Negociable.** Se puede ajustar la presentación de normas desconocidas y el enlace contextual hacia el formulario de incidencias.
- **V · Valiosa.** Ayuda a encontrar aparcabicis y estaciones registradas sin confundir puntos cartográficos con zonas oficialmente autorizadas.
- **E · Estimable.** Marcador diferenciado, ficha con certeza de normas, ruta y acceso a incidencia delimitan claramente el alcance.
- **S · Pequeña.** Consulta de recursos de micromovilidad con estado de autorización conocido o desconocido constituye un corte manejable.
- **T · Comprobable.** Filtrar categoría bicicletas, consultar ficha verificando no afirmar autorización sin fuente, iniciar ruta y verificar enlace de reporte.

## HU-044 — Consultar puntos de carga y mantenimiento

- **Prioridad:** Baja
- **Historia:** Como usuario de un vehículo eléctrico o bicicleta, quiero localizar puntos de carga y reparación, para planificar mi desplazamiento.
- **Criterios de aceptación:**
  - **HU-044.1** El mapa muestra los puntos de carga y mantenimiento registrados.
  - **HU-044.2** La ficha indica tipo, ubicación y condiciones de uso cuando existan.
  - **HU-044.3** El usuario puede comprobar si el recurso está operativo cuando haya datos.
  - **HU-044.4** Puede calcular una ruta hasta el recurso.
  - **HU-044.5** La información desactualizada se identifica claramente.
- **Refinamiento Sprint 5:** Sin fuente que confirme tipo, condiciones y estado, esos campos se muestran como desconocidos o no disponibles, sin inferencia por coordenadas.
- **Reglas y dependencias:** La disponibilidad en tiempo real requiere integración con el proveedor del recurso.

**Análisis INVEST:**

- **I · Independiente.** Depende únicamente del inventario de recursos de movilidad y la ficha de estado/certeza; no requiere integraciones en tiempo real.
- **N · Negociable.** Puede ajustarse cómo se agrupan puntos de carga frente a columnas de mantenimiento y el aviso de información desactualizada.
- **V · Valiosa.** Permite localizar puntos registrados de recarga o reparación indicando si su estado está confirmado o es desconocido.
- **E · Estimable.** Los campos opcionales, la marca de antigüedad/desactualizado y el botón de ruta hacen directa su estimación.
- **S · Pequeña.** Se integra con el mismo patrón de recursos de movilidad y ficha con estado conocido o desconocido.
- **T · Comprobable.** Abrir un punto de carga/mantenimiento sin estado en tiempo real y comprobar que marca estado desconocido, muestra fecha/fuente y permite trazar ruta.

## HU-045 — Consultar recursos cercanos por categoría

- **Prioridad:** Media
- **Historia:** Como usuario, quiero consultar recursos de movilidad cercanos, para encontrar rápidamente una parada, aparcamiento o acceso adaptado.
- **Criterios de aceptación:**
  - **HU-045.1** El usuario puede elegir una ubicación y una categoría.
  - **HU-045.2** Los recursos aparecen ordenados por distancia o relevancia.
  - **HU-045.3** Cada resultado muestra su estado conocido.
  - **HU-045.4** El usuario puede abrir el recurso, verlo en el mapa o iniciar una ruta.
- **Refinamiento Sprint 5:** El origen se elige entre un lugar conocido, un punto seleccionado en el mapa o la ubicación puntual si ya se concedió permiso. La ordenación muestra distancia geográfica aproximada y no la confunde con distancia de recorrido.
- **Reglas y dependencias:** Depende de la posición del recurso y de la información de estado disponible.

**Análisis INVEST:**

- **I · Independiente.** Reutiliza el cálculo de distancia aproximada sobre coordenadas locales y los recursos ya catalogados sin depender de GPS obligatorio.
- **N · Negociable.** Se puede acordar la selección de punto de referencia en mapa, el radio visible y el texto de distancia aproximada.
- **V · Valiosa.** Centraliza la búsqueda rápida de aparcamientos, accesos adaptados, paradas o bicicletas cerca de un punto del campus.
- **E · Estimable.** Elección de referencia (lugar, mapa o ubicación puntual), filtro por categoría, estado de certeza y tres acciones forman un bloque bien acotado.
- **S · Pequeña.** Cabe en un panel o vista unificada de recursos cercanos por categoría.
- **T · Comprobable.** Seleccionar una referencia y categoría de movilidad, comprobar ordenación por distancia aproximada, estado visible y acciones de abrir ficha, mapa y ruta.
