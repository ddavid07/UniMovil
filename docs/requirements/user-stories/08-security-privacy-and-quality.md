# Historias de usuario: seguridad, privacidad y calidad

## HU-090 — Proteger los datos de la cuenta

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero que mis datos estén protegidos, para utilizar UniMovil con confianza.
- **Criterios de aceptación:**
  - **HU-090.1** Las contraseñas no se almacenan en texto plano.
  - **HU-090.2** Las comunicaciones entre aplicación y servidor se realizan mediante un canal seguro.
  - **HU-090.3** Las respuestas no incluyen datos privados de otros usuarios.
  - **HU-090.4** Las sesiones caducan o pueden revocarse según la política definida.
  - **HU-090.5** Los errores no muestran credenciales, tokens ni información sensible.
- **Reglas y dependencias:** La implementación debe seguir las prácticas de seguridad acordadas por el equipo.

**Análisis INVEST:**

- **I · Independiente.** Se valida sobre Auth, sesiones BFF/SecureStore y respuestas del API desde Sprint 6 sin esperar a funciones futuras.
- **N · Negociable.** Se pueden ajustar los plazos de expiración absoluta/renovación de sesión y la política de cabeceras seguras.
- **V · Valiosa.** Protege credenciales, sesiones y datos privados frente a filtraciones o accesos cruzados.
- **E · Estimable.** Delegar hash en Supabase Auth, sesiones seguras, redacción de errores y pruebas negativas permite estimarla con rigor.
- **S · Pequeña.** Se verifica de manera transversal junto a cada endpoint autenticado y flujo de sesión.
- **T · Comprobable.** Probar petición cruzada entre cuentas, token caducado, cierre de sesión e inspección de errores verificando ausencia de secretos.

## HU-091 — Controlar el acceso a funcionalidades

- **Prioridad:** Alta
- **Historia:** Como administrador, quiero que cada acción compruebe los permisos del usuario, para evitar accesos no autorizados.
- **Criterios de aceptación:**
  - **HU-091.1** Una persona no autenticada no puede crear incidencias ni modificar datos.
  - **HU-091.2** Un usuario registrado no puede acceder a funciones de gestión.
  - **HU-091.3** Un gestor no puede ejecutar acciones reservadas al administrador.
  - **HU-091.4** Los permisos se validan en el servidor además de ocultar opciones en la interfaz.
  - **HU-091.5** Un intento no autorizado produce una respuesta controlada y queda registrado cuando corresponda.
- **Reglas y dependencias:** Los permisos se basan en roles, no en datos introducidos libremente por el usuario.

**Análisis INVEST:**

- **I · Independiente.** Los controles de autenticación y propiedad se aplican desde Sprint 6/7 y se amplían con roles de gestor y administrador en Sprints 8 y 10.
- **N · Negociable.** Se puede acordar la matriz exacta de permisos por rol y el nivel de detalle registrado en intentos denegados.
- **V · Valiosa.** Garantiza que la seguridad no dependa solo de ocultar botones en el cliente.
- **E · Estimable.** Guards en servidor, denegación por defecto y suite de pruebas negativas por cada rol acotan el esfuerzo.
- **S · Pequeña.** Se implementa incrementalmente por cada grupo de endpoints (usuario en Sprint 6–7, gestor/admin en Sprint 8–10).
- **T · Comprobable.** Ejecutar peticiones directas al API con usuario anónimo, ordinario, gestor y administrador verificando 401/403 según la matriz.

## HU-092 — Gestionar privacidad y consentimiento

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero saber qué datos utiliza UniMovil y decidir sobre ellos, para mantener el control de mi privacidad.
- **Criterios de aceptación:**
  - **HU-092.1** La aplicación explica el uso de ubicación, notificaciones y datos de cuenta.
  - **HU-092.2** El usuario puede aceptar o rechazar permisos opcionales.
  - **HU-092.3** Puede retirar permisos posteriormente.
  - **HU-092.4** La aplicación funciona con las funciones no dependientes de un permiso rechazado.
  - **HU-092.5** Las preferencias de privacidad se conservan y pueden modificarse.
- **Reglas y dependencias:** Debe revisarse la política de privacidad antes de publicar la aplicación.

**Análisis INVEST:**

- **I · Independiente.** La explicación previa y el uso sin permisos opcionales se prueban desde Sprint 2 y 6; las preferencias persistentes se completan en Sprint 12.
- **N · Negociable.** Se puede ajustar la redacción de los avisos informativos y la ubicación de la pantalla de privacidad.
- **V · Valiosa.** Da transparencia y control efectivo al usuario sobre qué datos comparte y cuándo.
- **E · Estimable.** Separar el corte informativo/operativo actual de la persistencia de preferencias opcionales permite estimar ambos bloques.
- **S · Pequeña.** Cada permiso o preferencia opcional se entrega en su flujo correspondiente sin bloquear la consulta pública.
- **T · Comprobable.** Rechazar permisos opcionales comprobando uso del mapa/búsqueda, revisar textos de privacidad y comprobar persistencia al modificarlos.

