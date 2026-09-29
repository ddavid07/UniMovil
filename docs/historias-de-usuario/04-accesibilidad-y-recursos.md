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
- **Reglas y dependencias:** La disponibilidad en tiempo real requiere integración con el proveedor del recurso.

## HU-045 — Consultar recursos cercanos por categoría

- **Prioridad:** Media
- **Historia:** Como usuario, quiero consultar recursos de movilidad cercanos, para encontrar rápidamente una parada, aparcamiento o acceso adaptado.
- **Criterios de aceptación:**
  - El usuario puede elegir una ubicación y una categoría.
  - Los recursos aparecen ordenados por distancia o relevancia.
  - Cada resultado muestra su estado conocido.
  - El usuario puede abrir el recurso, verlo en el mapa o iniciar una ruta.
- **Reglas y dependencias:** Depende de la posición del recurso y de la información de estado disponible.
