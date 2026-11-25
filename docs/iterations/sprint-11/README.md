# Sprint 11 — transporte, importación y salud de fuentes

> **Estado:** plan futuro propuesto y sujeto a refinamiento/selección formal.

## Sprint Goal

El gestor puede mantener datos de líneas y paradas, importar conjuntos autorizados mediante validación previa y detectar errores o datos caducados sin perder registros válidos.

## Historias candidatas

| ID     | Historia                                                                             | Resultado esperado                                                                    |
| ------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| HU-072 | [Gestionar transporte y paradas](../../user-stories/07-administration-and-data.md)   | Líneas, paradas, recorridos y calendario con estados de calidad y desactivación.      |
| HU-074 | [Importar datos externos](../../user-stories/07-administration-and-data.md)          | Vista previa/validación, errores corregibles y aplicación segura sin borrado parcial. |
| HU-075 | [Consultar el estado de los datos](../../user-stories/07-administration-and-data.md) | Última actualización, procedencia, caducidad y filtros de obsolescencia.              |
| HU-080 | [Gestionar fuentes con errores](../../user-stories/07-administration-and-data.md)    | Errores visibles, contenido afectado marcado y reintento controlado.                  |

## Entrada, alcance y límites

- Sprint 4 define los modelos de transporte y la fuente/conjunto estático que se use; Sprint 10 deja el patrón de administración y salud de datos conectado.
- Solo se configuran fuentes cuyo uso y licencia están confirmados. Un conjunto manual debe tener autor/fuente, fecha y versión; no se etiqueta como feed automático.
- Definir por cada entidad si la importación es completa o incremental, clave de reconciliación, duplicados, campos omitidos, conflicto con cambios manuales, rollback y regla de caducidad.
- Los datos se validan en una zona de preparación/vista previa antes de publicarlos. Error parcial no elimina datos válidos y nunca reemplaza contenido con un feed sin vigencia.
- No incorporar HU-028 en tiempo real ni programar scraping no autorizado.

## Cliente público web

Los datos de líneas, paradas, calendarios y su procedencia/vigencia se reflejan en el cliente público web junto con la aplicación móvil. La administración de importaciones continúa en `apps/admin`; errores, caducidad y ausencia de datos deben comunicarse con el mismo significado en ambas superficies públicas.

## Decisiones y dependencias

Antes de desarrollar, aprobar política de importación y reconciliación; documentar si se necesita cola/proceso asíncrono, almacenamiento original, retención de archivos fuente, reintentos o transacciones. Revisar ADR-0003 de API/datos, ADR de transporte local y política de auditoría. No configurar secretos de proveedor reales en CI ni en el repositorio.

## Responsabilidades y tareas

| ID  | Actividad y entregable                                                                                                                               | Dependencias               | Área funcional        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------- |
| T1  | Refinar formatos de entrada, claves, actualización, conflictos y reglas de vigencia con ejemplos válidos/invalidos.                                  | HU-072/074/075/080; S4/S10 | PO + Developers       |
| T2  | Validar autorización/licencia de la fuente, procedimiento de acceso y condiciones; documentar la procedencia.                                        | T1                         | Producto + datos      |
| T3  | Diseñar proceso de importación reproducible, staging, vista previa, informe de errores, confirmación, rollback y auditoría.                          | T2                         | Arquitectura/datos    |
| T4  | Implementar parser y validadores estrictos para líneas, paradas, secuencia, calendarios, coordenadas y estados.                                      | T3                         | API/contratos         |
| T5  | Implementar aplicación atómica/idempotente de importación y conservar elementos previos ante fallo parcial.                                          | T4                         | API/datos             |
| T6  | Conectar panel de importación, vista previa, resultado, errores y reintento seguro; no permitir que un error se convierta en una acción destructiva. | T5                         | Admin                 |
| T7  | Implementar panel de salud/caducidad y señal pública coherente en línea, parada, mapa y ruta de móvil/web.                                           | T5, reglas de vencimiento  | API/admin/clientes    |
| T8  | Probar archivos corruptos, import repetido, registros desconocidos, conflicto manual, rollback, caída de fuente y renovación autorizada.             | T4–T7                      | Calidad               |
| T9  | Actualizar política, fuentes, runbook, ADR, OpenAPI, backlog; ejecutar CI, build web y builds nativos.                                               | T8                         | Documentación/calidad |

| Área                           | Responsabilidad                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| Product Owner                  | Aclarar qué dato se publica y la prioridad de corrección de cada fuente.                         |
| Scrum Master                   | Hacer visibles dependencias de operadores/fuentes externas.                                      |
| Developers — datos/API         | Diseñar y mantener validación, staging, transacciones y reconciliación.                          |
| Developers — admin             | Dar control explicable al operador sin ocultar errores o el alcance de importación.              |
| Developers — clientes públicos | Mostrar fecha/estado de forma coherente en web/móvil y desactivar datos vencidos según política. |
| Developers — seguridad/calidad | Probar archivos hostiles, permisos, errores y regresiones en las tres superficies.               |

## Archivos previstos

`apps/api/src/` (importación/fuentes), `apps/admin/src/` (operación), `apps/mobile/src/features/transit/`, el cliente web público definido en el Sprint 3, `packages/contracts/`, scripts de validación y pruebas. Actualizar `docs/development/data-sources.md`, runbook/guía, ADR, historias 07, backlog, contratos y reglas de retención.

## Riesgos y respuestas

| Riesgo                                                   | Probabilidad / impacto | Mitigación y respuesta                                                                                                | Seguimiento     |
| -------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------- |
| Fuente sin permiso de reutilización o credencial titular | Media / Alta           | No importar ni automatizar hasta verificar autorización y titularidad; mantener fixture sintético.                    | PO + seguridad  |
| Import parcial sobreescribe datos válidos                | Media / Crítica        | Staging, transacción, idempotencia, simulación y rollback; mantener la publicación bloqueada si falla una validación. | API/datos       |
| Errores quedan ocultos o no recuperables                 | Media / Alta           | Informe con campo/registro/causa, estado desactualizado y acción segura; prueba de reintento.                         | Admin + calidad |
| Fecha incorrecta hace parecer vigente un horario viejo   | Media / Alta           | Validar fechas y política de expiración por fuente; exponer última actualización.                                     | Datos           |

## Verificación y Definition of Done

Pruebas de contrato y parser comprueban formatos, rangos, secuencia y errores; pruebas de integración demuestran atomicidad, reconciliación e idempotencia; pruebas admin confirman autorización y presentación de fallos; las pruebas móvil comprueban contenido desactualizado y mensaje de usuario. Ejecutar sin secretos y con copias sintéticas del formato autorizado.

DoD: ningún fallo parcial destruye registros válidos; procedencia, vigencia y reversión son comprobables; CI/documentación están al día; build web y builds nativos iOS/Android verificables; criterios comprobados en clientes públicos y aceptación de producto. No se presenta como automática una fuente actualizada manualmente.

## Ceremonias

Los eventos se rigen por la metodología. Las actas solo documentarán reuniones celebradas; se registrarán los resultados reales de importación y los elementos no disponibles.
