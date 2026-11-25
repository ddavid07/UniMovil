# ADR-0001: plataformas y alcance de producto

- **Estado:** Aceptada
- **Fecha:** 2026-11-23
- **Decisores:** Equipo UniMovil
- **Nota de vigencia:** la exclusión de una web pública de la decisión original fue sustituida por [ADR-0010](0010-public-web-client.md). El resto de esta decisión permanece vigente.

## Contexto

UniMovil debe ayudar a estudiantes y visitantes a orientarse y desplazarse por el Campus de Moncloa. El backlog también contiene administración, rutas, cuentas, incidencias y otros servicios. Implementar todos esos clientes y dominios a la vez aumentaría el coste inicial y retrasaría una primera experiencia comprobable.

## Decisión

- El cliente principal será una aplicación móvil para Android e iOS.
- El primer flujo de producto será consultar el mapa del campus y encontrar lugares públicos sin iniciar sesión.
- La aplicación no solicitará ubicación mientras el usuario solo consulte el mapa o busque por texto.
- La interfaz visible se redactará en español; el código, los identificadores y los nombres de carpetas y archivos se escribirán en inglés.
- La web administrativa será un cliente separado y posterior, necesario cuando las historias de administración requieran gestionar datos reales.
- No se desarrollará una web pública para estudiantes en el primer alcance.

## Alternativas consideradas

- **Aplicación web adaptable como único cliente:** reduciría el esfuerzo móvil inicial, pero no satisface el objetivo de una aplicación Android/iOS.
- **Aplicación móvil, administración y rutas desde el inicio:** se descarta para priorizar un primer flujo de mapa y búsqueda verificable.
- **Acceso obligatorio con cuenta:** se descarta para información pública; añade registro, credenciales y tratamiento de datos sin aportar valor al primer flujo.

## Consecuencias

- El mapa y la búsqueda deben funcionar sin cuenta y sin permiso de ubicación.
- Se necesita un cliente nativo de desarrollo para probar módulos nativos; Expo Go no será suficiente para el mapa elegido.
- Administración, autenticación, favoritos, rutas y notificaciones quedan fuera del Sprint 1 y se refinarán antes de entrar en un Sprint posterior.
- La selección no implica que UniMovil sea un producto oficial de la Universidad Complutense.

## Referencias

- [Historias de usuario: mapa, búsqueda y lugares](../user-stories/02-campus-map-search-and-places.md)
- [Plan del Sprint 1](../iterations/sprint-01/README.md)
