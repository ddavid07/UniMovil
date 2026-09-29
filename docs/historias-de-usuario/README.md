# Historias de usuario de UniMovil

## Objetivo

Este directorio contiene el catálogo de historias de usuario de UniMovil. Las historias describen el comportamiento que debe ofrecer la aplicación desde la perspectiva de sus usuarios y sirven como base para el análisis, diseño, implementación y validación del proyecto.

El alcance funcional corresponde a la movilidad dentro del campus de Moncloa de la Universidad Complutense de Madrid.

## Roles utilizados

- **Público:** cualquier persona que consulta la información sin iniciar sesión.
- **Usuario registrado:** estudiante, profesor, personal universitario, visitante o persona externa con una cuenta.
- **Gestor:** persona autorizada para mantener la información de movilidad y tramitar incidencias.
- **Administrador:** persona autorizada para gestionar usuarios, permisos y configuración global.

## Formato de las historias

Cada historia contiene:

- **Identificador:** código único de la historia.
- **Título:** nombre breve y descriptivo.
- **Prioridad:** importancia funcional relativa: alta, media o baja.
- **Historia:** formato «Como [rol], quiero [objetivo], para [beneficio]».
- **Descripción:** contexto y comportamiento esperado.
- **Criterios de aceptación:** condiciones verificables para considerar la historia correctamente implementada.
- **Reglas y dependencias:** restricciones, decisiones de negocio o funcionalidades relacionadas.

Las prioridades no representan fases de desarrollo. Solo indican la relevancia de cada capacidad para el producto.

## Índice

1. [Acceso y cuentas](01-acceso-y-cuentas.md)
2. [Mapa, búsqueda y lugares](02-mapa-busqueda-y-lugares.md)
3. [Rutas y transporte](03-rutas-y-transporte.md)
4. [Accesibilidad y recursos de movilidad](04-accesibilidad-y-recursos.md)
5. [Incidencias y comunicaciones](05-incidencias-y-comunicaciones.md)
6. [Personalización y notificaciones](06-personalizacion-y-notificaciones.md)
7. [Administración y datos](07-administracion-y-datos.md)
8. [Seguridad, privacidad y calidad](08-seguridad-privacidad-y-calidad.md)

## Criterios generales de terminado

Una historia no se considerará terminada si, además de cumplir sus criterios específicos:

- Funciona en los dispositivos y tamaños de pantalla contemplados.
- Gestiona correctamente estados de carga, error, ausencia de datos y falta de conexión.
- Respeta los permisos y roles definidos.
- Es comprensible y usable con teclado, lector de pantalla y tamaños de texto ampliados cuando aplique.
- Dispone de pruebas apropiadas.
- No expone secretos, datos personales innecesarios ni información de depuración.
- La documentación relacionada queda actualizada.
