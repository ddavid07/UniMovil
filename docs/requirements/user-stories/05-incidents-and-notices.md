# Historias de usuario: incidencias y comunicaciones

## HU-050 — Comunicar una incidencia

- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero comunicar un problema de movilidad, para que pueda ser revisado y solucionado.
- **Criterios de aceptación:**
  - **HU-050.1** El usuario puede seleccionar una categoría de incidencia.
  - **HU-050.2** Puede indicar ubicación, descripción y prioridad percibida.
  - **HU-050.3** La aplicación valida los campos obligatorios.
  - **HU-050.4** Tras enviar el formulario, se muestra un identificador y estado inicial.
  - **HU-050.5** El usuario recibe confirmación de que la comunicación se ha registrado.
- **Refinamiento Sprint 7:** La categoría es una de `access_obstruction`, `lift_or_elevator`, `adapted_access_or_service`, `parking`, `bicycle_resource` u `other`. La descripción obligatoria admite de 1 a 2.000 caracteres. La prioridad percibida (`low`, `normal`, `high`) es opcional y se identifica como aportación del usuario. La ubicación se selecciona manualmente dentro del área cartográfica aproximada del campus. El nuevo reporte es privado y comienza en `received`.
- **Reglas y dependencias:** Se requiere una cuenta para reducir spam y permitir el seguimiento.

**Análisis INVEST:**

- **I · Independiente.** El envío básico con categoría, descripción, ubicación dentro del campus y estado inicial `received` funciona de forma independiente a la moderación o adjuntos.
- **N · Negociable.** Se pueden ajustar categorías disponibles, longitud de descripción y la forma de elegir el punto en el mapa.
- **V · Valiosa.** Permite recoger avisos reales de obstáculos o averías con contexto geográfico válido y trazabilidad por cuenta.
- **E · Estimable.** Las seis categorías, el rango de caracteres, el límite geográfico del campus y los estados iniciales acotan claramente el trabajo.
- **S · Pequeña.** Formulario validado en cliente y API con persistencia privada forma una entrega vertical completa.
- **T · Comprobable.** Enviar incidencia válida comprobando identificador y estado `received`; probar descripción vacía y coordenada fuera del campus esperando rechazo.

## HU-051 — Adjuntar evidencias a una incidencia

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero adjuntar fotografías a una incidencia, para explicar mejor el problema.
- **Criterios de aceptación:**
  - **HU-051.1** El usuario puede adjuntar una o varias fotografías dentro de los límites definidos.
  - **HU-051.2** La aplicación informa si el formato o tamaño no es válido.
  - **HU-051.3** El usuario puede quitar una fotografía antes de enviar.
  - **HU-051.4** Las imágenes se almacenan de forma protegida.
  - **HU-051.5** El usuario recibe una confirmación si la carga se completa correctamente.
- **Refinamiento Sprint 7:** Se aceptan JPEG, PNG o WebP, hasta 3 imágenes por incidencia y 5 MiB por imagen. El API valida el contenido real, elimina EXIF y guarda con nombre aleatorio en almacenamiento privado; nunca se incluye el archivo en la ficha pública.
- **Reglas y dependencias:** Las fotografías no deben incluir datos personales innecesarios y podrán ser moderadas.

**Análisis INVEST:**

- **I · Independiente.** Amplía HU-050 apoyándose en almacenamiento privado; puede probarse con archivos sintéticos sin requerir panel administrativo.
- **N · Negociable.** El límite máximo de imágenes, el tamaño por archivo y el formato normalizado de salida pueden ajustarse por política.
- **V · Valiosa.** Ayuda a verificar visualmente obstáculos o averías sin exponer metadatos EXIF ni archivos en rutas públicas.
- **E · Estimable.** Validar formato real, limpiar EXIF, limitar a 3 imágenes de 5 MiB y almacenar en bucket privado delimitan el esfuerzo.
- **S · Pequeña.** Se acota a selección, retirada previa al envío, validación de MIME real y almacenamiento privado.
- **T · Comprobable.** Adjuntar JPEG/PNG/WebP válidos comprobando normalización sin EXIF, quitar un adjunto antes de enviar y rechazar MIME falseado o tamaño excesivo.

## HU-052 — Consultar mis incidencias

- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero consultar las incidencias que he enviado, para saber qué ha ocurrido con ellas.
- **Criterios de aceptación:**
  - **HU-052.1** El usuario puede ver un listado de sus incidencias.
  - **HU-052.2** Cada incidencia muestra identificador, categoría, ubicación, fecha y estado.
  - **HU-052.3** Puede abrir el detalle completo.
  - **HU-052.4** Puede distinguir incidencias nuevas, en revisión, en proceso, resueltas y cerradas.
  - **HU-052.5** Si no tiene incidencias, se muestra un estado vacío comprensible.
- **Refinamiento Sprint 7:** El historial incluye la fecha y el estado operativo; solo devuelve reportes propiedad de la cuenta autenticada. La persona informante no cambia estados oficiales desde el cliente.
- **Reglas y dependencias:** El usuario solo puede consultar las incidencias asociadas a su cuenta.

**Análisis INVEST:**

- **I · Independiente.** Solo requiere autenticación y reportes propios persistidos; funciona aunque la cola de moderación aún no esté desplegada.
- **N · Negociable.** Se puede ajustar la ordenación del listado y los campos resumidos frente al detalle completo.
- **V · Valiosa.** Da visibilidad al usuario sobre el seguimiento de sus propios reportes sin exponerlos a terceros.
- **E · Estimable.** Consulta autenticada filtrada por propietario, detalle y estado vacío delimitan la entrega.
- **S · Pequeña.** Listado privado + vista detalle + comprobación de aislamiento entre cuentas cabe en un corte vertical claro.
- **T · Comprobable.** Consultar con cuenta A sus incidencias y comprobar que cuenta B no ve las de A y recibe estado vacío si no tiene reportes.

## HU-053 — Consultar incidencias públicas

- **Prioridad:** Media
- **Historia:** Como usuario, quiero conocer las incidencias activas del campus, para evitar zonas problemáticas y no duplicar avisos.
- **Criterios de aceptación:**
  - **HU-053.1** Se muestran únicamente incidencias autorizadas para publicación.
  - **HU-053.2** Se ocultan datos personales del comunicante.
  - **HU-053.3** Se puede filtrar por categoría, estado y zona.
  - **HU-053.4** Cada incidencia muestra fecha de actualización y estado.
  - **HU-053.5** Las incidencias resueltas dejan de aparecer como activas.
- **Refinamiento Sprint 7:** Solo se devuelve la proyección expresamente publicada por un rol de gestión. Se excluyen informante, correo, adjuntos y notas internas. La consulta filtra por categoría, estado y radio geográfico aproximado de 250, 500 o 1.000 metros desde un lugar seleccionado del catálogo del campus. Los nuevos reportes permanecen privados; los datos de prueba son sintéticos y no representan incidencias aprobadas.
- **Reglas y dependencias:** Los gestores moderan qué información se hace pública.

**Análisis INVEST:**

- **I · Independiente.** La consulta pública sobre proyección filtrada funciona sin necesidad de iniciar sesión ni esperar al panel completo de gestión.
- **N · Negociable.** Pueden ajustarse los radios de filtro geográfico y los campos mostrados en la ficha pública.
- **V · Valiosa.** Evita duplicar avisos sobre problemas conocidos y alerta de zonas afectadas sin comprometer privacidad.
- **E · Estimable.** Proyección pública sin datos privados y filtros por categoría, estado y radio acotan con precisión la consulta.
- **S · Pequeña.** Endpoint público filtrado + UI con filtros de categoría, estado y radio constituyen una entrega acotada.
- **T · Comprobable.** Consultar sin sesión verificando que reportes `received` o privados no aparecen y que la proyección pública omite autor y adjuntos privados.

## HU-054 — Gestionar una incidencia

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero revisar y clasificar incidencias, para organizar su resolución.
- **Criterios de aceptación:**
  - **HU-054.1** El gestor puede consultar las incidencias pendientes.
  - **HU-054.2** Puede corregir la categoría y la prioridad de la incidencia.
  - **HU-054.3** Puede asignar la incidencia a un responsable.
  - **HU-054.4** Puede marcarla como duplicada o descartar comunicaciones inválidas indicando un motivo.
  - **HU-054.5** Cada cambio queda registrado con usuario y fecha.
