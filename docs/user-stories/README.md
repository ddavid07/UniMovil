# Historias de usuario de UniMovil

## Propósito y alcance

Este catálogo describe las necesidades funcionales de UniMovil desde la perspectiva de las personas que utilizan o administran el servicio. El producto facilita la movilidad en el campus de Moncloa de la Universidad Complutense de Madrid: consulta de lugares, mapa, rutas, transporte, accesibilidad, avisos e incidencias.

Los nombres de carpetas y archivos siguen la convención en inglés; el contenido de la documentación está en español. Se han aclarado algunas historias y dependencias para que no se confundan responsabilidades distintas.

Las 69 historias están agrupadas por área funcional. Esta agrupación no define el orden global del Product Backlog. Las capacidades públicas planificadas para los Sprints 3–13 deben ofrecerse también en navegador, conforme a [ADR-0010](../adr/0010-public-web-client.md); HU-099 cubre la incorporación inicial del cliente web y no declara implementadas las funciones aún pendientes. Los Sprints 5–7 incorporan recursos de movilidad, cuentas e incidencias en los clientes disponibles; el backlog registra su estado local y los límites de validación.

## Roles

- **Público:** cualquier persona que consulta información pública sin iniciar sesión.
- **Usuario registrado:** persona con cuenta, sea estudiante, docente, personal universitario, visitante o externa. Su relación con la universidad es un dato de perfil; por sí sola no concede permisos de gestión.
- **Gestor:** persona autorizada para mantener información de movilidad, tramitar incidencias y publicar avisos.
- **Administrador:** persona autorizada para gestionar cuentas, roles, fuentes de datos y configuración global.

## Índice

| Área                                  | Historias     | Archivo                                                                                  |
| ------------------------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| Acceso y cuentas                      | HU-001–HU-007 | [01-account-access.md](01-account-access.md)                                             |
| Mapa, búsqueda y lugares              | HU-010–HU-017 | [02-campus-map-search-and-places.md](02-campus-map-search-and-places.md)                 |
| Rutas y transporte                    | HU-020–HU-029 | [03-routes-and-transit.md](03-routes-and-transit.md)                                     |
| Accesibilidad y recursos de movilidad | HU-040–HU-045 | [04-accessibility-and-mobility-resources.md](04-accessibility-and-mobility-resources.md) |
| Incidencias y avisos                  | HU-050–HU-059 | [05-incidents-and-notices.md](05-incidents-and-notices.md)                               |
| Personalización y notificaciones      | HU-060–HU-066 | [06-personalization-and-notifications.md](06-personalization-and-notifications.md)       |
| Administración y datos                | HU-070–HU-080 | [07-administration-and-data.md](07-administration-and-data.md)                           |
| Seguridad, privacidad y calidad       | HU-090–HU-098 | [08-security-privacy-and-quality.md](08-security-privacy-and-quality.md)                 |
| Cliente público web                   | HU-099        | [09-public-web-client.md](09-public-web-client.md)                                       |

## Forma de redactar y revisar las historias

La historia breve identifica **quién** necesita algo, **qué** quiere conseguir y **para qué** le sirve:

> Como [rol], quiero [objetivo], para [beneficio].

El rol debe corresponder a una persona usuaria o responsable real; el objetivo debe expresar una capacidad del producto y el beneficio debe describir valor para ese rol. Las historias se redactan en lenguaje sencillo y describen el resultado, no las tareas técnicas para implementarlo.

### Las tres C

- **Tarjeta:** el identificador y la frase de la historia sirven para reconocerla y planificarla; no pretenden contener toda la especificación.
- **Conversación:** el equipo, la persona responsable del producto y las partes interesadas aclaran el alcance, los ejemplos, las reglas y las dependencias durante el refinamiento.
- **Confirmación:** los criterios de aceptación registran los resultados acordados y permiten comprobar la historia mediante ejemplos o pruebas de aceptación.

