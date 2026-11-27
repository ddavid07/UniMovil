# Historias de usuario: administración y datos

## HU-070 — Gestionar edificios y lugares

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero crear, modificar y desactivar lugares del campus, para mantener actualizado el mapa.
- **Criterios de aceptación:**
  - **HU-070.1** El gestor puede crear un lugar con nombre, categoría, coordenadas y descripción.
  - **HU-070.2** Puede editar sus datos y accesos.
  - **HU-070.3** Puede desactivarlo sin eliminar su historial.
  - **HU-070.4** El sistema valida coordenadas, categorías y campos obligatorios.
  - **HU-070.5** Los cambios se reflejan en las consultas públicas una vez publicados.
- **Reglas y dependencias:** Los elementos desactivados no aparecen en búsquedas activas ni en rutas nuevas.

**Análisis INVEST:**

- **I · Independiente.** Requiere el panel administrativo y catálogo persistido en API; es la base para que los clientes no dependan de ficheros estáticos.
- **N · Negociable.** Se puede acordar el flujo de borrador frente a publicación directa y los campos opcionales de contacto/horario.
- **V · Valiosa.** Mantiene vivo y fiable el catálogo del campus sin tener que recompilar la app móvil por cada cambio.
- **E · Estimable.** CRUD validado en servidor, desactivación lógica y propagación al catálogo público acotan bien Sprint 10.
- **S · Pequeña.** Alta, edición, desactivación y lectura pública sincronizada forman una entrega vertical clara.
- **T · Comprobable.** Crear lugar, publicarlo comprobando aparición en mapa/búsqueda, desactivarlo después y verificar que desaparece conservando historial/favoritos.

## HU-071 — Gestionar puntos y categorías

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero administrar categorías y puntos de interés, para organizar la información del campus.
- **Criterios de aceptación:**
  - **HU-071.1** El gestor puede crear, editar y desactivar categorías.
  - **HU-071.2** Puede asignar icono, nombre y descripción a una categoría.
  - **HU-071.3** No puede eliminar una categoría que tenga elementos sin reasignarlos.
  - **HU-071.4** Puede ordenar las categorías visibles.
  - **HU-071.5** Los cambios quedan registrados.
- **Reglas y dependencias:** Las categorías deben tener nombres comprensibles y no duplicados.

**Análisis INVEST:**

- **I · Independiente.** Se integra junto al catálogo de lugares y auditoría sin requerir importaciones automáticas externas.
- **N · Negociable.** Puede ajustarse cómo se eligen iconos accesibles con letra/símbolo compatible en móvil y web.
- **V · Valiosa.** Evita categorías huérfanas o duplicadas y mantiene ordenada la leyenda pública.
- **E · Estimable.** Validación de unicidad, bloqueo de borrado con elementos asignados, reordenación y auditoría delimitan el esfuerzo.
- **S · Pequeña.** Administración de categorías con integridad referencial cabe en un corte acotado de Sprint 10.
- **T · Comprobable.** Intentar eliminar categoría en uso esperando rechazo, reasignar/desactivar ordenadamente y verificar registro en auditoría.

## HU-072 — Gestionar transporte y paradas

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero mantener líneas, paradas y horarios, para ofrecer información fiable sobre los autobuses.
- **Criterios de aceptación:**
  - **HU-072.1** El gestor puede crear y editar líneas, paradas y recorridos.
  - **HU-072.2** Puede asociar paradas a líneas y ordenar el recorrido.
  - **HU-072.3** Puede registrar horarios y días de servicio.
  - **HU-072.4** Puede marcar datos como provisionales, confirmados o desactualizados.
  - **HU-072.5** Puede desactivar una línea o parada temporalmente.
- **Reglas y dependencias:** Los datos importados deben conservar su fuente y fecha de actualización.

**Análisis INVEST:**

- **I · Independiente.** Extiende el modelo de gestión de Sprint 10 al dominio GTFS/transporte construido en Sprint 4.
- **N · Negociable.** Se puede acordar la interfaz de ordenación de paradas en un recorrido y el detalle de calendarios especiales.
- **V · Valiosa.** Permite corregir incidencias o desvíos estáticos de paradas y líneas manteniendo procedencia y estado de calidad.
- **E · Estimable.** Gestión de líneas, paradas ordenadas, horarios, estados de calidad y desactivación acotan el trabajo de Sprint 11.
- **S · Pequeña.** Conviene separar el mantenimiento manual de paradas/líneas de la importación masiva externa (HU-074).
- **T · Comprobable.** Editar una parada y el orden en una línea, marcar estado provisional/desactualizado y comprobar el reflejo en la consulta pública.