- **Reglas y dependencias:** Solo gestores y administradores pueden ejecutar estas acciones.

**Análisis INVEST:**

- **I · Independiente.** Depende de las incidencias persistidas en Sprint 7 y de la autorización por roles; se separa claramente de avisos oficiales.
- **N · Negociable.** Se pueden acordar los filtros iniciales de la cola de revisión y si la asignación permite lista de gestores o identificador interno.
- **V · Valiosa.** Permite ordenar y depurar el volumen de incidencias recibidas antes de publicarlas o resolverlas.
- **E · Estimable.** Cola filtrable, reclasificación, motivo de descarte/duplicado y registro de auditoría acotan bien el trabajo de Sprint 8.
- **S · Pequeña.** Conviene separar el API con autorización en servidor de la vista de cola y detalle en el panel administrativo.
- **T · Comprobable.** Intentar reclasificar o descartar con cuenta ordinaria esperando 403; hacerlo como gestor y verificar auditoría con autor, fecha y motivo.

## HU-055 — Actualizar el estado de una incidencia

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero actualizar el estado de una incidencia, para informar de su progreso.
- **Criterios de aceptación:**
  - **HU-055.1** Los estados disponibles son recibida, en revisión, en proceso, resuelta y cerrada.
  - **HU-055.2** El sistema impide transiciones incoherentes.
  - **HU-055.3** El gestor puede añadir una respuesta visible al usuario.
  - **HU-055.4** El usuario autor de la incidencia recibe una actualización cuando corresponda.
  - **HU-055.5** El historial conserva los estados anteriores.
- **Reglas y dependencias:** Una incidencia resuelta puede reabrirse si el problema vuelve a existir.

**Análisis INVEST:**

- **I · Independiente.** Requiere el ciclo de vida acordado y control transaccional en servidor; la notificación externa puede conectarse después en Sprint 12.
- **N · Negociable.** Puede afinarse la matriz exacta de transiciones permitidas y cómo se distingue respuesta visible de nota interna.
- **V · Valiosa.** Mantiene informado al informante y aporta trazabilidad real de principio a cierre.
- **E · Estimable.** Máquina de estados, historial inmutable y validación de rol en servidor permiten estimar el corte con exactitud.
- **S · Pequeña.** Transiciones válidas/inválidas y respuesta visible al informante caben en una entrega enfocada de Sprint 8.
- **T · Comprobable.** Ejecutar transición válida verificando historial previo y mensaje visible; intentar transición inválida esperando rechazo controlado.

## HU-056 — Confirmar que una incidencia sigue activa

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero indicar si una incidencia sigue presente, para mejorar la calidad de su seguimiento.
- **Criterios de aceptación:**
  - **HU-056.1** El usuario puede confirmar que el problema continúa o que está solucionado.
  - **HU-056.2** La aplicación registra la fecha y la cuenta que aporta la confirmación.
  - **HU-056.3** Una confirmación no modifica automáticamente el estado oficial sin revisión.
  - **HU-056.4** El gestor puede consultar estas confirmaciones para decidir si reabre la incidencia.
- **Reglas y dependencias:** La participación del usuario no revela sus datos públicamente. La reapertura oficial corresponde a un gestor, conforme a HU-055.

**Análisis INVEST:**

- **I · Independiente.** Se apoya en incidencias públicas y cuentas autenticadas sin alterar la máquina de estados oficial ni requerir notificaciones.
- **N · Negociable.** Se puede acordar la frecuencia máxima de confirmación por usuario y el resumen agregado visible al gestor.
- **V · Valiosa.** Aporta señal comunitaria para detectar si un problema resuelto ha reaparecido sin perder control editorial.
- **E · Estimable.** Registro de confirmación por cuenta/incidencia, agregado para gestor y preservación del estado oficial delimitan la tarea.
- **S · Pequeña.** Endpoint autenticado de confirmación + lectura por gestor forman un corte vertical reducido.
- **T · Comprobable.** Registrar confirmación con cuenta autenticada, comprobar que el estado oficial no cambia automáticamente y verificar el registro en gestión.