Las fichas contienen la tarjeta y una propuesta de confirmación. La conversación con el equipo y las partes interesadas sigue formando parte del refinamiento; la documentación no la sustituye. Las decisiones que dependen de una política, una fuente de datos o una validación externa se mantienen explícitas en las reglas y dependencias, sin inventar respuestas.

### Revisión INVEST

Antes de incorporar una historia a un sprint, el equipo comprueba que sea:

- **Independiente:** puede priorizarse y planificarse sin depender innecesariamente de otra historia. Las dependencias inevitables quedan indicadas.
- **Negociable:** expresa el resultado esperado y deja abierto el diseño de la solución.
- **Valiosa:** aporta un beneficio reconocible a un rol concreto.
- **Estimable:** el equipo tiene información suficiente para estimar su esfuerzo; si no, aclara o investiga la incertidumbre antes de comprometerla.
- **Pequeña:** puede completarse dentro de una iteración. Si abarca demasiado, se divide en historias más pequeñas que mantengan valor de principio a fin.
- **Comprobable:** cada criterio de aceptación describe un resultado observable que se puede demostrar o probar.

Las épicas y actividades de mayor nivel se descomponen progresivamente. Para conservar valor en cada entrega, se buscan cortes verticales del flujo de usuario y se evita registrar como historia una tarea técnica aislada, como crear una tabla o una clase.

## Contenido de cada ficha

- **Identificador y título:** identifican la historia; se conservan los códigos HU existentes para mantener la trazabilidad.
- **Prioridad:** importancia funcional relativa; no equivale al orden del Product Backlog ni a una fecha de entrega.
- **Historia:** tarjeta expresada desde la perspectiva del rol y su beneficio.
- **Criterios de aceptación:** confirmaciones específicas de esa historia.
- **Reglas y dependencias:** restricciones, fuentes, permisos o relaciones necesarias para comprenderla.

Las prioridades y dependencias orientan la ordenación inicial del backlog y se revisan durante su refinamiento.

## Criterios de aceptación y definición de terminado

Los criterios de aceptación son propios de cada historia y describen su comportamiento esperado. La **definición de terminado** es compartida por el equipo y se aplica además de esos criterios; no reemplaza ni duplica su comprobación.

Cuando corresponda a la historia, una entrega se considera terminada cuando:

- Cumple todos sus criterios de aceptación y el equipo puede demostrarlo.
- Tiene pruebas adecuadas al riesgo y al nivel de la funcionalidad.
- Gestiona los estados relevantes de carga, error, falta de conexión y ausencia de datos.
- Respeta los roles, los permisos y la privacidad tanto en la interfaz como en los servicios que procesan los datos.
- Mantiene la información accesible y comprensible, incluida una alternativa textual cuando una función dependa del mapa.
- Identifica la procedencia o antigüedad de datos externos cuando sea necesario para interpretarlos.
- No expone secretos ni datos personales que no sean necesarios.
- Actualiza la documentación afectada.

## Trazabilidad

Los identificadores HU permiten relacionar requisitos, decisiones, implementación y pruebas. El [Product Backlog](../backlog/product-backlog.md) contiene el inventario inicial para su refinamiento y planificación.

## Referencias metodológicas

- Apuntes y enlaces del curso de Ingeniería del Software: [material docente](../assets/course-materials/README.md).
- Requisitos y calidad de una especificación: IEEE 830-1998, incluido en los apuntes del curso.
- Tarjeta, conversación y confirmación: [Ron Jeffries](https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/).
- Criterios INVEST: [Bill Wake](https://xp123.com/invest-in-good-stories-and-smart-tasks/) y [Visual Paradigm](https://www.visual-paradigm.com/scrum/3c-and-invest-guide/).
- Descomposición y mapas de historias: [Javier Garzás, estrategias de descomposición](https://javiergarzas.com/2017/01/estrategias-para-descomponer-y-hacer-pequenas-historias-de-usuario.html) y [mapas de historias](https://javiergarzas.com/2016/03/nunca-empieces-un-desarrollo-agil-sin-hacer-antes-un-mapa-de-historias-de-usuario-o-similar.html).