## HU-093 — Acceder a los datos personales

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero consultar los datos personales que almacena UniMovil, para verificar que son correctos.
- **Criterios de aceptación:**
  - **HU-093.1** El usuario puede consultar sus datos de perfil y preferencias.
  - **HU-093.2** Puede identificar qué datos se utilizan para cada función principal.
  - **HU-093.3** Los datos se muestran de forma comprensible.
  - **HU-093.4** La consulta no permite ver datos de otras cuentas.
- **Reglas y dependencias:** La información mostrada debe coincidir con la política de privacidad.

**Análisis INVEST:**

- **I · Independiente.** Depende únicamente de la cuenta autenticada y los datos mínimos guardados en perfil/favoritos; no requiere panel admin.
- **N · Negociable.** Se puede acordar la presentación resumida por categoría de dato (cuenta, perfil, favoritos, incidencias).
- **V · Valiosa.** Cumple transparencia básica sobre qué información personal conserva realmente la plataforma.
- **E · Estimable.** Consulta autenticada de datos propios y vista explicativa en cuenta acotan claramente el alcance.
- **S · Pequeña.** Cabe como sección dedicada dentro de la pantalla de cuenta/privacidad.
- **T · Comprobable.** Iniciar sesión verificando los datos propios mostrados y comprobar que la API rechaza cualquier intento de leer otra cuenta.

## HU-094 — Gestionar errores y falta de conexión

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero recibir información clara cuando algo falla, para saber qué puedo hacer a continuación.
- **Criterios de aceptación:**
  - **HU-094.1** La aplicación diferencia falta de conexión, error del servidor, permisos insuficientes y ausencia de resultados cuando sea posible.
  - **HU-094.2** Muestra un mensaje comprensible y una acción recomendada.
  - **HU-094.3** Permite reintentar operaciones recuperables.
  - **HU-094.4** No borra datos introducidos por el usuario sin confirmación.
  - **HU-094.5** No muestra detalles técnicos inseguros en la interfaz pública.
- **Reglas y dependencias:** Los errores completos deben registrarse de forma segura para facilitar su diagnóstico.

**Análisis INVEST:**

- **I · Independiente.** Aunque los estados básicos de error acompañan a cada pantalla, su homogeneización transversal se cierra en Sprint 13 sobre todos los flujos.
- **N · Negociable.** Se puede acordar la redacción de mensajes de error y qué formularios conservan borrador local tras un fallo de red.
- **V · Valiosa.** Evita frustración y pérdida de formularios cuando falla la red o el servidor, sin exponer trazas técnicas.
- **E · Estimable.** Tipificar errores de red, servidor, permisos y estado vacío en cada flujo permite estimar el barrido completo.
- **S · Pequeña.** Conviene revisar flujo a flujo (mapa, cuenta, incidencias, avisos) añadiendo pruebas de fallo simulado.
- **T · Comprobable.** Simular pérdida de red al enviar un formulario o consultar API comprobando mensaje claro, conservación de entradas y botón de reintento.

## HU-095 — Utilizar una interfaz accesible

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero utilizar UniMovil independientemente de mis capacidades, para acceder a la información de movilidad en igualdad de condiciones.
- **Criterios de aceptación:**
  - **HU-095.1** Los controles tienen nombres accesibles.
  - **HU-095.2** La interfaz mantiene contraste y legibilidad suficientes.
  - **HU-095.3** La información no depende únicamente del color.
  - **HU-095.4** La aplicación es usable con lector de pantalla y tamaños de texto ampliados.
  - **HU-095.5** Los mapas y rutas disponen de una alternativa textual cuando sea necesario.
- **Reglas y dependencias:** El equipo validará la interfaz con herramientas automáticas y pruebas manuales.

**Análisis INVEST:**

- **I · Independiente.** Cada pantalla debe nacer accesible según DoD, y la auditoría integral de Sprint 13 verifica todo el conjunto en web y móvil.
- **N · Negociable.** Se puede ajustar la presentación de alternativas textuales y el orden de foco por teclado en web.
- **V · Valiosa.** Garantiza acceso en igualdad de condiciones con lector de pantalla, teclado o texto ampliado.
- **E · Estimable.** Revisar roles/etiquetas accesibles, contraste, leyenda no cromática, texto grande y navegación con teclado acota la verificación.
- **S · Pequeña.** Se aborda por pantalla y se consolida con comprobaciones automáticas y recorrido manual en Sprint 13.
- **T · Comprobable.** Recorrer pantallas principales con teclado y lector de pantalla, ampliar tamaño de texto y verificar alternativas textuales al mapa.

## HU-096 — Consultar ayuda y soporte

