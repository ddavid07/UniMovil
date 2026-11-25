# ADR-0009: consulta puntual de ubicación en primer plano

- **Estado:** Aceptada
- **Fecha:** 2026-11-24
- **Decisores:** Equipo UniMovil

## Contexto

HU-011 permite mostrar la ubicación actual, pero el mapa y la búsqueda pública deben seguir funcionando sin permiso. La plataforma necesita solicitar autorización del sistema y definir cuándo accede a una coordenada, qué precisión pide y si conserva o transmite ese dato. La aplicación no necesita seguimiento continuo para centrar el mapa bajo petición.

## Decisión

- Añadir `expo-location` `~58.0.22` al workspace `apps/mobile`, versión compatible con Expo SDK 58 y registrada en el lockfile. Comprobar la compatibilidad con `npx expo install --check` desde ese workspace.
- Explicar en español el uso de la ubicación y pedir permiso solo después de que la persona pulse la acción de ubicación. No mostrar una solicitud al abrir la aplicación.
- Solicitar permiso de ubicación mientras la aplicación está en uso y realizar una lectura puntual con precisión equilibrada. Si el sistema permite elegir ubicación aproximada o precisa, aceptar la elección de la persona y no exigir precisión mayor para consultar el mapa.
- Mostrar la posición en memoria y permitir centrar la cámara. No almacenar coordenadas en disco, cuenta o historial ni enviarlas directamente a una API, telemetría u otro servicio externo.
- La aplicación seguirá solicitando las teselas necesarias para el área visible según el [ADR-0007](0007-development-basemap-provider.md). Al centrar el mapa en una posición, el proveedor de teselas puede inferir aproximadamente el área consultada a partir de esas peticiones, como también ocurre al navegar manualmente. Explicar este comportamiento antes de pedir el permiso; no incluir la coordenada del dispositivo como dato en la petición.
- No solicitar permiso de segundo plano, iniciar un observador continuo, usar geocercas ni recopilar ubicación para análisis.
- Mantener el mapa y las demás funciones públicas disponibles cuando se deniegue el permiso, los servicios estén desactivados o la lectura no esté disponible.
- Configurar el texto de uso de iOS para acceso `When In Use` y comprobar los permisos efectivos en el build nativo Android. No añadir permisos ajenos a este flujo.
- Configurar el plugin de Expo Location para desactivar expresamente ubicación en segundo plano, servicios de ubicación, movimiento y solicitudes de precisión completa que no usa el flujo.

La configuración generada declara `ACCESS_COARSE_LOCATION` y `ACCESS_FINE_LOCATION` en Android. No incluye `ACCESS_BACKGROUND_LOCATION`, permisos `FOREGROUND_SERVICE` ni permisos de movimiento. En iOS declara `NSLocationWhenInUseUsageDescription`, sin permisos «Always», modos de ubicación en segundo plano ni textos para movimiento o precisión completa.

## Alternativas consideradas

- **No ofrecer ubicación:** evita permisos, pero deja HU-011 sin resolver.
- **Solicitar permiso al iniciar:** se descarta porque no existe una acción contextual y el mapa público no requiere ubicación.
- **Seguimiento en segundo plano o continuo:** se descarta porque HU-011 solo necesita una posición puntual y esta opción amplía innecesariamente uso, consumo y datos tratados.
- **Solicitar ubicación de alta precisión obligatoria:** se descarta como comportamiento predeterminado porque la historia pide una posición aproximada y el mapa debe poder funcionar con el nivel de precisión autorizado por la persona.
- **Consultar un servicio externo de geolocalización:** se descarta porque el sistema operativo ya proporciona la posición y la aplicación no necesita transmitirla.

## Consecuencias

- La funcionalidad requiere un development build nativo y no se puede aceptar solo con Expo Go o exportando el bundle JavaScript.
- El usuario puede rechazar el permiso; la pantalla debe tratarlo como un estado normal, con mapa manual y mensajes accesibles.
- La aplicación solicita `Accuracy.Balanced` y no abre un diálogo adicional para habilitar precisión mejorada; si los servicios del sistema están apagados, informa del estado y conserva el mapa manual.
- La ubicación disponible puede no ser exacta o no obtenerse en interiores; el producto mostrará una posición aproximada solo cuando el sistema devuelva una lectura válida.
- El proveedor del mapa base recibe las solicitudes de teselas del área que se visualiza y puede inferir esa zona; la aplicación no envía la coordenada puntual como dato. La atribución y las condiciones de uso cartográfico del ADR-0007 siguen aplicándose.
- Un cambio futuro a seguimiento, rutas con ubicación, geocercas o persistencia requiere revisar esta decisión y los requisitos de privacidad antes de implementarse.
- Para el cierre del Sprint 2 se acepta expresamente no realizar build ni validación nativa iOS por falta de acceso a ese entorno. Esta excepción queda registrada en el plan del Sprint 2; el bundle JavaScript iOS no se presentará como prueba nativa. La excepción no modifica la Definition of Done general ni se extiende a otros Sprints.

## Referencias

- [HU-011: Mostrar la ubicación actual](../user-stories/02-campus-map-search-and-places.md)
- [HU-001: Consultar información pública sin registrarse](../user-stories/01-account-access.md)
- [HU-007: Gestionar permisos del dispositivo](../user-stories/01-account-access.md)
- [Expo SDK 58: Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/)
- [Expo: permisos en aplicaciones nativas](https://docs.expo.dev/guides/permissions/)