## HU-073 — Gestionar accesibilidad

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero actualizar los datos de accesibilidad, para que las rutas adaptadas se basen en información fiable.
- **Criterios de aceptación:**
  - **HU-073.1** El gestor puede registrar rampas, ascensores, accesos y obstáculos.
  - **HU-073.2** Puede indicar el estado operativo de cada recurso.
  - **HU-073.3** Puede establecer fechas de revisión o caducidad.
  - **HU-073.4** Puede asociar una restricción temporal a un recurso.
  - **HU-073.5** La aplicación conserva quién y cuándo actualizó el dato.
- **Reglas y dependencias:** Los datos no confirmados no deben mostrarse como garantía de accesibilidad.

**Análisis INVEST:**

- **I · Independiente.** Permite empezar a poblar atributos confirmados sobre el modelo de certeza definido en ADR-0017 y Sprint 5.
- **N · Negociable.** Pueden ajustarse los tipos de obstáculos o atributos físicos mínimos requeridos antes de marcar un acceso como confirmado.
- **V · Valiosa.** Es el habilitador real para que HU-024 pueda ofrecer rutas accesibles respaldadas por datos verificados.
- **E · Estimable.** Formulario de atributos con estado operativo, fecha de revisión, restricción y auditoría de autoría delimitan la tarea.
- **S · Pequeña.** Cabe como módulo de edición de accesos dentro del panel de catálogo de Sprint 10.
- **T · Comprobable.** Registrar un ascensor operativo con fecha de revisión, marcarlo después fuera de servicio y verificar autoría y cambio en la ficha pública.

## HU-074 — Importar datos externos

- **Prioridad:** Media
- **Historia:** Como administrador, quiero importar datos de fuentes autorizadas, para reducir la actualización manual de información de movilidad.
- **Criterios de aceptación:**
  - **HU-074.1** El administrador puede configurar una fuente y su formato.
  - **HU-074.2** El sistema valida la estructura antes de aplicar los datos.
  - **HU-074.3** Los errores de importación se muestran con información suficiente para corregirlos.
  - **HU-074.4** La importación no elimina datos válidos por un error parcial.
  - **HU-074.5** Se conserva la fuente, fecha y resultado de cada importación.
- **Reglas y dependencias:** Solo se utilizarán fuentes cuyo uso esté permitido y sea trazable.

**Análisis INVEST:**

- **I · Independiente.** Aprovecha los importadores reproducibles existentes y el registro de auditoría/estado de fuentes.
- **N · Negociable.** Se puede acordar la política de reconciliación frente a ediciones manuales previas y qué formatos se admiten inicialmente (GTFS/GeoJSON).
- **V · Valiosa.** Evita carga manual propensa a errores al renovar snapshots autorizados de campus o EMT.
- **E · Estimable.** Zona previa de validación, informe de errores, aplicación atómica/segura y log de ejecución acotan bien Sprint 11.
- **S · Pequeña.** Validación previa con vista de errores antes de confirmar la importación forma un corte muy seguro.
- **T · Comprobable.** Subir un conjunto con errores de formato comprobando que los datos vigentes siguen intactos; importar uno válido verificando fuente y fecha.

## HU-075 — Consultar el estado de los datos

- **Prioridad:** Alta
- **Historia:** Como gestor, quiero conocer cuándo se actualizó cada dato, para detectar información obsoleta.
- **Criterios de aceptación:**
  - **HU-075.1** Cada conjunto de datos muestra fecha de última actualización.
  - **HU-075.2** Se identifica si procede de una fuente externa o de una edición manual.
  - **HU-075.3** El sistema marca datos con errores o que superen su periodo de validez.
  - **HU-075.4** El gestor puede filtrar datos desactualizados.
  - **HU-075.5** Los usuarios ven una indicación comprensible cuando un dato no está actualizado.
- **Reglas y dependencias:** Cada tipo de dato debe tener un periodo de validez definido.

**Análisis INVEST:**

