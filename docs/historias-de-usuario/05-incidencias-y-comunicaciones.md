# Historias de usuario: incidencias y comunicaciones

## HU-050 — Comunicar una incidencia

- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero comunicar un problema de movilidad, para que pueda ser revisado y solucionado.
- **Criterios de aceptación:**
  - El usuario puede seleccionar una categoría de incidencia.
  - Puede indicar ubicación, descripción y prioridad percibida.
  - La aplicación valida los campos obligatorios.
  - Tras enviar el formulario, se muestra un identificador y estado inicial.
  - El usuario recibe confirmación de que la comunicación se ha registrado.
- **Reglas y dependencias:** Se requiere una cuenta para reducir spam y permitir el seguimiento.

## HU-051 — Adjuntar evidencias a una incidencia

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero adjuntar fotografías a una incidencia, para explicar mejor el problema.
- **Criterios de aceptación:**
  - El usuario puede adjuntar una o varias fotografías dentro de los límites definidos.
  - La aplicación informa si el formato o tamaño no es válido.
  - El usuario puede quitar una fotografía antes de enviar.
  - Las imágenes se almacenan de forma protegida.
  - El usuario recibe una confirmación si la carga se completa correctamente.
- **Reglas y dependencias:** Las fotografías no deben incluir datos personales innecesarios y podrán ser moderadas.

## HU-052 — Consultar mis incidencias

- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero consultar las incidencias que he enviado, para saber qué ha ocurrido con ellas.
- **Criterios de aceptación:**
  - El usuario puede ver un listado de sus incidencias.
  - Cada incidencia muestra identificador, categoría, ubicación, fecha y estado.
  - Puede abrir el detalle completo.
  - Puede distinguir incidencias nuevas, en revisión, en proceso, resueltas y cerradas.
  - Si no tiene incidencias, se muestra un estado vacío comprensible.
- **Reglas y dependencias:** El usuario solo puede consultar las incidencias asociadas a su cuenta.

## HU-053 — Consultar incidencias públicas

- **Prioridad:** Media
- **Historia:** Como usuario, quiero conocer las incidencias activas del campus, para evitar zonas problemáticas y no duplicar avisos.
- **Criterios de aceptación:**
  - Se muestran únicamente incidencias autorizadas para publicación.
  - Se ocultan datos personales del comunicante.
  - Se puede filtrar por categoría, estado y zona.
  - Cada incidencia muestra fecha de actualización y estado.
  - Las incidencias resueltas dejan de aparecer como activas.
- **Reglas y dependencias:** Los gestores moderan qué información se hace pública.

## HU-054 — Gestionar una incidencia

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero revisar y clasificar incidencias, para organizar su resolución.
- **Criterios de aceptación:**
  - El gestor puede consultar las incidencias pendientes.
  - Puede cambiar categoría, prioridad y estado.
  - Puede asignar la incidencia a un responsable.
  - Puede marcarla como duplicada o descartar comunicaciones inválidas indicando un motivo.
  - Cada cambio queda registrado con usuario y fecha.
- **Reglas y dependencias:** Solo gestores y administradores pueden ejecutar estas acciones.

## HU-055 — Actualizar el estado de una incidencia

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero actualizar el estado de una incidencia, para informar de su progreso.
- **Criterios de aceptación:**
  - Los estados disponibles son recibida, en revisión, en proceso, resuelta y cerrada.
  - El sistema impide transiciones incoherentes.
  - El gestor puede añadir una respuesta visible al usuario.
  - El usuario autor de la incidencia recibe una actualización cuando corresponda.
  - El historial conserva los estados anteriores.
- **Reglas y dependencias:** Una incidencia resuelta puede reabrirse si el problema vuelve a existir.

## HU-056 — Confirmar o reabrir una incidencia

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero indicar si una incidencia sigue presente, para mejorar la calidad de su seguimiento.
- **Criterios de aceptación:**
  - El usuario puede confirmar que el problema continúa o que está solucionado.
  - La aplicación registra la fecha y la cuenta que aporta la confirmación.
  - Una confirmación no modifica automáticamente el estado oficial sin revisión.
  - El gestor puede consultar estas confirmaciones para decidir si reabre la incidencia.
- **Reglas y dependencias:** La participación del usuario no revela sus datos públicamente.

## HU-057 — Publicar un aviso

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero publicar avisos sobre movilidad, para informar de cambios relevantes en el campus.
- **Criterios de aceptación:**
  - El gestor puede indicar título, descripción, categoría, prioridad y periodo de vigencia.
  - Puede asociar el aviso a un edificio, zona, línea o parada.
  - Puede guardar un aviso como borrador antes de publicarlo.
  - El aviso publicado aparece en los lugares correspondientes.
  - El sistema registra quién lo publicó y cuándo.
- **Reglas y dependencias:** Los avisos caducados no se muestran como activos.

## HU-058 — Consultar avisos

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero consultar los avisos del campus, para conocer cambios y restricciones antes de desplazarme.
- **Criterios de aceptación:**
  - Los avisos activos se muestran ordenados por prioridad y fecha.
  - Se puede abrir el detalle de cada aviso.
  - El aviso muestra su vigencia y zona afectada.
  - El usuario puede filtrar por categoría.
  - Los avisos relevantes pueden abrir el mapa o la ruta afectada.
- **Reglas y dependencias:** La información debe distinguir avisos oficiales de contenido pendiente de verificación.

## HU-059 — Administrar un aviso

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero editar, programar y retirar avisos, para mantener las comunicaciones actualizadas.
- **Criterios de aceptación:**
  - El gestor puede modificar un borrador o aviso publicado.
  - Puede establecer fecha de inicio y caducidad.
  - Puede retirar un aviso antes de su caducidad.
  - Las modificaciones quedan registradas.
  - Un aviso retirado deja de mostrarse como activo, pero conserva trazabilidad administrativa.
- **Reglas y dependencias:** Solo gestores y administradores pueden gestionar avisos.
