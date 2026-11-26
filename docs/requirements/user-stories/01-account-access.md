# Historias de usuario: acceso y cuentas

## HU-001 — Consultar información pública sin registrarse

- **Prioridad:** Alta
- **Historia:** Como persona que visita el campus, quiero consultar la información de movilidad sin crear una cuenta, para orientarme rápidamente.
- **Descripción:** La información pública del campus debe estar disponible sin autenticación.
- **Criterios de aceptación:**
  - **CA-001.1** Dado que no tengo una sesión iniciada, cuando abro la aplicación, entonces puedo consultar el mapa, lugares, rutas, transporte, accesibilidad y avisos públicos.
  - **CA-001.2** Dado que intento realizar una acción que requiere cuenta, cuando la selecciono, entonces la aplicación informa de que debo registrarme o iniciar sesión.
  - **CA-001.3** La aplicación no solicita datos personales para consultar información pública.
  - **CA-001.4** La información pública no muestra datos privados de otros usuarios.
- **Reglas y dependencias:** Las acciones de crear incidencias, guardar preferencias y recibir notificaciones requieren una cuenta.

**Análisis INVEST:**

- **I · Independiente.** La consulta pública se puede probar con un catálogo de muestra y sin cuentas.
- **N · Negociable.** Se puede acordar qué sección se abre al entrar y cómo guiar hacia el registro desde funciones privadas.
- **V · Valiosa.** Quien llega por primera vez puede orientarse rápidamente sin registrarse.
- **E · Estimable.** Están acotadas las vistas públicas y las acciones que exigen cuenta autenticada.
- **S · Pequeña.** Primero, mapa y fichas sin registro; el resto de módulos se incorporan progresivamente como consultas abiertas.
- **T · Comprobable.** Entrar sin sesión, abrir mapa o ficha e intentar guardar favorito o enviar incidencia; la consulta funciona y la acción privada pide identificarse.

## HU-002 — Crear una cuenta

- **Prioridad:** Alta
- **Historia:** Como estudiante, profesor, trabajador o visitante, quiero registrarme, para guardar mis preferencias y participar en la aplicación.
- **Descripción:** Cualquier persona podrá crear una cuenta, indicando opcionalmente su relación con la universidad.
- **Criterios de aceptación:**
  - **CA-002.1** El formulario solicita únicamente los datos necesarios para crear la cuenta.
  - **CA-002.2** El sistema valida que el correo tenga un formato correcto y que no esté registrado.
  - **CA-002.3** El usuario puede indicar si es estudiante, profesor, personal universitario, visitante u otra persona.
  - **CA-002.4** Tras completar correctamente el registro, la cuenta queda creada y el usuario puede iniciar sesión.
  - **CA-002.5** Si faltan datos o son inválidos, se muestran mensajes claros sin perder la información ya introducida.
- **Refinamiento Sprint 6:** La cuenta no habilita funciones privadas hasta confirmar el correo. El email lo gestiona Supabase Auth; la relación con UCM es opcional y no concede permisos.
- **Reglas y dependencias:** El tipo de usuario no cambia los permisos generales de una cuenta registrada.

**Análisis INVEST:**

- **I · Independiente.** El alta se puede probar antes de tener favoritos o incidencias, apoyándose en el proveedor de autenticación.
- **N · Negociable.** La relación con la universidad es opcional y puede ajustarse en el formulario sin cambiar permisos.
- **V · Valiosa.** Permite disponer de una cuenta propia para funciones personales y participación.
- **E · Estimable.** Los campos mínimos, las reglas de correo único y la confirmación de email acotan el alcance.
- **S · Pequeña.** Cabe como flujo vertical de registro con validaciones de entrada y confirmación.
- **T · Comprobable.** Registrar un correo nuevo y repetir el mismo correo; solo el primer envío completa el alta y requiere confirmación previa al acceso privado.

## HU-003 — Iniciar y cerrar sesión

- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero iniciar y cerrar sesión, para proteger mi información y acceder desde mis dispositivos.
- **Criterios de aceptación:**
  - **CA-003.1** El usuario puede iniciar sesión con sus credenciales válidas.
  - **CA-003.2** Las credenciales inválidas producen un mensaje genérico y comprensible.
  - **CA-003.3** Una sesión iniciada permite acceder a favoritos, preferencias, incidencias propias y notificaciones.
  - **CA-003.4** El usuario puede cerrar sesión desde cualquier pantalla principal de su cuenta.
  - **CA-003.5** Tras cerrar sesión, no se puede acceder a los datos privados de la cuenta desde el dispositivo.
- **Reglas y dependencias:** Los permisos se comprueban en el servidor, no únicamente en la interfaz.

**Análisis INVEST:**

- **I · Independiente.** Necesita una cuenta válida de prueba y puede verificarse antes de terminar módulos personales avanzados.
- **N · Negociable.** Se puede acordar la ubicación del control de cierre de sesión y el manejo de sesión en móvil o BFF web.
- **V · Valiosa.** Protege la privacidad de la cuenta especialmente en equipos o navegadores compartidos.
- **E · Estimable.** Las operaciones de inicio, persistencia de sesión, cierre y verificación en servidor delimitan el trabajo.
- **S · Pequeña.** Un primer corte cubre entrar, acceder a perfil/favoritos y cerrar sesión invalidando credenciales locales.
- **T · Comprobable.** Probar credenciales válidas e inválidas, cerrar sesión y comprobar que las rutas privadas rechazan peticiones sin sesión.

## HU-004 — Recuperar el acceso a la cuenta

- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero recuperar mi cuenta si olvido la contraseña, para volver a utilizar mis datos.
- **Criterios de aceptación:**
  - **CA-004.1** El usuario puede solicitar la recuperación introduciendo su correo.
  - **CA-004.2** El sistema no revela si un correo existe o no en la plataforma.
  - **CA-004.3** El usuario recibe instrucciones mediante un mecanismo seguro de recuperación.
  - **CA-004.4** El enlace o código de recuperación caduca y no puede reutilizarse indefinidamente.
  - **CA-004.5** La nueva contraseña debe cumplir los requisitos de seguridad definidos.
- **Reglas y dependencias:** El mecanismo de envío debe configurarse antes de activar esta funcionalidad en producción.

**Análisis INVEST:**

- **I · Independiente.** Depende únicamente del sistema de cuentas y del canal de recuperación, no de edición de perfil ni favoritos.
- **N · Negociable.** El flujo de enlace temporal o restablecimiento puede adaptarse al proveedor de autenticación elegido.
- **V · Valiosa.** Permite recuperar la cuenta sin perder datos ni requerir intervención manual de soporte.
- **E · Estimable.** Están acotadas la respuesta uniforme, la caducidad del token y las validaciones de nueva contraseña.
- **S · Pequeña.** Abarca la solicitud, la pantalla de restablecimiento y la invalidación de enlaces ya usados o caducados.
- **T · Comprobable.** Solicitar recuperación para un correo registrado y otro inexistente, verificar respuesta equivalente y comprobar rechazo al reutilizar el enlace.

## HU-005 — Gestionar los datos del perfil

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero consultar y modificar mis datos, para mantener mi cuenta actualizada.
- **Criterios de aceptación:**
  - **CA-005.1** El usuario puede consultar los datos asociados a su perfil.
  - **CA-005.2** El usuario puede modificar los campos permitidos.
  - **CA-005.3** El sistema valida los nuevos valores antes de guardarlos.
  - **CA-005.4** El sistema confirma que los cambios se han guardado correctamente.
  - **CA-005.5** Los datos privados del perfil no son visibles públicamente.
- **Refinamiento Sprint 6:** El perfil de UniMovil guarda únicamente la relación opcional con UCM y los datos funcionales necesarios; el email se consulta desde Auth, sin duplicarlo en el perfil.
- **Reglas y dependencias:** La aplicación solo almacenará datos necesarios para las funciones del producto.

**Análisis INVEST:**