- **I · Independiente.** Puede construirse sobre metadatos de procedencia y fecha ya documentados en `data-sources.md` y en los conjuntos del catálogo.
- **N · Negociable.** El periodo de validez por tipo de conjunto (lugares, accesibilidad, GTFS) es configurable por el Product Owner.
- **V · Valiosa.** Da control operativo para detectar caducidad antes de que afecte a los usuarios.
- **E · Estimable.** Panel de salud de conjuntos, cálculo de vencimiento, filtro de obsolescencia e indicador público acotan el alcance.
- **S · Pequeña.** Vista de estado por conjunto en admin + etiqueta de vigencia en consulta pública cabe limpiamente entre Sprints 10 y 11.
- **T · Comprobable.** Simular un conjunto cuya fecha supera el periodo de validez y comprobar el filtro en admin y el aviso al usuario.

## HU-076 — Gestionar usuarios y roles

- **Prioridad:** Alta
- **Historia:** Como administrador, quiero gestionar cuentas y roles, para controlar quién puede administrar la plataforma.
- **Criterios de aceptación:**
  - **HU-076.1** El administrador puede buscar usuarios.
  - **HU-076.2** Puede activar, bloquear o desactivar una cuenta según la política definida.
  - **HU-076.3** Puede asignar o retirar los roles de gestor y administrador.
  - **HU-076.4** Las acciones administrativas quedan registradas.
  - **HU-076.5** Ningún administrador puede retirar accidentalmente el último acceso administrativo sin una confirmación adicional.
- **Reglas y dependencias:** Los roles no se asignan basándose únicamente en el tipo de usuario declarado durante el registro.

**Análisis INVEST:**

- **I · Independiente.** Depende de la capa de cuentas/roles y auditoría de Sprints 6 y 8; no depende de mapas ni transporte.
- **N · Negociable.** Se puede acordar la confirmación adicional para cambios de último administrador y el efecto del bloqueo sobre sesiones activas.
- **V · Valiosa.** Permite delegar tareas de gestión con control estricto de privilegios y protección frente a bloqueos accidentales.
- **E · Estimable.** Búsqueda, cambio de estado/rol en servidor, regla transaccional de último administrador y auditoría delimitan el trabajo.
- **S · Pequeña.** Administración de roles y estados de cuenta forma un módulo vertical muy bien acotado.
- **T · Comprobable.** Promover a gestor comprobando acceso, intentar retirar el último rol administrador comprobando bloqueo/protección y revisar auditoría.

## HU-077 — Consultar auditoría administrativa

- **Prioridad:** Media
- **Historia:** Como administrador, quiero consultar los cambios administrativos, para saber quién modificó la información y cuándo.
- **Criterios de aceptación:**
  - **HU-077.1** El registro incluye usuario, fecha, acción y elemento afectado.
  - **HU-077.2** Permite filtrar por usuario, tipo de acción y periodo.
  - **HU-077.3** No permite modificar ni borrar registros desde la interfaz ordinaria.
  - **HU-077.4** No expone contraseñas, tokens ni secretos.
  - **HU-077.5** Se conserva información suficiente para investigar cambios.
- **Reglas y dependencias:** El periodo de conservación debe definirse conforme a la política de la plataforma.

**Análisis INVEST:**

- **I · Independiente.** Se apoya en la tabla de eventos auditables creada en Sprint 8; cualquier módulo posterior solo emite eventos hacia ella.
- **N · Negociable.** Se pueden acordar los filtros iniciales, paginación y lista blanca de campos mostrados.
- **V · Valiosa.** Aporta rendición de cuentas y capacidad de diagnóstico ante cambios erróneos o accesos indebidos.
- **E · Estimable.** Consulta paginada de solo lectura con filtros, redacción estricta de secretos y autorización exclusiva de rol administrador delimitan la historia.
- **S · Pequeña.** Vista de consulta filtrada en `apps/admin` + endpoint solo lectura cabe perfectamente en Sprint 8.
- **T · Comprobable.** Realizar acción administrativa verificando evento sin secretos, filtrar por actor/fecha y comprobar denegación de edición o borrado.

## HU-078 — Consultar estadísticas de uso

- **Prioridad:** Media
- **Historia:** Como gestor, quiero consultar estadísticas agregadas, para conocer las necesidades de movilidad del campus.
- **Criterios de aceptación:**
  - **HU-078.1** Se pueden consultar usuarios activos, búsquedas, rutas, lugares e incidencias.
  - **HU-078.2** Las estadísticas se pueden filtrar por periodo y categoría.
  - **HU-078.3** Los datos se muestran de forma agregada.
  - **HU-078.4** No se puede identificar a una persona a partir de una estadística ordinaria.
  - **HU-078.5** El sistema identifica el periodo y la fuente de cada indicador.