- **Prioridad:** Media
- **Historia:** Como usuario, quiero consultar ayuda y contactar con el equipo responsable, para resolver dudas o comunicar problemas.
- **Criterios de aceptación:**
  - **HU-096.1** Existe una sección de preguntas frecuentes.
  - **HU-096.2** Explica el uso de mapa, rutas, incidencias, permisos y notificaciones.
  - **HU-096.3** Incluye un canal de contacto o formulario cuando esté configurado.
  - **HU-096.4** El usuario puede comunicar un error técnico sin exponer credenciales.
  - **HU-096.5** Se muestra la versión instalada de la aplicación.
- **Reglas y dependencias:** El canal de soporte y los tiempos de respuesta deben definirse por el equipo responsable.

**Análisis INVEST:**

- **I · Independiente.** Es una vista informativa autocontenida que solo lee la versión real del paquete y enlaza al canal definido en Sprint 13.
- **N · Negociable.** El contenido de preguntas frecuentes y el canal de contacto aprobado se ajustan con el equipo responsable.
- **V · Valiosa.** Reduce dudas de uso y ofrece una vía clara para reportar fallos técnicos de la app sin mezclarlos con incidencias del campus.
- **E · Estimable.** Vista FAQ estática coherente con funciones reales, versión de build y enlace/canal de soporte acotan el esfuerzo.
- **S · Pequeña.** Pantalla accesible de ayuda y versión forma una entrega pequeña y directa.
- **T · Comprobable.** Abrir ayuda verificando versión mostrada, coherencia con funciones activas y ausencia de datos sensibles en el canal de contacto.

## HU-097 — Mantener trazabilidad de los cambios relevantes

- **Prioridad:** Media
- **Historia:** Como responsable del proyecto, quiero conocer qué cambios se han realizado en información sensible, para poder revisar y corregir errores.
- **Criterios de aceptación:**
  - **HU-097.1** Se registran cambios en lugares, rutas, horarios, accesibilidad, avisos e incidencias.
  - **HU-097.2** Cada registro incluye autor y fecha.
  - **HU-097.3** Los registros no contienen secretos ni contraseñas.
  - **HU-097.4** Los administradores autorizados pueden consultar el historial.
  - **HU-097.5** La información puede relacionarse con la versión publicada del dato.
- **Reglas y dependencias:** Se relaciona con HU-077 y debe respetar la política de conservación de registros.

**Análisis INVEST:**

- **I · Independiente.** Define el modelo transversal de eventos auditables desde Sprint 8 y se va conectando a cada dominio en Sprints 9–11.
- **N · Negociable.** Puede acordarse la estructura exacta de resumen de cambio y referencia a versión de conjunto de datos.
- **V · Valiosa.** Permite auditar cualquier alteración sobre datos sensibles de campus, accesibilidad o moderación.
- **E · Estimable.** Servicio de auditoría reutilizable por dominio, metadatos de autor/fecha/versión y redacción de secretos acotan la tarea.
- **S · Pequeña.** Se introduce como componente transversal en Sprint 8 para incidencias y se reutiliza en avisos, catálogo y transporte.
- **T · Comprobable.** Ejecutar una mutación en cada dominio cubierto verificando evento persistido con autor, fecha, entidad, versión y sin secretos.

## HU-098 — Consultar los cambios de una versión

- **Prioridad:** Baja
- **Historia:** Como usuario, quiero saber qué ha cambiado en una nueva versión, para entender las mejoras y correcciones disponibles.
- **Criterios de aceptación:**
  - **HU-098.1** La aplicación muestra su versión actual.
  - **HU-098.2** Las versiones publicadas tienen una descripción de cambios.
  - **HU-098.3** El usuario puede consultar novedades relevantes desde la aplicación.
  - **HU-098.4** Una actualización no elimina favoritos, preferencias ni incidencias asociadas a la cuenta.
- **Reglas y dependencias:** La distribución de versiones depende de las tiendas de Android y iOS.

**Análisis INVEST:**

- **I · Independiente.** Vista ligera de notas de versión junto a la versión real del artefacto; se prepara en Sprint 13 sin bloquear funcionalidades previas.
- **N · Negociable.** Se puede acordar si las notas de versión se empaquetan con el release o se consultan desde un endpoint público.
- **V · Valiosa.** Comunica novedades reales al usuario con transparencia y confirma la conservación de sus datos tras actualizar.
- **E · Estimable.** Mostrar versión actual, lista de notas fieles al artefacto y pruebas de migración sin pérdida de datos acotan el trabajo.
- **S · Pequeña.** Pantalla sencilla de novedades vinculada a los datos de release cabe en una tarea corta de Sprint 13.
- **T · Comprobable.** Abrir novedades comprobando coincidencia con la versión instalada y verificar tras actualización simulada que favoritos e incidencias permanecen intactos.
