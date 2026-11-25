# Sprint 6 — cuentas, privacidad y favoritos

> **Estado:** incremento implementado y comprobado contra Supabase local con cuentas sintéticas. ADR-0014 y ADR-0015 están aceptados. SMTP gestionado, servicio alojado y políticas institucionales no se configuraron; se aceptan como riesgos externos y no bloquearon el trabajo local.

## Sprint Goal

Una persona puede crear y gestionar su cuenta, consultar sus datos, y guardar favoritos privados que persisten entre sesiones; mapa, búsqueda, rutas y otra información pública siguen disponibles sin autenticarse.

## Historias seleccionadas para el plan

| ID         | Historia                                                                                                      | Resultado verificable                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| HU-001     | [Consultar información pública sin registrarse](../../user-stories/01-account-access.md)                      | El acceso público no requiere cuenta, ubicación ni datos personales.                                |
| HU-002–006 | [Crear, gestionar y eliminar cuenta](../../user-stories/01-account-access.md)                                 | Ciclo de vida de cuenta mediante Supabase Auth, perfil mínimo y borrado coherente.                  |
| HU-014     | [Consultar la ficha de un lugar](../../user-stories/02-campus-map-search-and-places.md)                       | Ficha con datos disponibles y verificados, estado explícito y opción de favorito con sesión.        |
| HU-060     | [Guardar favoritos](../../user-stories/06-personalization-and-notifications.md)                               | Favoritos de lugares y recursos privados, persistentes y aislados por cuenta.                       |
| HU-090–093 | [Seguridad, autorización, privacidad y acceso a datos](../../user-stories/08-security-privacy-and-quality.md) | Controles aplicados por API y experiencia que informa de los datos y permite consultar los propios. |

## Decisiones y dependencias

- Implementar [ADR-0014](../../adr/0014-supabase-managed-platform.md) y [ADR-0015](../../adr/0015-supabase-auth-and-sessions.md): Supabase Auth y Postgres/PostGIS; API NestJS; Drizzle como esquema y migraciones; Frankfurt como región elegida para el proyecto gestionado.
- El incremento se desarrolla y verifica con Supabase local y datos sintéticos. No necesita proyecto remoto, contrato de alojamiento ni cuentas reales.
- La falta de SMTP gestionado, dominio, políticas de privacidad y conservación/borrado se acepta como riesgo de implementación local; no impide probar Auth, confirmación, recuperación y autorización mediante el buzón de pruebas local.
- La sesión nativa usa Expo SecureStore; probar tamaño y recuperación de los tokens en Android. Si el almacenamiento seguro del sistema rechaza el tamaño, no guardar el token sin cifrar: adaptar un almacén cifrado con clave protegida por el sistema operativo y documentarlo.
- La sesión web usa endpoints BFF NestJS en el mismo sitio que la web, cookie opaca aleatoria `HttpOnly; Secure; SameSite=Lax; Path=/` sin `Domain`, y comprobación de origen/CSRF en solicitudes mutables. El ID de sesión se guarda como hash; el token de renovación se guarda cifrado con AES-GCM en una tabla de sesiones de Postgres, con clave fuera de la base de datos y provista por el entorno. No habilitar sesión web si web y API no comparten sitio.
- El cliente móvil y web nunca contienen `service_role`, secretos de base de datos ni claves administrativas. Las tablas de aplicación no se exponen a los clientes mediante acceso directo; toda lectura/cambio de negocio pasa por NestJS.
- El perfil persistido contiene el identificador de usuario y solo la relación opcional con UCM si la persona la aporta; el email lo gestiona Auth. No recoger nombre, teléfono ni otros campos sin una historia que lo justifique.
- Favoritos referencian IDs estables del catálogo local de lugares y recursos. Si un ID desaparece del catálogo, se conserva la referencia y se presenta como recurso retirado/no disponible, sin enlazarlo a otro objeto.
- La solicitud de borrado explica consecuencias y exige confirmación explícita. El endpoint de cuenta elimina perfil y favoritos de forma idempotente y elimina la identidad mediante Auth; las incidencias y sus retenciones se resolverán según ADR-0016/0018 en Sprint 7.

## Preparación del entorno

La implementación añadió `apps/api`, `packages/contracts`, migraciones Drizzle y configuración Supabase reproducible. Se usa Node `26.13.1` y el Supabase CLI fijado en el lockfile. En el entorno de desarrollo no hay Docker; el incremento se comprobó con el runtime nativo local de Supabase. El carácter experimental de este runtime se acepta como riesgo para el Sprint y no bloqueó la validación.

