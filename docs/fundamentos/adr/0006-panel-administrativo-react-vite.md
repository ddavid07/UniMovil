# ADR-0006 — Panel administrativo web con React y Vite

## Estado

Aceptada

## Contexto

Los gestores y administradores necesitan mantener lugares, transporte, accesibilidad, incidencias, avisos, fuentes de datos y estadísticas. Estas tareas requieren una interfaz de gestión independiente de la aplicación móvil. El producto no define una versión web pública para usuarios finales.

## Decisión

- Crear `apps/admin` como aplicación web independiente.
- Utilizar React, TypeScript y Vite.
- Consumir la API REST de UniMovil y aplicar autorización en el servidor.
- Mantener la posibilidad de compartir contratos y configuración desde `packages/`.
- No crear aún un paquete de componentes compartidos: se incorporará cuando exista reutilización real entre aplicaciones.

## Alternativas consideradas

- No crear un panel web y realizar la gestión desde la aplicación móvil.
- Crear el panel con React Native Web y compartir toda la interfaz con móvil.
- Posponer la decisión hasta después de implementar la API.

## Consecuencias

### Positivas

- Las tareas administrativas tienen una interfaz apropiada para escritorio.
- El panel puede evolucionar y desplegarse sin acoplarse a la aplicación móvil.
- React y TypeScript mantienen coherencia con el resto del proyecto.
- Vite proporciona una base web ligera y compatible con npm Workspaces.

### Negativas

- Se mantienen dos aplicaciones de interfaz con necesidades de presentación distintas.
- Habrá que conservar consistencia visual y accesibilidad entre móvil y panel.
- El panel necesita autenticación y autorización propias a nivel de interfaz, además de las comprobaciones obligatorias de la API.

## Fecha

2026-10-01
