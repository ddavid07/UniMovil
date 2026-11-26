# ADR-0015: identidad Supabase y sesiones de usuario

- **Estado:** Aceptada
- **Fecha:** 2026-11-25
- **Decisores:** Equipo UniMovil
- **Relacionado con:** ADR-0002, ADR-0003 y ADR-0014

## Contexto

HU-002–006 y HU-060 requieren registro, inicio y cierre de sesión, recuperación, perfil, eliminación de cuenta y favoritos privados en clientes nativos y web. La API debe comprobar identidad y permisos; ocultar controles en la interfaz no es autorización. El cliente web es una exportación estática y no dispone de un servidor de renderizado propio.

## Decisión

- Usar Supabase Auth para credenciales, verificación de correo, recuperación y emisión/renovación de tokens. UniMovil no almacenará contraseñas ni implementará su propio protocolo de autenticación.
- Aplicar email confirmado para habilitar las funciones de cuenta. La recuperación utilizará enlaces o códigos de un solo uso y caducidad configurada; las respuestas no revelarán si un correo está registrado.
- La API NestJS validará el JWT de Supabase en cada solicitud privada y aplicará autorización por propietario y rol. El perfil opcional de relación con UCM no concederá permisos. Los roles de gestión se asignarán solo desde operaciones de servidor autorizadas.
- En Android/iOS, el cliente guardará la sesión mediante almacenamiento seguro del sistema operativo (Keychain/Keystore a través de Expo SecureStore) y enviará tokens de acceso como bearer al API. No se persistirán tokens en AsyncStorage sin cifrado.
- En web, usar un flujo BFF con cookie opaca de sesión `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` y sin atributo `Domain`. El token de renovación se conservará del lado del servidor cifrado con una clave suministrada como secreto; el cliente web no escribirá tokens en `localStorage` ni `sessionStorage`. La sesión web requiere servir el cliente y la API bajo el mismo sitio y proteger operaciones mutables frente a CSRF y orígenes no autorizados.
- Los cambios de contraseña, recuperación, cierre de sesión y eliminación revocarán o invalidarán las sesiones conforme a las capacidades de Auth. La eliminación se ejecutará en servidor y eliminará perfil, preferencias y favoritos; las incidencias y evidencias se tratarán conforme a la política aprobada en ADR-0016 y ADR-0018.
- El SMTP integrado de Supabase se limitará a desarrollo. La entrega a usuarios reales requerirá un servicio SMTP aprobado, dominio y credenciales configurados fuera del repositorio.
- Para desarrollar y probar el flujo se usan cuentas ficticias en Supabase local. La disponibilidad de SMTP, dominio, titularidad, política y retención para un servicio gestionado se acepta como riesgo del Sprint y no bloquea el incremento local; esta implementación no configura un servicio de producción.

## Alternativas consideradas

- **Autenticación propia en NestJS:** descartada para evitar implementar almacenamiento de contraseñas, recuperación, rotación y protección de credenciales.
- **Autorización solo en el cliente:** descartada porque puede eludirse y contradice HU-091.
- **Tokens persistentes en almacenamiento web accesible a JavaScript:** descartados por aumentar el impacto de una vulnerabilidad XSS.
- **Permisos de gestión derivados de campos editables del perfil:** descartados; la relación declarada con la universidad no representa un rol autorizado.

## Consecuencias

- El API necesita middleware de validación de JWT y autorización por recurso; las pruebas deben intentar leer y modificar recursos de otras cuentas.
- La web necesita configuración de mismo sitio, cookie segura, protección CSRF, control de caché y cierre/renovación de sesión. El alojamiento y dominio web/API deben respetar esta restricción antes de habilitar sesiones reales.
- Supabase local captura los mensajes en un buzón de pruebas. Configurar SMTP gestionado, dominio y políticas para un eventual servicio público queda fuera del incremento y no bloqueó el desarrollo local.

## Referencias

- [HU-002–006](../requirements/user-stories/01-account-access.md)
- [HU-060](../requirements/user-stories/06-personalization-and-notifications.md)
- [HU-090–093](../requirements/user-stories/08-security-privacy-and-quality.md)
- [Supabase Auth con Expo](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native)
- [Supabase: elegir paquete de servidor](https://supabase.com/docs/guides/auth/choosing-a-server-package)
- [Supabase: JWT](https://supabase.com/docs/guides/auth/jwts)
- [Supabase: configurar SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