1. Instalar dependencias con `npm ci` usando el Node/npm fijados.
2. Generar `.env.local` con `npm run local:env`; el archivo queda ignorado y con permisos `0600`.
3. Iniciar Supabase local, aplicar las migraciones Drizzle y crear el rol de ejecución con privilegios mínimos.
4. Cargar solo el fixture público sintético y ejecutar la integración contra la API local.

## Trabajo y secuencia

| ID  | Actividad y entregable                                                                                                                                                                                                   | Dependencia       | Área funcional          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ----------------------- |
| T1  | Preparar Node, Supabase CLI y runtime local disponible; versionar configuración sin secretos y documentar el arranque.                                                                                                   | Toolchain actual  | Entorno                 |
| T2  | Añadir `apps/api` NestJS y `packages/contracts` al workspace; definir configuración, health check, REST/OpenAPI, validación, errores y logging sin datos sensibles.                                                      | T1, ADR-0002/0003 | API                     |
| T3  | Configurar Postgres/PostGIS local, Drizzle, migraciones repetibles y seed ficticio. Separar credencial de migración de credencial de ejecución con permisos mínimos.                                                     | T2                | Datos                   |
| T4  | Integrar Supabase Auth; validar tokens de acceso en NestJS y crear guardas de identidad/propietario. Nunca aceptar `userId` de cuerpo/query como identidad autenticada.                                                  | T2–T3             | Identidad y seguridad   |
| T5  | Crear perfiles mínimos, favoritos, consultas/modificaciones protegidas y operaciones de perfil/borrado. Implementar referencias a catálogo y caso de recurso retirado.                                                   | T3–T4             | Dominio y persistencia  |
| T6  | Implementar registro, inicio/cierre, recuperación, confirmación de correo y perfil en Android y web. La web usa BFF/cookie; nativo usa almacenamiento seguro.                                                            | T4                | Clientes                |
| T7  | Implementar fichas HU-014, control de sesión para favoritos, alta/baja/listado y consulta de datos personales. Conservar navegación pública anónima.                                                                     | T5–T6             | Experiencia de producto |
| T8  | Explicar los datos de cuenta y permisos existentes; ofrecer acceso a ajustes nativos y mantener accesible el contenido público aunque se deniegue ubicación. Las preferencias de notificaciones se refinan en Sprint 12. | T6–T7             | Privacidad              |
| T9  | Implementar pruebas de integración con Supabase local y matriz de autorización; documentar secretos y ejecución; ampliar CI para API, migraciones y pruebas.                                                             | T4–T8             | Calidad y CI            |
| T10 | Ejecutar matriz de aceptación móvil/web, actualizar historias, backlog, guía, memoria y ADR si la evidencia exige cambio; inspeccionar el incremento.                                                                    | T9                | Documentación y Scrum   |

## Contratos funcionales de referencia

- Operaciones autenticadas: registro/inicio gestionados por Auth; perfil propio (`GET/PATCH /me`), acceso y borrado de cuenta (`DELETE /me`), favoritos (`GET/POST/DELETE /me/favorites`) y consulta propia de datos. Los DTOs se definen en `packages/contracts` y la API los describe en OpenAPI.
- El cliente web envía credenciales solo a los endpoints BFF de NestJS; el BFF interactúa con Supabase Auth, crea/renueva la sesión opaca y nunca devuelve tokens de renovación al navegador. El cliente nativo interactúa con Auth y envía al API el bearer de acceso almacenado en SecureStore.
- La aplicación solo modifica recursos cuyo propietario se obtiene del token validado o la sesión BFF. La API devuelve errores genéricos para credenciales y respuestas controladas para sesión caducada, permiso denegado, duplicado y recurso inexistente.
- La interfaz muestra estados de sesión cargando, anónima, autenticada, expirada y error recuperable; un fallo de Auth no bloquea el mapa ni la búsqueda pública.

## Responsabilidades funcionales

| Responsabilidad                | Trabajo                                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Product Owner                  | Mantener el alcance de datos mínimo y comunicar con claridad los efectos del borrado.                                 |
| Scrum Master                   | Mantener visibles los riesgos del servicio gestionado sin bloquear el desarrollo local.                               |
| Developers — API/datos         | Construir API, contratos, migraciones, autorización por propietario, persistencia y operación idempotente de borrado. |
| Developers — clientes          | Integrar sesión segura, perfil y favoritos en móvil/web y mantener todos los flujos públicos sin cuenta.              |
| Developers — seguridad/calidad | Validar sesiones, recuperación, aislamiento, secretos, caché y pruebas de abuso.                                      |

## Archivos y documentación afectados

