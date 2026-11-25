# Sprint 8 — gestión de incidencias y auditoría

> **Estado:** plan futuro propuesto, sujeto a refinamiento y selección formal del equipo.

## Sprint Goal

Un gestor autorizado puede revisar una incidencia, cambiarla por una transición válida y dejar un registro consultable de quién actuó y cuándo, sin exponer información privada.

## Historias candidatas

| ID     | Historia                                                                                             | Resultado esperado                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| HU-054 | [Gestionar una incidencia](../../user-stories/05-incidents-and-notices.md)                           | Cola de trabajo filtrable y detalle con datos necesarios para la revisión.           |
| HU-055 | [Actualizar el estado de una incidencia](../../user-stories/05-incidents-and-notices.md)             | Transiciones válidas, autoría, fecha y explicación visible al informante.            |
| HU-056 | [Confirmar que sigue activa](../../user-stories/05-incidents-and-notices.md)                         | Confirmaciones/actualizaciones según regla refinada, con vencimiento y trazabilidad. |
| HU-077 | [Consultar auditoría administrativa](../../user-stories/07-administration-and-data.md)               | Búsqueda de eventos no modificables por la interfaz ordinaria y sin secretos.        |
| HU-097 | [Mantener trazabilidad de cambios relevantes](../../user-stories/08-security-privacy-and-quality.md) | Relación entre cambio, autor, momento, elemento y versión de dato.                   |

## Alcance y condiciones de entrada

- El Sprint 7 debe entregar datos de incidencias persistidos y una API autenticada, con publicación pública separada de información privada.
- Refinar transiciones permitidas, significado de “en revisión”, “en proceso”, “resuelta” y “cerrada”, reactivación y notificación al reportero. No inventar SLA ni autoridad institucional.
- Definir actores gestores y administradores, provisión inicial de roles, conservación de auditoría, quién puede consultar evidencias y registro de acciones fallidas antes de programar permisos.
- La vista administrativa es privada y utiliza la API; no usa `initial-data.ts` como sistema operativo ni autoriza por ocultar botones en el cliente.
- No se implementa una eliminación ordinaria de registros de auditoría; su retención y borrado excepcional requieren política aprobada.

## Cliente público web

La aplicación administrativa seguirá separada y será la única interfaz para la cola de gestión y auditoría. La web pública de este Sprint solo presenta al informante los estados y mensajes que puede consultar, bajo la autorización del servidor, en paridad con móvil; no expone notas internas ni acciones administrativas.

## Plan de trabajo

| ID  | Actividad y entregable                                                                                                                       | Depende de           | Área funcional         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------- |
| T1  | Refinar flujos de triage, actores, filtros, transiciones y datos visibles en cola/detalle.                                                   | Historias + Sprint 7 | PO + Developers        |
| T2  | Acordar matriz de autorización y transición; aceptar cambios ADR de roles, auditoría o retención si las decisiones existentes no los cubren. | T1, ADR de identidad | Seguridad/arquitectura |
| T3  | Diseñar contratos, eventos de auditoría, consulta paginada y esquema; excluir contraseñas, tokens, fotos privadas y datos innecesarios.      | T2                   | API/datos              |
| T4  | Implementar endpoints de gestión con autorización en servidor y control optimista/transaccional de estado.                                   | T3                   | API                    |
| T5  | Conectar la vista de administración al API; agregar cola, búsqueda, filtros, detalle, motivo y estados vacíos/error.                         | T4                   | Admin                  |
| T6  | Mostrar en móvil y web los cambios de estado que puede ver el informante, sin revelar notas internas ni identidad personal de otros actores. | T4                   | Clientes/API           |
| T7  | Registrar eventos auditables y construir vista de consulta con filtros y paginación, solo para rol autorizado.                               | T3, T4               | API + admin            |
| T8  | Probar transiciones inválidas, concurrencia, acceso por rol, logs/auditoría y no divulgación de adjuntos.                                    | T4–T7                | Calidad/seguridad      |
| T9  | Actualizar historias, backlog, OpenAPI, guía de roles, retención y documentación; probar cliente web, builds Android/iOS y CI.               | T8                   | Calidad/documentación  |

## Responsabilidades funcionales

| Área                               | Responsabilidad                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Product Owner                      | Aclarar el resultado funcional de cada estado y validar la información visible al informante. |
| Scrum Master                       | Facilitar inspección/adaptación y visibilizar bloqueos de definición de roles y conservación. |
| Developers — administración        | Integrar cola de trabajo y consultas de auditoría sin lógica de permisos únicamente cliente.  |
| Developers — API/seguridad         | Enforzar roles y transiciones, crear eventos de auditoría y proteger evidencias.              |
| Developers — clientes públicos     | Presentar en web/móvil el estado público/propio y errores sin datos internos.                 |
| Developers — calidad/documentación | Cubrir permisos, trazabilidad, contratos y evidencia de las plataformas.                      |

## Archivos previstos

`apps/admin/src/` para vistas y cliente API; `apps/api/src/` para módulos, políticas y auditoría; `packages/contracts/` para estados y esquemas; `apps/mobile/src/features/incidents/` y el cliente web público definido en el Sprint 3 para el historial propio. Actualizar historias 05/07/08, Product Backlog, ADR aplicables, OpenAPI, pruebas y documentación operativa.

## Riesgos y respuesta

| Riesgo                                                  | Probabilidad / impacto | Mitigación y respuesta                                                                                           | Seguimiento     |
| ------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------- |
| Un rol débil habilita modificación administrativa       | Baja / Crítica         | Autorización central en cada endpoint; pruebas negativas por acción y denegación por defecto.                    | Seguridad       |
| Transiciones no acordadas causan estados inconsistentes | Media / Alta           | Modelo de estados explícito y pruebas de transición; mantener cambio pendiente si falta definición de autoridad. | PO + API        |
| Auditoría contiene datos personales o credenciales      | Media / Crítica        | Lista de campos permitidos, redacción, controles y pruebas de secretos; no capturar payloads completos.          | Seguridad       |
| Vistas admin continúan usando mocks                     | Media / Alta           | Pruebas de contrato y modo de error cuando API no responde; no presentar seed como registro real.                | Admin + calidad |

## Verificación y Definition of Done

Probar cada estado/acción válida e inválida, aislamiento entre gestores y público, concurrencia, auditoría inmutable desde la app y la ausencia de secretos. Verificar que la vista de usuario diferencia estado público y nota interna. Validar roles y flujos en API, panel, móvil y tests de contrato.

DoD: criterios satisfechos; migraciones reproducibles; CI y pruebas de seguridad verdes; administración y clientes públicos accesibles; estados del informante comprobados en web y móvil; documentación del flujo, roles y conservación alineada; build web y builds nativos Android/iOS; aceptación del incremento por Product Owner. Una vista que opere solo sobre datos en memoria no cumple el objetivo.

## Ceremonias

Los eventos Scrum siguen la metodología del proyecto. Las actas se registran únicamente tras su celebración; el resultado documenta lo inspeccionado, las decisiones y el trabajo que realmente continúa.
