# Historias de usuario: personalización y notificaciones

## HU-060 — Guardar favoritos

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero guardar lugares, paradas y líneas como favoritos, para acceder a ellos rápidamente.
- **Criterios de aceptación:**
  - **HU-060.1** El usuario puede guardar un lugar, parada, línea o recurso compatible.
  - **HU-060.2** Puede consultar sus favoritos desde su cuenta.
  - **HU-060.3** Puede eliminar cualquier favorito.
  - **HU-060.4** Los favoritos se conservan al cerrar sesión y volver a entrar.
  - **HU-060.5** Si un elemento deja de estar disponible, se informa sin bloquear el resto de favoritos.
- **Refinamiento Sprint 6:** Cada favorito queda ligado al usuario autenticado y el API impide su consulta o modificación por otra cuenta. Un ID del catálogo retirado se mantiene como referencia no disponible en lugar de asociarse a otro lugar.
- **Reglas y dependencias:** Los favoritos son privados salvo que el usuario decida compartir un enlace público al elemento.

**Análisis INVEST:**

- **I · Independiente.** Solo depende de tener autenticación e identificadores de catálogo; no requiere notificaciones ni historial de rutas.
- **N · Negociable.** Se puede ajustar la agrupación por tipo de recurso y el mensaje cuando un elemento ha sido retirado.
- **V · Valiosa.** Permite volver en un toque a facultades, paradas o líneas frecuentes desde móvil y web.
- **E · Estimable.** Endpoints CRUD autenticados por propietario, unicidad y manejo de referencias retiradas delimitan el esfuerzo.
- **S · Pequeña.** Guardar, listar, eliminar y persistir entre sesiones forma un corte vertical completo.
- **T · Comprobable.** Guardar favorito, reiniciar sesión verificando persistencia, comprobar aislamiento entre cuentas y probar un ID retirado.

## HU-061 — Consultar búsquedas y rutas recientes

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero consultar mis búsquedas y rutas recientes, para repetir desplazamientos habituales.
- **Criterios de aceptación:**
  - **HU-061.1** La aplicación muestra elementos recientes ordenados por fecha.
  - **HU-061.2** El usuario puede repetir una búsqueda o ruta.
  - **HU-061.3** Puede eliminar elementos individuales o todo el historial.
  - **HU-061.4** El historial no se comparte con otros usuarios.
  - **HU-061.5** La aplicación informa si una ruta ya no puede calcularse con los datos actuales.
- **Reglas y dependencias:** La conservación del historial debe respetar las preferencias de privacidad.

**Análisis INVEST:**

- **I · Independiente.** Puede implementarse sobre cuenta autenticada reutilizando búsqueda y planificador sin depender de notificaciones.
- **N · Negociable.** Se puede acordar el límite máximo de entradas recientes y si se guarda por separado búsqueda y ruta.
- **V · Valiosa.** Evita reescribir consultas repetidas y agiliza el acceso diario desde cuenta propia.
- **E · Estimable.** Registro ordenado por fecha, borrado selectivo/total, recálculo y respeto a privacidad acotan la tarea.
- **S · Pequeña.** Conviene entregar almacenamiento privado con borrado junto a la acción de repetir consulta.
- **T · Comprobable.** Realizar búsquedas y rutas, verificar orden reciente, borrar un elemento y vaciar historial comprobando aislamiento de cuenta.

## HU-062 — Configurar preferencias de movilidad

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero configurar mis preferencias de transporte, para recibir resultados adaptados a mis hábitos.
- **Criterios de aceptación:**
  - **HU-062.1** El usuario puede elegir medios preferidos.
  - **HU-062.2** Puede seleccionar preferencia por rapidez, accesibilidad o menos transbordos.
  - **HU-062.3** Puede modificar o restablecer las preferencias.
  - **HU-062.4** Las preferencias se utilizan al calcular rutas sin impedir consultar otras opciones.
  - **HU-062.5** Las preferencias se guardan de forma privada.
- **Reglas y dependencias:** Las preferencias generales de movilidad no sustituyen las preferencias específicas de accesibilidad.

**Análisis INVEST:**

- **I · Independiente.** Se apoya en perfil/cuenta y en las preferencias de cálculo existentes (HU-025), manteniendo separada HU-040.
- **N · Negociable.** Pueden ajustarse los pesos o criterios de ordenación inicial al mostrar alternativas de ruta.
- **V · Valiosa.** Personaliza automáticamente las sugerencias de desplazamiento sin ocultar otras alternativas válidas.
- **E · Estimable.** Persistencia privada por usuario, restablecimiento y aplicación al orden de alternativas delimitan la entrega.
- **S · Pequeña.** Formulario privado de preferencias + aplicación no excluyente en el planificador cabe en un corte.
- **T · Comprobable.** Guardar preferencia de menos transbordos, calcular una ruta verificando prioridad sin ocultar otras opciones y restablecer valores.

## HU-063 — Configurar notificaciones

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero elegir qué notificaciones recibo, para recibir información útil sin saturarme.
- **Criterios de aceptación:**
  - **HU-063.1** El usuario puede activar o desactivar categorías de notificaciones.
  - **HU-063.2** Puede configurar un horario de silencio.
  - **HU-063.3** Puede elegir recibir avisos sobre favoritos, incidencias propias y alertas generales.
  - **HU-063.4** El sistema respeta tanto las preferencias de la cuenta como los permisos del dispositivo.
  - **HU-063.5** Los cambios se aplican sin afectar a otras preferencias.