- **Reglas y dependencias:** Las estadísticas no deben conservar más datos personales de los necesarios para su cálculo.

**Análisis INVEST:**

- **I · Independiente.** Fuera del horizonte inmediato hasta definir finalidad y política de privacidad/telemetría aprobadas.
- **N · Negociable.** Puede acordarse qué métricas agregadas y umbrales mínimos de anonimato se calculan.
- **V · Valiosa.** Ayudaría a priorizar mejoras en zonas o servicios más demandados sin invadir privacidad individual.
- **E · Estimable.** Requiere concretar primero la fuente de eventos y criterios de agregación antes de estimar con fiabilidad.
- **S · Pequeña.** Cuando se refine, conviene dividir por dominio (incidencias agregadas frente a uso de búsquedas/rutas).
- **T · Comprobable.** Consultar indicadores por periodo verificando agregación sin identificadores personales ni desgloses individualizables.

## HU-079 — Exportar información e informes

- **Prioridad:** Baja
- **Historia:** Como gestor, quiero exportar datos e informes, para analizarlos y compartirlos con responsables autorizados.
- **Criterios de aceptación:**
  - **HU-079.1** El usuario autorizado puede elegir el tipo de información y periodo.
  - **HU-079.2** La exportación respeta los permisos de quien la solicita.
  - **HU-079.3** Los datos personales se excluyen o anonimizan cuando no sean necesarios.
  - **HU-079.4** El sistema informa del formato y fecha de generación.
  - **HU-079.5** La generación de un informe no bloquea el funcionamiento normal de la aplicación.
- **Reglas y dependencias:** Los formatos disponibles y los límites de exportación deben definirse antes de la implementación.

**Análisis INVEST:**

- **I · Independiente.** Se apoya en datos ya existentes y permisos definidos, pero permanece fuera del horizonte actual hasta concretar formatos y privacidad.
- **N · Negociable.** Formatos iniciales (CSV/JSON) y límites de tamaño o periodo por exportación son negociables.
- **V · Valiosa.** Facilita entregar balances periódicos a responsables autorizados sin exponer datos personales innecesarios.
- **E · Estimable.** Pendiente de definir formatos permitidos, reglas de anonimización y límites de carga.
- **S · Pequeña.** Conviene acotarla a un primer informe agregado (por ejemplo resumen de incidencias por periodo).
- **T · Comprobable.** Exportar como gestor autorizado verificando anonimización, metadatos de generación y rechazo ante rol no autorizado.

## HU-080 — Gestionar fuentes con errores

- **Prioridad:** Alta
- **Historia:** Como administrador, quiero recibir errores de actualización de fuentes externas, para evitar mostrar datos incorrectos sin advertencia.
- **Criterios de aceptación:**
  - **HU-080.1** El sistema registra fallos de conexión, formato o validación.
  - **HU-080.2** El administrador puede consultar el error y su fecha.
  - **HU-080.3** La aplicación marca la información afectada como desactualizada.
  - **HU-080.4** Un error parcial no elimina automáticamente información válida.
  - **HU-080.5** El sistema permite reintentar una actualización cuando proceda.
- **Reglas y dependencias:** Debe existir una política para mantener, sustituir o retirar datos cuando una fuente deje de estar disponible.

**Análisis INVEST:**

- **I · Independiente.** Complementa directamente HU-074 y HU-075 dentro del ciclo de salud e importación de fuentes de Sprint 11.
- **N · Negociable.** Se puede acordar cómo se clasifica la severidad del fallo y cuándo pasa una fuente a estado desactualizado.
- **V · Valiosa.** Evita que un fallo de importación borre datos útiles o muestre información errónea sin aviso al público.
- **E · Estimable.** Registro de errores, conservación del snapshot válido previo, marcado como desactualizado y botón de reintento delimitan la historia.
- **S · Pequeña.** Forma parte directa de la gestión de fallos y reintentos del importador de Sprint 11.
- **T · Comprobable.** Provocar error de validación o conexión durante una importación comprobando conservación de datos previos, aviso y reintento posterior.