Crear `apps/api/`, `packages/contracts/`, migraciones Drizzle y configuración local Supabase reproducible. Actualizar `package.json`/lockfile y `.github/workflows/ci.yml` sin cambiar reglas de GitHub Settings. Ampliar tipo, lint y test scripts para abarcar API y contratos; los comandos locales deben correr con el Node fijado.

Actualizar HU-001–006, HU-014, HU-060 y HU-090–093; Product Backlog; README raíz y de desarrollo; `.env.example`; documentación de datos y arquitectura. Mantener los ADR aceptados sin cambios salvo que nueva evidencia requiera un ADR que los sustituya.

## Verificación y Definition of Done

- Unitarias: validación de perfil, duplicidad de favoritos, referencias retiradas, errores de Auth y semántica de borrado.
- Integración: migración limpia desde base vacía, extensiones, permisos, constraints y seed sintético mediante Supabase local.
- Seguridad de API: anónimo no puede mutar; cuenta A no puede leer/escribir perfil/favoritos de B; rol ordinario no adquiere permisos de gestión; token inválido/caducado se rechaza.
- Auth: registro, email confirmado en entorno local, inicio/cierre, recuperación de usuario existente e inexistente con respuesta equivalente, caducidad/reutilización de enlace y revocación de sesión.
- Privacidad de cliente: tokens web no se escriben en `localStorage` ni `sessionStorage`; cookie web segura, CSRF/origen y cierre invalidan la sesión; en Android se probó inicio de sesión local y recuperación de la sesión desde SecureStore tras forzar el cierre y abrir de nuevo la app.
- E2E: mapa/búsqueda anónimos; registro/login; consultar ficha; guardar y quitar favorito; sesión persistida entre reinicios; logout; borrar cuenta; cuenta B no accede a datos de A. Repetir en navegador y Android.
- CI local y workflow: formato, lint, TypeScript de todas las workspaces, unitarias, API/integración con Supabase local, export web y test web, export Android/iOS. Build y ejecución nativa Android. No se afirma validación nativa iOS sin macOS/Xcode.
- El incremento se prueba contra Supabase local real con identidades ficticias. La falta de servicio alojado, SMTP y validaciones institucionales se acepta como riesgo externo y no bloquea estas pruebas. No se afirma que exista un servicio de producción.

## Riesgos y respuesta

| Riesgo                                                      | Respuesta                                                                                                                             |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Docker no está disponible en el entorno                     | Usar el runtime nativo local de Supabase disponible y fijado por la configuración; se acepta su carácter experimental para el Sprint. |
| Sesión web no comparte sitio con el API                     | No habilitar sesión web; ajustar despliegue/proxy antes de exponerla y conservar el cliente público anónimo.                          |
| Acceso cruzado entre cuentas                                | Denegar por defecto, obtener identidad del token validado y bloquear el cierre si falla cualquier prueba negativa.                    |
| Falta titularidad, SMTP o política para un servicio público | Riesgo aceptado: completar el desarrollo y las pruebas con datos sintéticos en Supabase local, sin configurar un servicio gestionado. |
| Borrado no puede coordinar Auth y tablas en una transacción | Diseñar operación idempotente con estado de borrado y reintento; no confirmar éxito hasta completar ambos lados.                      |

## Ceremonias y resultado

Aplicar metodología Scrum sin inventar decisiones o actas. El resultado técnico se registra aquí y en el backlog con evidencia local; no se crean actas de ceremonias no celebradas.

## Resultado de implementación local

- Se implementaron API NestJS, contratos compartidos, esquema PostgreSQL/PostGIS, Auth Supabase, autorización por propietario, perfil, favoritos, borrado de cuenta, recuperación de contraseña y sesiones web BFF con cookie segura, protección de origen/CSRF, renovación y expiración absoluta.
- La aplicación conserva mapa y consulta pública sin sesión; la interfaz explica qué datos usa la cuenta y permite abrir los ajustes del dispositivo para permisos nativos.
- Supabase local ejecuta Auth, Postgres/PostGIS y Storage con migraciones Drizzle. Las pruebas crean identidades sintéticas y no envían mensajes a personas reales.
- Validación nativa Android 36: el development build se compiló, instaló y abrió; se revisaron el mapa del campus y la pantalla de privacidad/cuenta. Una cuenta sintética autenticó contra Supabase local, cargó perfil y favoritos desde la API y conservó la sesión tras reiniciar la app. La cuenta de prueba se eliminó al terminar.
- Recorrido web local con Chromium: inicio de sesión BFF con una cuenta sintética y guardado de favorito; la cuenta se eliminó al terminar el recorrido.
- Evidencia de pruebas de API y plataforma local: [resultado del Sprint 7](../sprint-07/README.md#resultado-de-implementación-local), que ejecuta la integración contra la misma plataforma local.