## HU-057 — Publicar un aviso

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero publicar avisos sobre movilidad, para informar de cambios relevantes en el campus.
- **Criterios de aceptación:**
  - **HU-057.1** El gestor puede indicar título, descripción, categoría, prioridad y periodo de vigencia.
  - **HU-057.2** Puede asociar el aviso a un edificio, zona, línea o parada.
  - **HU-057.3** Puede guardar un aviso como borrador antes de publicarlo.
  - **HU-057.4** El aviso publicado aparece en los lugares correspondientes.
  - **HU-057.5** El sistema registra quién lo publicó y cuándo.
- **Reglas y dependencias:** Los avisos caducados no se muestran como activos.

**Análisis INVEST:**

- **I · Independiente.** Requiere roles de gestión y entidades públicas de campus/transporte; no depende de notificaciones push para publicarse.
- **N · Negociable.** Se pueden acordar categorías de aviso, campos obligatorios del borrador y formato geométrico de zona.
- **V · Valiosa.** Permite comunicar incidencias oficiales y obras planificadas antes de que afecten al usuario.
- **E · Estimable.** Modelo borrador/publicado, fechas de vigencia, asociación a entidades y auditoría de autoría acotan bien el Sprint 9.
- **S · Pequeña.** Conviene entregar primero creación de borrador y publicación con vigencia antes de automatizar desvíos sobre rutas.
- **T · Comprobable.** Crear borrador verificando que no es público, publicarlo después comprobando visibilidad, autoría y ocultación al expirar la fecha.

## HU-058 — Consultar avisos

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero consultar los avisos del campus, para conocer cambios y restricciones antes de desplazarme.
- **Criterios de aceptación:**
  - **HU-058.1** Los avisos activos se muestran ordenados por prioridad y fecha.
  - **HU-058.2** Se puede abrir el detalle de cada aviso.
  - **HU-058.3** El aviso muestra su vigencia y zona afectada.
  - **HU-058.4** El usuario puede filtrar por categoría.
  - **HU-058.5** Los avisos relevantes pueden abrir el mapa o la ruta afectada.
- **Reglas y dependencias:** La información debe distinguir avisos oficiales de contenido pendiente de verificación.

**Análisis INVEST:**

- **I · Independiente.** Consulta pública en móvil y web que solo lee avisos publicados vigentes; no requiere cuenta ni administración en el mismo cliente.
- **N · Negociable.** Se puede ajustar la ordenación por prioridad/fecha y el nivel de detalle en la tarjeta frente a la vista completa.
- **V · Valiosa.** Permite anticipar cortes o desvíos oficiales en un solo listado accesible.
- **E · Estimable.** Ordenación, filtro por categoría, vigencia visible y enlace a mapa/ruta acotan claramente el trabajo.
- **S · Pequeña.** Listado público filtrado + detalle con vigencia y salto a mapa forman un corte directo.
- **T · Comprobable.** Consultar sin sesión verificando orden por prioridad/fecha, ausencia de borradores/caducados y apertura de zona en mapa.

## HU-059 — Administrar un aviso

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero editar, programar y retirar avisos, para mantener las comunicaciones actualizadas.
- **Criterios de aceptación:**
  - **HU-059.1** El gestor puede modificar un borrador o aviso publicado.
  - **HU-059.2** Puede establecer fecha de inicio y caducidad.
  - **HU-059.3** Puede retirar un aviso antes de su caducidad.
  - **HU-059.4** Las modificaciones quedan registradas.
  - **HU-059.5** Un aviso retirado deja de mostrarse como activo, pero conserva trazabilidad administrativa.
- **Reglas y dependencias:** Solo gestores y administradores pueden gestionar avisos.

**Análisis INVEST:**

- **I · Independiente.** Extiende HU-057 sobre los mismos contratos de avisos y auditoría administrativa.
- **N · Negociable.** Se puede acordar la zona horaria oficial de programación y si un aviso retirado puede duplicarse como nuevo borrador.
- **V · Valiosa.** Evita mantener avisos obsoletos o erróneos visibles al público cuando cambia una obra o incidencia.
- **E · Estimable.** Edición, ventana inicio/fin, retirada lógica y registro de cambios en auditoría delimitan el alcance.
- **S · Pequeña.** Acciones de editar, programar y retirar con trazabilidad caben junto a la cola de avisos del panel admin.
- **T · Comprobable.** Programar inicio futuro comprobando que aún no es público, editar un aviso y retirarlo comprobando desaparición pública y registro histórico.
