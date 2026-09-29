# ADR-0001 — TypeScript, React Native, Expo y NestJS

## Estado

Aceptada

## Contexto

UniMovil debe funcionar en Android e iOS y será desarrollada por un equipo de cinco personas. El proyecto también necesita un backend con varias áreas funcionales y una posible evolución hacia web.

## Decisión

- Utilizar TypeScript como lenguaje principal.
- Utilizar React Native con Expo para la aplicación móvil.
- Utilizar Expo Router para navegación.
- Utilizar Node.js con TypeScript y NestJS para el backend.

## Alternativas consideradas

- JavaScript sin tipado estático.
- Flutter y Dart.
- React Native sin Expo.
- Backend Node.js con un framework más ligero.

## Consecuencias

### Positivas

- Se comparte lenguaje y modelos entre móvil y backend.
- Se reducen errores de integración y refactorización.
- Se mantiene abierta la posibilidad de una versión web.
- NestJS proporciona una estructura modular para el backend.

### Negativas

- El equipo debe aprender y mantener TypeScript, Expo y NestJS.
- Expo y las bibliotecas nativas pueden requerir configuración específica por plataforma.
- La compatibilidad web no será automáticamente idéntica a la móvil.

## Fecha

2026-09-29
