# Sprint 9 — avisos y restricciones del campus

> **Estado:** plan futuro propuesto; requiere refinamiento y selección antes de comprometerlo.

## Sprint Goal

El público puede consultar avisos vigentes sobre el campus y ver sus zonas afectadas; un gestor autorizado puede redactarlos, programarlos, publicarlos, modificarlos o retirarlos con una caducidad y trazabilidad claras.

## Historias candidatas

| ID     | Historia                                                                                              | Resultado esperado                                                                                    |
| ------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| HU-016 | [Consultar cierres y restricciones en el mapa](../../user-stories/02-campus-map-search-and-places.md) | Zonas, motivo, periodo, actualización y efecto en nuevas rutas cuando el dato y el motor lo permiten. |
| HU-057 | [Publicar un aviso](../../user-stories/05-incidents-and-notices.md)                                   | Borrador/publicación vinculados a zona o recurso, con autor y fecha.                                  |
| HU-058 | [Consultar avisos](../../user-stories/05-incidents-and-notices.md)                                    | Avisos activos filtrables, detalle de vigencia y enlaces a mapa/ruta.                                 |
| HU-059 | [Administrar un aviso](../../user-stories/05-incidents-and-notices.md)                                | Edición, programación y retirada con historial.                                                       |

## Entrada, alcance y límites

- Deben existir autorización administrativa, persistencia, auditoría y API integrada desde Sprints 6–8.
- Refinar tipos de aviso, fuente autorizada, prioridad, zonas, horario/uso horario, fecha de inicio, caducidad, publicación y retirada; definir quién confirma que una restricción física es cierta.
- Los incidentes reportados por usuarios no se convierten automáticamente en cierre ni en aviso oficial. Un dato sin revisión mantiene su naturaleza de aportación.
- Solo se cambian rutas frente a restricciones activas si la restricción está confirmada, geográficamente bien delimitada y el motor puede recalcularla con seguridad. En otro caso, se muestra aviso sin afirmar desvío seguro.
- Notificaciones push, programación masiva, comunicación fuera de app y publicación en canales institucionales quedan fuera; se abordan como HU-063/064 en Sprint 12.

## Cliente público web

HU-016 y HU-058 deben mostrar avisos, vigencia y zonas afectadas también en el navegador, tanto en mapa como en lista accesible. Solo datos publicados por la API aparecen en el cliente público; redacción, programación y retirada permanecen en la aplicación administrativa.

## Plan de trabajo y dependencias

| ID  | Actividad y entregable                                                                                                                               | Depende de            | Área funcional        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------- |
| T1  | Refinar estados de aviso, prioridad, zona, calendario, fuentes, condiciones de publicación y retirada.                                               | HU-057–059; Sprint 8  | PO + Developers       |
| T2  | Definir contrato y modelo persistente de aviso y restricción; revisar zona geométrica, huso horario, autoría, vigencia e historial.                  | T1                    | API/datos             |
| T3  | Confirmar rol, atribución y fuente de cada aviso; actualizar ADR de datos/cartografía si afecta decisiones vigentes.                                 | T1, ADR-0004/0008     | Producto + datos      |
| T4  | Implementar endpoints de borrador, validación, publicación, actualización, retirada y consulta filtrada; autorizar todas las mutaciones en servidor. | T2, T3                | API/seguridad         |
| T5  | Implementar vistas administrativas para redactar, previsualizar, programar, editar y retirar avisos.                                                 | T4                    | Admin                 |
| T6  | Implementar listado/detalle público y capa de mapa en móvil/web con vigencia, zona, fecha y texto accesible.                                         | T4                    | Clientes públicos     |
| T7  | Integrar restricciones activas con cálculo solo en los casos verificados y cubiertos; explicar si no afectan el cálculo.                             | T2, servicio de rutas | Rutas/API             |
| T8  | Probar caducidad, zona, fecha límite, rol, retirada, cambio de contenido, fuente, cliente web/móvil y no duplicación.                                | T4–T7                 | Calidad               |
| T9  | Actualizar historias, riesgos, OpenAPI, manual de publicación y guía de datos; validar CI, build web y builds nativos.                               | T8                    | Documentación/calidad |

| Responsabilidad                  | Aportación                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| Product Owner                    | Aclarar qué constituye aviso oficial y aceptar texto, prioridad, vigencia y visibilidad.  |
| Scrum Master                     | Facilitar la adaptación ante falta de fuente o autoridad de publicación.                  |
| Developers — API/admin           | Implementar ciclo de vida, permisos, vista de gestión y trazabilidad.                     |
| Developers — clientes/mapa/rutas | Presentar en web y móvil avisos y restricciones sin inducir a confiar en datos caducados. |
| Developers — datos/calidad       | Validar geometría/fechas, probar límites y conservar fuentes.                             |

## Archivos previstos

`apps/api/src/`, `apps/admin/src/`, `apps/mobile/src/features/campus/` y/o `features/notices/`, cliente público web definido en el Sprint 3, `packages/contracts/`, migraciones y pruebas. Actualizar historias 02/05, Product Backlog, ADR que cambien, `data-sources.md`, OpenAPI y guía de administración.

## Riesgos y respuestas

| Riesgo                                                    | Probabilidad / impacto | Mitigación y respuesta                                                                                             | Seguimiento |
| --------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------- |
| Aviso incorrecto o sin autoridad                          | Media / Alta           | Identificar fuente y responsable; impedir publicación hasta validar. Retirar si la fuente deja de sostenerlo.      | PO + datos  |
| Restricción caducada sigue cambiando rutas                | Media / Alta           | Evaluar vigencia en servidor y cliente; pruebas con borde temporal/huso horario; expirar por defecto.              | API + rutas |
| Geometría incompleta bloquea o deja libre un área errónea | Media / Alta           | Validar polígono en mapa y casos de borde; si no hay geometría fiable, publicar aviso textual sin bloqueo de ruta. | Datos + QA  |
| La vista pública expone borradores o notas internas       | Baja / Crítica         | Endpoints separados, autorización negativa y contratos mínimos; probar usuario anónimo.                            | Seguridad   |

## Verificación y Definition of Done

Pruebas de dominio cubren estado/vigencia y conflicto de fechas; tests API comprueban roles, publicación, retirada y aislamiento de borradores; tests de integración comprueban mapa y ruta restringida; pruebas de interfaz cubren estado vacío, zona, actualización y texto accesible. No usar los datos anecdóticos de `initial-data.ts` como eventos reales.

La documentación describe cómo verificar una fuente, publicar/retirar y resolver caducidad. DoD requiere evidencia, CI, documentación, aprobación de producto, atribuciones, build web y validación nativa Android/iOS. Si una restricción no es fiable, queda visible como aviso informativo o pendiente; no se da por completado el desvío automático.

## Ceremonias

Se contemplan los eventos Scrum según la metodología. Las actas solo se generan cuando ocurren y el cierre refleja datos, pruebas y aceptación realmente observados.
