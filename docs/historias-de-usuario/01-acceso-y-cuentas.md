# Historias de usuario: acceso y cuentas

## HU-001 — Consultar información pública sin registrarse

- **Prioridad:** Alta
- **Historia:** Como persona que visita el campus, quiero consultar la información de movilidad sin crear una cuenta, para orientarme rápidamente.
- **Descripción:** La información pública del campus debe estar disponible sin autenticación.
- **Criterios de aceptación:**
  - Dado que no tengo una sesión iniciada, cuando abro la aplicación, entonces puedo consultar el mapa, lugares, rutas, transporte, accesibilidad y avisos públicos.
  - Dado que intento realizar una acción que requiere cuenta, cuando la selecciono, entonces la aplicación informa de que debo registrarme o iniciar sesión.
  - La aplicación no solicita datos personales para consultar información pública.
  - La información pública no muestra datos privados de otros usuarios.
- **Reglas y dependencias:** Las acciones de crear incidencias, guardar preferencias y recibir notificaciones requieren una cuenta.

## HU-002 — Crear una cuenta

- **Prioridad:** Alta
- **Historia:** Como estudiante, profesor, trabajador o visitante, quiero registrarme, para guardar mis preferencias y participar en la aplicación.
- **Descripción:** Cualquier persona podrá crear una cuenta, indicando opcionalmente su relación con la universidad.
- **Criterios de aceptación:**
  - El formulario solicita únicamente los datos necesarios para crear la cuenta.
  - El sistema valida que el correo tenga un formato correcto y que no esté registrado.
  - El usuario puede indicar si es estudiante, profesor, personal universitario, visitante u otra persona.
  - Tras completar correctamente el registro, la cuenta queda creada y el usuario puede iniciar sesión.
  - Si faltan datos o son inválidos, se muestran mensajes claros sin perder la información ya introducida.
- **Reglas y dependencias:** El tipo de usuario no cambia los permisos generales de una cuenta registrada.

## HU-003 — Iniciar y cerrar sesión

- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero iniciar y cerrar sesión, para proteger mi información y acceder desde mis dispositivos.
- **Criterios de aceptación:**
  - El usuario puede iniciar sesión con sus credenciales válidas.
  - Las credenciales inválidas producen un mensaje genérico y comprensible.
  - Una sesión iniciada permite acceder a favoritos, preferencias, incidencias propias y notificaciones.
  - El usuario puede cerrar sesión desde cualquier pantalla principal de su cuenta.
  - Tras cerrar sesión, no se puede acceder a los datos privados de la cuenta desde el dispositivo.
- **Reglas y dependencias:** Los permisos se comprueban en el servidor, no únicamente en la interfaz.

## HU-004 — Recuperar el acceso a la cuenta

- **Prioridad:** Alta
- **Historia:** Como usuario registrado, quiero recuperar mi cuenta si olvido la contraseña, para volver a utilizar mis datos.
- **Criterios de aceptación:**
  - El usuario puede solicitar la recuperación introduciendo su correo.
  - El sistema no revela si un correo existe o no en la plataforma.
  - El usuario recibe instrucciones mediante un mecanismo seguro de recuperación.
  - El enlace o código de recuperación caduca y no puede reutilizarse indefinidamente.
  - La nueva contraseña debe cumplir los requisitos de seguridad definidos.
- **Reglas y dependencias:** El mecanismo de envío debe configurarse antes de activar esta funcionalidad en producción.

## HU-005 — Gestionar los datos del perfil

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero consultar y modificar mis datos, para mantener mi cuenta actualizada.
- **Criterios de aceptación:**
  - El usuario puede consultar los datos asociados a su perfil.
  - El usuario puede modificar los campos permitidos.
  - El sistema valida los nuevos valores antes de guardarlos.
  - El sistema confirma que los cambios se han guardado correctamente.
  - Los datos privados del perfil no son visibles públicamente.
- **Reglas y dependencias:** La aplicación solo almacenará datos necesarios para las funciones del producto.

## HU-006 — Eliminar una cuenta

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero eliminar mi cuenta, para dejar de utilizar el servicio y retirar mis datos personales.
- **Criterios de aceptación:**
  - El sistema explica las consecuencias antes de confirmar la eliminación.
  - El usuario debe confirmar la acción de forma explícita.
  - Tras confirmar, la cuenta deja de permitir el acceso.
  - El sistema elimina o anonimiza los datos personales conforme a la política definida.
  - Las incidencias públicas conservan únicamente la información necesaria para mantener su trazabilidad.
- **Reglas y dependencias:** La eliminación debe respetar obligaciones legales y registros administrativos legítimos.

## HU-007 — Gestionar permisos del dispositivo

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero controlar los permisos de ubicación y notificaciones, para decidir qué información comparto con la aplicación.
- **Criterios de aceptación:**
  - La aplicación explica para qué necesita cada permiso antes de solicitarlo.
  - El usuario puede aceptar o rechazar la ubicación y las notificaciones por separado.
  - Si se rechaza la ubicación, se mantienen las funciones que no dependen de ella.
  - El usuario puede cambiar sus preferencias desde la configuración.
  - La aplicación no rastrea continuamente la ubicación sin consentimiento explícito.
- **Reglas y dependencias:** El sistema operativo puede revocar permisos en cualquier momento y la aplicación debe manejarlo.