- **Reglas y dependencias:** Las alertas críticas pueden tratarse de forma diferente según la política de la aplicación.

**Análisis INVEST:**

- **I · Independiente.** La gestión de preferencias y horario de silencio se coordina con HU-007 y precede al envío real de avisos en HU-064.
- **N · Negociable.** Se puede ajustar la granularidad de categorías y el rango horario por defecto del modo silencio.
- **V · Valiosa.** Evita fatiga de alertas y alinea la entrega de avisos con la decisión del usuario y del sistema operativo.
- **E · Estimable.** Categorías booleanas, franja horaria y comprobación conjunta con permisos del dispositivo acotan el trabajo.
- **S · Pequeña.** Pantalla/API de preferencias de notificación independiente del proveedor concreto de envío push.
- **T · Comprobable.** Desactivar categoría de alertas generales y fijar silencio comprobando persistencia y coherencia con permisos de dispositivo.

## HU-064 — Recibir una notificación relevante

- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero recibir avisos relevantes sobre mis rutas o servicios favoritos, para reaccionar a cambios de movilidad.
- **Criterios de aceptación:**
  - **HU-064.1** La notificación identifica claramente el motivo.
  - **HU-064.2** Al seleccionarla, abre el aviso, incidencia, línea o parada relacionada.
  - **HU-064.3** No se envía si el usuario ha desactivado esa categoría.
  - **HU-064.4** No se envían notificaciones duplicadas por el mismo evento.
  - **HU-064.5** Si el dispositivo no permite notificaciones, el aviso permanece disponible dentro de la aplicación.
- **Reglas y dependencias:** Requiere un servicio de notificaciones configurado y una fuente de eventos válida.

**Análisis INVEST:**

- **I · Independiente.** Depende de eventos reales (avisos o cambios de incidencia), preferencias HU-063 y proveedor de entrega push/in-app.
- **N · Negociable.** El soporte push en navegadores puede diferir del móvil, manteniendo siempre el buzón/aviso dentro de la app.
- **V · Valiosa.** Lleva proactivamente al destino afectado solo los cambios relevantes sin duplicados ni spam.
- **E · Estimable.** Clave de idempotencia por evento/usuario, filtrado por preferencias y enlace profundo al recurso delimitan el diseño.
- **S · Pequeña.** Conviene separar el registro de eventos in-app/deduplicación del canal push externo por plataforma.
- **T · Comprobable.** Emitir un evento vinculado a favorito comprobando entrega única y apertura directa al detalle; repetir con categoría desactivada verificando silencio.

## HU-065 — Cambiar idioma y preferencias de presentación

- **Prioridad:** Baja
- **Historia:** Como usuario, quiero elegir el idioma y las unidades de la aplicación, para utilizarla de forma cómoda.
- **Criterios de aceptación:**
  - **HU-065.1** El usuario puede elegir entre los idiomas disponibles.
  - **HU-065.2** Puede elegir unidades de distancia y formato horario cuando proceda.
  - **HU-065.3** Los cambios se reflejan en las pantallas compatibles.
  - **HU-065.4** Los textos no traducidos se identifican durante las pruebas y no aparecen como contenido roto.
- **Reglas y dependencias:** El castellano será el idioma base de UniMovil.

**Análisis INVEST:**

- **I · Independiente.** Es transversal a las pantallas existentes pero puede introducirse progresivamente sin bloquear flujos funcionales.
- **N · Negociable.** Puede acordarse qué segundo idioma se habilita primero y qué unidades opcionales aplican en distancias/horas.
- **V · Valiosa.** Mejora la comprensión para estudiantes internacionales y visitantes con distintas preferencias de lectura.
- **E · Estimable.** Catalogar claves de texto, formato de unidades/hora y fallback seguro al castellano acota el esfuerzo.
- **S · Pequeña.** Conviene introducir primero infraestructura i18n con cambio de unidades y un idioma adicional sobre pantallas principales.
- **T · Comprobable.** Cambiar idioma y formato horario verificando actualización en pantallas soportadas y ausencia de claves crudas sin traducir.

## HU-066 — Compartir una ruta

- **Prioridad:** Media
- **Historia:** Como usuario, quiero compartir una ruta, para que otra persona pueda consultarla y llegar al mismo destino.
- **Criterios de aceptación:**
  - **HU-066.1** El usuario puede compartir origen, destino y medio seleccionado.
  - **HU-066.2** El enlace no expone el historial ni la identidad del usuario.
  - **HU-066.3** La ruta compartida se recalcula si los datos han cambiado.
  - **HU-066.4** Si el destino deja de estar disponible, se informa al abrir el enlace.
- **Reglas y dependencias:** El enlace compartido debe seguir funcionando aunque se actualicen los datos del mapa.

**Análisis INVEST:**

- **I · Independiente.** Reutiliza enlaces públicos de HU-017 y el cálculo de rutas de HU-020/HU-022 sin requerir cuentas para abrir el enlace.
- **N · Negociable.** Se puede acordar la codificación estable de origen, destino y medio en los parámetros de la URL.
- **V · Valiosa.** Permite compartir un trayecto completo de forma segura sin filtrar datos personales del remitente.
- **E · Estimable.** Serialización de parámetros públicos, recálculo al abrir y mensaje ante destino inactivo delimitan claramente la historia.
- **S · Pequeña.** Cabe como extensión del esquema de enlaces profundos con recálculo en cliente.
- **T · Comprobable.** Generar enlace de ruta, abrirlo sin sesión comprobando recálculo actual y probar un identificador de destino retirado.
