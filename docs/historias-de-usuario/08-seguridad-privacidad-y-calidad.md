# Historias de usuario: seguridad, privacidad y calidad

## HU-090 — Proteger los datos de la cuenta

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero que mis datos estén protegidos, para utilizar UniMovil con confianza.
- **Criterios de aceptación:**
  - Las contraseñas no se almacenan en texto plano.
  - Las comunicaciones entre aplicación y servidor se realizan mediante un canal seguro.
  - Las respuestas no incluyen datos privados de otros usuarios.
  - Las sesiones caducan o pueden revocarse según la política definida.
  - Los errores no muestran credenciales, tokens ni información sensible.
- **Reglas y dependencias:** La implementación debe seguir las prácticas de seguridad acordadas por el equipo.

## HU-091 — Controlar el acceso a funcionalidades

- **Prioridad:** Alta
- **Historia:** Como administrador, quiero que cada acción compruebe los permisos del usuario, para evitar accesos no autorizados.
- **Criterios de aceptación:**
  - Una persona no autenticada no puede crear incidencias ni modificar datos.
  - Un usuario registrado no puede acceder a funciones de gestión.
  - Un gestor no puede ejecutar acciones reservadas al administrador.
  - Los permisos se validan en el servidor además de ocultar opciones en la interfaz.
  - Un intento no autorizado produce una respuesta controlada y queda registrado cuando corresponda.
- **Reglas y dependencias:** Los permisos se basan en roles, no en datos introducidos libremente por el usuario.

## HU-092 — Gestionar privacidad y consentimiento

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero saber qué datos utiliza UniMovil y decidir sobre ellos, para mantener el control de mi privacidad.
- **Criterios de aceptación:**
  - La aplicación explica el uso de ubicación, notificaciones y datos de cuenta.
  - El usuario puede aceptar o rechazar permisos opcionales.
  - Puede retirar permisos posteriormente.
  - La aplicación funciona con las funciones no dependientes de un permiso rechazado.
  - Las preferencias de privacidad se conservan y pueden modificarse.
- **Reglas y dependencias:** Debe revisarse la política de privacidad antes de publicar la aplicación.

## HU-093 — Acceder a los datos personales

- **Prioridad:** Media
- **Historia:** Como usuario registrado, quiero consultar los datos personales que almacena UniMovil, para verificar que son correctos.
- **Criterios de aceptación:**
  - El usuario puede consultar sus datos de perfil y preferencias.
  - Puede identificar qué datos se utilizan para cada función principal.
  - Los datos se muestran de forma comprensible.
  - La consulta no permite ver datos de otras cuentas.
- **Reglas y dependencias:** La información mostrada debe coincidir con la política de privacidad.

## HU-094 — Gestionar errores y falta de conexión

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero recibir información clara cuando algo falla, para saber qué puedo hacer a continuación.
- **Criterios de aceptación:**
  - La aplicación diferencia falta de conexión, error del servidor, permisos insuficientes y ausencia de resultados cuando sea posible.
  - Muestra un mensaje comprensible y una acción recomendada.
  - Permite reintentar operaciones recuperables.
  - No borra datos introducidos por el usuario sin confirmación.
  - No muestra detalles técnicos inseguros en la interfaz pública.
- **Reglas y dependencias:** Los errores completos deben registrarse de forma segura para facilitar su diagnóstico.

## HU-095 — Utilizar una interfaz accesible

- **Prioridad:** Alta
- **Historia:** Como usuario, quiero utilizar UniMovil independientemente de mis capacidades, para acceder a la información de movilidad en igualdad de condiciones.
- **Criterios de aceptación:**
  - Los controles tienen nombres accesibles.
  - La interfaz mantiene contraste y legibilidad suficientes.
  - La información no depende únicamente del color.
  - La aplicación es usable con lector de pantalla y tamaños de texto ampliados.
  - Los mapas y rutas disponen de una alternativa textual cuando sea necesario.
- **Reglas y dependencias:** El equipo validará la interfaz con herramientas automáticas y pruebas manuales.

## HU-096 — Consultar ayuda y soporte

- **Prioridad:** Media
- **Historia:** Como usuario, quiero consultar ayuda y contactar con el equipo responsable, para resolver dudas o comunicar problemas.
- **Criterios de aceptación:**
  - Existe una sección de preguntas frecuentes.
  - Explica el uso de mapa, rutas, incidencias, permisos y notificaciones.
  - Incluye un canal de contacto o formulario cuando esté configurado.
  - El usuario puede comunicar un error técnico sin exponer credenciales.
  - Se muestra la versión instalada de la aplicación.
- **Reglas y dependencias:** El canal de soporte y los tiempos de respuesta deben definirse por el equipo responsable.

## HU-097 — Mantener trazabilidad de los cambios relevantes

- **Prioridad:** Media
- **Historia:** Como responsable del proyecto, quiero conocer qué cambios se han realizado en información sensible, para poder revisar y corregir errores.
- **Criterios de aceptación:**
  - Se registran cambios en lugares, rutas, horarios, accesibilidad, avisos e incidencias.
  - Cada registro incluye autor y fecha.
  - Los registros no contienen secretos ni contraseñas.
  - Los administradores autorizados pueden consultar el historial.
  - La información puede relacionarse con la versión publicada del dato.
- **Reglas y dependencias:** Se relaciona con HU-077 y debe respetar la política de conservación de registros.

## HU-098 — Recibir actualizaciones de la aplicación

- **Prioridad:** Baja
- **Historia:** Como usuario, quiero saber qué ha cambiado en una nueva versión, para entender las mejoras y correcciones disponibles.
- **Criterios de aceptación:**
  - La aplicación muestra su versión actual.
  - Las versiones publicadas tienen una descripción de cambios.
  - El usuario puede consultar novedades relevantes desde la aplicación.
  - Una actualización no elimina favoritos, preferencias ni incidencias asociadas a la cuenta.
- **Reglas y dependencias:** La distribución de versiones depende de las tiendas de Android y iOS.
