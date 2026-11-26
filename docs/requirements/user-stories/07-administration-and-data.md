# Historias de usuario: administración y datos

## HU-070 — Gestionar edificios y lugares

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero crear, modificar y desactivar lugares del campus, para mantener actualizado el mapa.
- **Criterios de aceptación:**
  - El gestor puede crear un lugar con nombre, categoría, coordenadas y descripción.
  - Puede editar sus datos y accesos.
  - Puede desactivarlo sin eliminar su historial.
  - El sistema valida coordenadas, categorías y campos obligatorios.
  - Los cambios se reflejan en las consultas públicas una vez publicados.
- **Reglas y dependencias:** Los elementos desactivados no aparecen en búsquedas activas ni en rutas nuevas.

## HU-071 — Gestionar puntos y categorías

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero administrar categorías y puntos de interés, para organizar la información del campus.
- **Criterios de aceptación:**
  - El gestor puede crear, editar y desactivar categorías.
  - Puede asignar icono, nombre y descripción a una categoría.
  - No puede eliminar una categoría que tenga elementos sin reasignarlos.
  - Puede ordenar las categorías visibles.
  - Los cambios quedan registrados.
- **Reglas y dependencias:** Las categorías deben tener nombres comprensibles y no duplicados.

## HU-072 — Gestionar transporte y paradas

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero mantener líneas, paradas y horarios, para ofrecer información fiable sobre los autobuses.
- **Criterios de aceptación:**
  - El gestor puede crear y editar líneas, paradas y recorridos.
  - Puede asociar paradas a líneas y ordenar el recorrido.
  - Puede registrar horarios y días de servicio.
  - Puede marcar datos como provisionales, confirmados o desactualizados.
  - Puede desactivar una línea o parada temporalmente.
- **Reglas y dependencias:** Los datos importados deben conservar su fuente y fecha de actualización.

## HU-073 — Gestionar accesibilidad

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero actualizar los datos de accesibilidad, para que las rutas adaptadas se basen en información fiable.
- **Criterios de aceptación:**
  - El gestor puede registrar rampas, ascensores, accesos y obstáculos.
  - Puede indicar el estado operativo de cada recurso.
  - Puede establecer fechas de revisión o caducidad.
  - Puede asociar una restricción temporal a un recurso.
  - La aplicación conserva quién y cuándo actualizó el dato.
- **Reglas y dependencias:** Los datos no confirmados no deben mostrarse como garantía de accesibilidad.

## HU-074 — Importar datos externos

- **Prioridad:** Media
- **Historia:** Como administrador, quiero importar datos de fuentes autorizadas, para reducir la actualización manual de información de movilidad.
- **Criterios de aceptación:**
  - El administrador puede configurar una fuente y su formato.
  - El sistema valida la estructura antes de aplicar los datos.
  - Los errores de importación se muestran con información suficiente para corregirlos.
  - La importación no elimina datos válidos por un error parcial.
  - Se conserva la fuente, fecha y resultado de cada importación.
- **Reglas y dependencias:** Solo se utilizarán fuentes cuyo uso esté permitido y sea trazable.

## HU-075 — Consultar el estado de los datos

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero conocer cuándo se actualizó cada dato, para detectar información obsoleta.
- **Criterios de aceptación:**
  - Cada conjunto de datos muestra fecha de última actualización.
  - Se identifica si procede de una fuente externa o de una edición manual.
  - El sistema marca datos con errores o que superen su periodo de validez.
  - El gestor puede filtrar datos desactualizados.
  - Los usuarios ven una indicación comprensible cuando un dato no está actualizado.
- **Reglas y dependencias:** Cada tipo de dato debe tener un periodo de validez definido.

## HU-076 — Gestionar usuarios y roles

- **Prioridad:** Alta
- **Historia:** Como administrador, quiero gestionar cuentas y roles, para controlar quién puede administrar la plataforma.
- **Criterios de aceptación:**
  - El administrador puede buscar usuarios.
  - Puede activar, bloquear o desactivar una cuenta según la política definida.
  - Puede asignar o retirar los roles de gestor y administrador.
  - Las acciones administrativas quedan registradas.
  - Ningún administrador puede retirar accidentalmente el último acceso administrativo sin una confirmación adicional.
- **Reglas y dependencias:** Los roles no se asignan basándose únicamente en el tipo de usuario declarado durante el registro.

## HU-077 — Consultar auditoría administrativa

- **Prioridad:** Media
- **Historia:** Como administrador, quiero consultar los cambios administrativos, para saber quién modificó la información y cuándo.
- **Criterios de aceptación:**
  - El registro incluye usuario, fecha, acción y elemento afectado.
  - Permite filtrar por usuario, tipo de acción y periodo.
  - No permite modificar ni borrar registros desde la interfaz ordinaria.
  - No expone contraseñas, tokens ni secretos.
  - Se conserva información suficiente para investigar cambios.
- **Reglas y dependencias:** El periodo de conservación debe definirse conforme a la política de la plataforma.

## HU-078 — Consultar estadísticas de uso

- **Prioridad:** Media
- **Historia:** Como gestor, quiero consultar estadísticas agregadas, para conocer las necesidades de movilidad del campus.
- **Criterios de aceptación:**
  - Se pueden consultar usuarios activos, búsquedas, rutas, lugares e incidencias.
  - Las estadísticas se pueden filtrar por periodo y categoría.
  - Los datos se muestran de forma agregada.
  - No se puede identificar a una persona a partir de una estadística ordinaria.
  - El sistema identifica el periodo y la fuente de cada indicador.
- **Reglas y dependencias:** Las estadísticas no deben conservar más datos personales de los necesarios para su cálculo.

## HU-079 — Exportar información e informes

- **Prioridad:** Baja
- **Historia:** Como gestor, quiero exportar datos e informes, para analizarlos y compartirlos con responsables autorizados.
- **Criterios de aceptación:**
  - El usuario autorizado puede elegir el tipo de información y periodo.
  - La exportación respeta los permisos de quien la solicita.
  - Los datos personales se excluyen o anonimizan cuando no sean necesarios.
  - El sistema informa del formato y fecha de generación.
  - La generación de un informe no bloquea el funcionamiento normal de la aplicación.
- **Reglas y dependencias:** Los formatos disponibles y los límites de exportación deben definirse antes de la implementación.

## HU-080 — Gestionar fuentes con errores

- **Prioridad:** Alta
- **Historia:** Como administrador, quiero recibir errores de actualización de fuentes externas, para evitar mostrar datos incorrectos sin advertencia.
- **Criterios de aceptación:**
  - El sistema registra fallos de conexión, formato o validación.
  - El administrador puede consultar el error y su fecha.
  - La aplicación marca la información afectada como desactualizada.
  - Un error parcial no elimina automáticamente información válida.
  - El sistema permite reintentar una actualización cuando proceda.
- **Reglas y dependencias:** Debe existir una política para mantener, sustituir o retirar datos cuando una fuente deje de estar disponible.