- **I · Independiente.** Solo requiere una sesión autenticada; no depende de rutas, incidencias ni notificaciones.
- **N · Negociable.** Puede ajustarse qué campos de perfil mínimo se muestran como solo lectura o editables.
- **V · Valiosa.** El titular mantiene al día su relación opcional con la universidad sin asistencia externa.
- **E · Estimable.** La limitación a relación opcional y validaciones en contrato acota claramente el esfuerzo.
- **S · Pequeña.** Lectura, edición, validación y confirmación forman una entrega vertical compacta.
- **T · Comprobable.** Consultar el perfil, guardar un cambio válido y verificar persistencia; comprobar que un valor inválido se rechaza sin alterar el dato previo.

## HU-006 — Eliminar una cuenta

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero eliminar mi cuenta, para dejar de utilizar el servicio y retirar mis datos personales.
- **Criterios de aceptación:**
  - **CA-006.1** El sistema explica las consecuencias antes de confirmar la eliminación.
  - **CA-006.2** El usuario debe confirmar la acción de forma explícita.
  - **CA-006.3** Tras confirmar, la cuenta deja de permitir el acceso.
  - **CA-006.4** El sistema elimina o anonimiza los datos personales conforme a la política definida.
  - **CA-006.5** Las incidencias públicas conservan únicamente la información necesaria para mantener su trazabilidad.
- **Refinamiento Sprint 6:** El borrado requiere confirmación explícita, invalida sesiones y elimina perfil y favoritos. Las incidencias y evidencias se eliminan o anonimizan conforme a la política aprobada antes de tratar datos reales.
- **Reglas y dependencias:** La eliminación debe respetar obligaciones legales y registros administrativos legítimos.

**Análisis INVEST:**

- **I · Independiente.** Parte de una cuenta existente y sus tablas relacionadas, con impacto acotado sobre incidencias/evidencias asociadas.
- **N · Negociable.** Se puede acordar la redacción del aviso de confirmación y el detalle de anonimización según política aprobada.
- **V · Valiosa.** Garantiza al usuario el control efectivo para darse de baja y retirar sus datos personales.
- **E · Estimable.** Requiere coordinar Auth, perfil, favoritos y referencias de incidencias de manera idempotente.
- **S · Pequeña.** Se acota a la confirmación explícita, revocación de sesión y retirada de datos privados del usuario.
- **T · Comprobable.** Cancelar una baja manteniendo la cuenta operativa; confirmarla después con una cuenta de prueba y comprobar denegación de acceso y ausencia de datos personales.

## HU-007 — Gestionar permisos del dispositivo

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero controlar los permisos de ubicación y notificaciones, para decidir qué información comparto con la aplicación.
- **Criterios de aceptación:**
  - **CA-007.1** La aplicación explica para qué necesita cada permiso antes de solicitarlo.
  - **CA-007.2** El usuario puede aceptar o rechazar la ubicación y las notificaciones por separado.
  - **CA-007.3** Si se rechaza la ubicación, se mantienen las funciones que no dependen de ella.
  - **CA-007.4** El usuario puede cambiar sus preferencias desde la configuración.
  - **CA-007.5** La aplicación no rastrea continuamente la ubicación sin consentimiento explícito.
- **Reglas y dependencias:** El sistema operativo puede revocar permisos en cualquier momento y la aplicación debe manejarlo.

**Análisis INVEST:**

- **I · Independiente.** Cada permiso puede tratarse y probarse por separado aunque dependa de las capacidades del sistema operativo.
- **N · Negociable.** Puede ajustarse el texto explicativo y el momento en que se invita a activar cada permiso.
- **V · Valiosa.** Da transparencia y permite usar la app con control granular de privacidad.
- **E · Estimable.** Exige concretar las plataformas soportadas y los estados de concesión, rechazo y revocación desde ajustes del sistema.
- **S · Pequeña.** Conviene separar el control de ubicación del control de notificaciones para entregarlos de forma incremental.
- **T · Comprobable.** Denegar ubicación manteniendo o rechazando notificaciones, verificar uso manual del mapa y comprobar el enlace a ajustes tras revocación del sistema.
