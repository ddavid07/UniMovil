# Historias de usuario: accesibilidad y recursos de movilidad

## HU-040 — Configurar preferencias de accesibilidad

- **Prioridad:** Alta
- **Historia:** Como usuario con necesidades específicas de movilidad, quiero configurar mis preferencias, para que la aplicación adapte la información y las rutas.
- **Criterios de aceptación:**
  - El usuario puede indicar que necesita evitar escaleras.
  - Puede solicitar rutas para silla de ruedas u otras necesidades de movilidad.
  - Puede modificar o desactivar sus preferencias.
  - Las preferencias se aplican al calcular rutas y mostrar accesos.
  - Las preferencias no se hacen públicas.
- **Refinamiento Sprint 5:** Las preferencias se conservan solo durante la sesión actual y se borran al terminarla. La primera preferencia disponible es evitar escaleras; el criterio de silla de ruedas solo se ofrece cuando la red tiene atributos confirmados suficientes. No se envían a servicios externos.
- **Reglas y dependencias:** Las preferencias no sustituyen una valoración profesional ni garantizan que todos los datos del campus estén completos.

## HU-041 — Consultar accesos y servicios adaptados

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero saber qué edificios tienen accesos adaptados, para planificar mi entrada y desplazamiento.
- **Criterios de aceptación:**
  - La ficha de un edificio muestra sus accesos adaptados conocidos.
  - Se identifican rampas, ascensores y aseos adaptados cuando los datos existan.
  - Los accesos temporalmente fuera de servicio se muestran como afectados.
  - El usuario puede iniciar una ruta hacia un acceso concreto.
  - La aplicación diferencia entre información confirmada y no disponible.
- **Refinamiento Sprint 5:** Cada afirmación de accesibilidad muestra fuente y fecha de comprobación. Un acceso sin revisión autorizada se presenta como desconocido, no como adaptado.
- **Reglas y dependencias:** Los datos deben ser revisados por un gestor antes de publicarse como información oficial.

## HU-042 — Consultar aparcamientos

- **Prioridad:** Media
- **Historia:** Como usuario, quiero localizar aparcamientos y conocer sus condiciones, para decidir dónde estacionar.
- **Criterios de aceptación:**
  - El mapa muestra los aparcamientos registrados.
  - La ficha indica ubicación, acceso, horario y restricciones cuando estén disponibles.
  - Se identifican las plazas reservadas para personas con movilidad reducida.
  - El usuario puede calcular una ruta hasta el aparcamiento.
  - La aplicación indica si la disponibilidad es real, estimada o desconocida.
- **Refinamiento Sprint 5:** La disponibilidad se considera desconocida salvo que una fuente permita etiquetarla como real o estimada; la ubicación por sí sola no demuestra acceso, horario o plazas PMR.
- **Reglas y dependencias:** No se mostrará disponibilidad en tiempo real si no existe una fuente fiable.

## HU-043 — Consultar recursos para bicicletas y patinetes

- **Prioridad:** Media
- **Historia:** Como usuario que utiliza bicicleta o patinete, quiero localizar zonas autorizadas y aparcamientos, para estacionar de forma adecuada.
- **Criterios de aceptación:**
  - El mapa muestra aparcamientos y estaciones registradas.
  - Se diferencian los recursos para bicicletas de otras zonas.
  - La ficha muestra normas de uso cuando estén disponibles.
  - El usuario puede iniciar una ruta hasta el recurso.
  - Se pueden comunicar recursos dañados o inexistentes mediante una incidencia.
- **Refinamiento Sprint 5:** Las normas y autorizaciones se muestran solo con una fuente confirmada; los puntos de OSM no prueban por sí mismos que un espacio esté autorizado para estacionar.
- **Reglas y dependencias:** La aplicación no presenta como autorizada una zona cuya regulación no esté confirmada.

## HU-044 — Consultar puntos de carga y mantenimiento

- **Prioridad:** Baja
- **Historia:** Como usuario de un vehículo eléctrico o bicicleta, quiero localizar puntos de carga y reparación, para planificar mi desplazamiento.
- **Criterios de aceptación:**
  - El mapa muestra los puntos de carga y mantenimiento registrados.
  - La ficha indica tipo, ubicación y condiciones de uso cuando existan.
  - El usuario puede comprobar si el recurso está operativo cuando haya datos.
  - Puede calcular una ruta hasta el recurso.
  - La información desactualizada se identifica claramente.
- **Refinamiento Sprint 5:** Sin fuente que confirme tipo, condiciones y estado, esos campos se muestran como desconocidos o no disponibles, sin inferencia por coordenadas.
- **Reglas y dependencias:** La disponibilidad en tiempo real requiere integración con el proveedor del recurso.

## HU-045 — Consultar recursos cercanos por categoría

- **Prioridad:** Media
- **Historia:** Como usuario, quiero consultar recursos de movilidad cercanos, para encontrar rápidamente una parada, aparcamiento o acceso adaptado.
- **Criterios de aceptación:**
  - El usuario puede elegir una ubicación y una categoría.
  - Los recursos aparecen ordenados por distancia o relevancia.
  - Cada resultado muestra su estado conocido.
  - El usuario puede abrir el recurso, verlo en el mapa o iniciar una ruta.
- **Refinamiento Sprint 5:** El origen se elige entre un lugar conocido, un punto seleccionado en el mapa o la ubicación puntual si ya se concedió permiso. La ordenación muestra distancia geográfica aproximada y no la confunde con distancia de recorrido.
- **Reglas y dependencias:** Depende de la posición del recurso y de la información de estado disponible.
