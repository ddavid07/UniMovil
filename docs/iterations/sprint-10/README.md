# Sprint 10 — administración del catálogo y sus permisos

- **Estado:** Plan futuro propuesto, pendiente de refinamiento y selección.

## Sprint Goal y valor

### Sprint Goal

Un gestor autorizado puede mantener lugares, categorías y datos de accesibilidad desde el panel, y las personas usuarias reciben los cambios publicados con procedencia y estado conocidos.

## Sprint Backlog

### Historias candidatas

| ID     | Historia                                                                                          | Resultado esperado                                                                               |
| ------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| HU-070 | [Gestionar edificios y lugares](../../requirements/user-stories/07-administration-and-data.md)    | Crear, editar y desactivar lugares con validación y efecto público tras publicar.                |
| HU-071 | [Gestionar puntos y categorías](../../requirements/user-stories/07-administration-and-data.md)    | Mantener categorías e iconos sin dejar puntos huérfanos.                                         |
| HU-073 | [Gestionar accesibilidad](../../requirements/user-stories/07-administration-and-data.md)          | Mantener accesos/obstáculos, estado, revisión y autoría sin convertir desconocido en confirmado. |
| HU-075 | [Consultar el estado de los datos](../../requirements/user-stories/07-administration-and-data.md) | Ver procedencia, actualización, vencimiento y errores por conjunto/registro.                     |
| HU-076 | [Gestionar usuarios y roles](../../requirements/user-stories/07-administration-and-data.md)       | Administración de cuentas/roles con controles contra pérdida del último administrador.           |

HU-077 y HU-097, planificadas en el Sprint 8, son capacidades de soporte que deben estar disponibles para los cambios que este Sprint realice.

## Alcance, decisiones y dependencias

### Entrada y alcance

- Requiere autenticación y autorización server-side, auditoría y API de Sprints 6–8.
- El panel no usa `initial-data.ts` como base operativa. El dato creado/modificado se valida y persiste en la API antes de aparecer en consultas públicas.
- Refinar qué campos se consideran fuente verificada, quién confirma una ubicación y qué reglas hacen que un lugar/categoría pueda desactivarse.
- Los valores de accesibilidad tienen fuente, fecha, estado y responsable. Las entradas sin prueba se mantienen desconocidas o provisionales.
- La asignación de gestor/administrador se limita a cuentas autorizadas y auditadas; no se infieren permisos del perfil público.
- No incluye importar automáticamente archivos externos; ese ciclo se trata en Sprint 11.

### Cliente público web

Los lugares, categorías y datos de accesibilidad publicados deben aparecer en el cliente web público además de móvil, con fecha/procedencia y estados de borrador, desactivado o desactualizado respetados. Las tareas de creación, publicación, permisos y gestión siguen en `apps/admin`; el navegador público nunca recibe borradores ni operaciones de administración.

### Decisiones previas necesarias

Confirmar modelo de persistencia/migraciones y fuente de verdad; permisos de gestión; auditoría/retención; procedencia y revisión editorial. Si los ADR aceptados no cubren esta evolución, proponer otro ADR antes de integrarla. La decisión de hosting externa y cuenta de servicio debe estar resuelta para operar datos reales.

## Responsabilidades por rol

| Rol           | Responsabilidades en el Sprint                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Product Owner | Aclarar qué información se publica y qué autoridad confirma cada dato.                         |
| Scrum Master  | Exponer dependencias de permisos, fuentes y cuentas de servicio; facilitar adaptación.         |
| Developers    | Implementar esquema, validación, permisos, auditoría y consultas consistentes.                 |
| Developers    | Construir flujos de gestión y estados de error/carga/vacío.                                    |
| Developers    | Consumir registros publicados en web y móvil sin exponer borradores ni atributos desconocidos. |
| Developers    | Probar controles, mantener trazabilidad y actualizar las guías de mantenimiento.               |

## Plan inicial y seguimiento

### Responsabilidades funcionales y plan de trabajo

| ID  | Actividad y entregable                                                                                                                                                   | Depende de              | Área funcional        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | --------------------- |
| T1  | Refinar formularios, reglas de campos, edición, desactivación, publicación y acceso por rol.                                                                             | Historias + Sprints 6–8 | PO + Developers       |
| T2  | Diseñar esquema de categorías, lugares, accesos y estados; definir cómo se relacionan con la auditoría existente.                                                        | T1                      | API/datos             |
| T3  | Implementar endpoints de consulta pública y mutación administrativa con validación, autorización y paginación.                                                           | T2                      | API/seguridad         |
| T4  | Implementar panel conectado a la API para filtrar, crear, editar, previsualizar, publicar y desactivar registros.                                                        | T3                      | Admin                 |
| T5  | Integrar cambios publicados en catálogo, fichas y mapa de los clientes móvil y web; distinguir borrador, publicado, desactivado y desactualizado sin exponer borradores. | T3, T4                  | Clientes públicos     |
| T6  | Implementar vista de salud de datos con fuente, fecha, estado y errores; acordar regla de vencimiento por tipo de dato.                                                  | T2, política de validez | API/admin             |
| T7  | Probar permisos, integridad referencial, doble edición, último administrador, publicación y auditoría.                                                                   | T3–T6                   | Calidad               |
| T8  | Revisar accesibilidad del panel y cliente web, build web, builds Android/iOS, documentación de operadores y CI; actualizar fuentes y ADR en la misma PR.                 | T7                      | Calidad/documentación |
| T9  | Inspeccionar el Incremento, adaptar backlog y registrar el estado de cada criterio con evidencia.                                                                        | T8                      | Scrum Team            |

### Archivos previstos

`apps/api/src/` y migraciones para catálogo/permisos; `packages/contracts/` para contratos; `apps/admin/src/` para gestión; `apps/mobile/src/features/campus/` y el cliente web público definido en el Sprint 3 para lectura. Pruebas API, admin y clientes públicos junto al módulo. Actualizar HU-070/071/073/075/076, backlog, ADR de datos/roles, OpenAPI, `data-sources.md` y guía admin.

## Riesgos y respuestas

| Riesgo                                              | Probabilidad / impacto | Mitigación y respuesta                                                                                 | Seguimiento       |
| --------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------ | ----------------- |
| Usuario con rol incorrecto puede publicar contenido | Baja / Crítica         | Autorización por endpoint, denegación por defecto y pruebas negativas. Detener publicación ante fallo. | Seguridad         |
| Cambios de esquema rompen el catálogo móvil         | Media / Alta           | Migraciones versionadas, validación de contratos y compatibilidad hacia atrás comprobada.              | API + móvil       |
| Se publica como accesible un dato no confirmado     | Media / Alta           | Estado de revisión y validación requeridos; conservar desconocido; retirar dato incorrecto.            | PO + datos        |
| Se pierde acceso administrativo                     | Baja / Alta            | Regla transaccional contra retirar último admin y prueba de recuperación operativa.                    | Seguridad + admin |

## Verificación, documentación y Definition of Done

### Verificación y Definition of Done

Los tests comprobarán acceso público de solo lectura, cada rol, validaciones de formulario y API, restricciones de desactivación, consistencia con el catálogo, fecha de validez y registro de cambios. Se comprobará que una edición no se anuncia públicamente hasta publicarse.

El DoD requiere datos operativos persistidos, contratos/migraciones reproducibles, trazabilidad, CI, documentación sincronizada, accesibilidad del panel y cliente web, build web y builds nativos iOS/Android. Los valores desconocidos se muestran como tales; ninguna prueba usa datos personales reales.
