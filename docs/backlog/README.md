# Backlog del producto

El Product Backlog es la lista ordenada y evolutiva del trabajo de UniMovil. El Product Owner responsable es **Daniel David (@ddavid07)**. La tabla maestra conserva el historial de trabajo de Sprints 1–7 y ordena el trabajo pendiente por prioridad.

## Fuente de verdad

- [Product Backlog](product-backlog.md): orden, prioridad, estado, Sprint o corte y evidencia.
- [Historias de usuario](../requirements/user-stories/README.md): tarjeta, criterios de aceptación, reglas y dependencias.
- [Planes y resultados de Sprint](../iterations/README.md): alcance seleccionado, comprobaciones y límites de cada incremento.

No se duplican aquí los criterios completos: cada elemento enlaza con su ficha. La prioridad se toma de esa ficha; HU-099 permanece por acordar.

## Organización y orden

- La primera sección conserva las historias trabajadas en los Sprints 1–7 para mantener su trazabilidad. El trabajo futuro se encuentra en las secciones de prioridad Alta, Media y Baja.
- Los números expresan la ordenación del backlog. La prioridad orienta la importancia funcional, pero no reemplaza el orden que mantiene el Product Owner.
- Los Sprints 8–13 son propuestas pendientes de refinamiento. La mención de una historia en un plan futuro no equivale a su selección definitiva.
- La columna Puntos usa un guion cuando el repositorio no registra un valor vigente para esa historia. No se heredan valores de un backlog anterior.

## Estados y evidencia

- **Implementada y publicada:** el trabajo está incluido en main mediante PR #50; la fila remite al resultado del Sprint que documenta alcance y comprobaciones.
- **Corte implementado, historia abierta:** hay comportamiento útil publicado, pero queda un criterio, una fuente o una validación pendiente. HU-024 y HU-092 conservan expresamente esta condición.
- **Propuesta para Sprint N:** trabajo futuro que todavía requiere refinamiento y selección durante la planificación correspondiente.
- **Fuera del horizonte actual:** no está propuesta para un Sprint; su finalidad, privacidad o fuente de datos necesita resolverse antes de priorizarla.

La publicación del código no convierte automáticamente en satisfechos los criterios pendientes ni implica que exista un servicio de producción. Las incidencias de prueba usan datos sintéticos, y las excepciones de validación nativa iOS se describen en los planes correspondientes.

## Mantenimiento

- Mantener las prioridades sincronizadas con las fichas de historias y revisar el orden cuando cambien el valor, las dependencias o la evidencia disponible.
- Cuando una historia no satisfaga todos sus criterios, conservarla abierta o registrar el corte entregado; no declararla terminada solo porque exista código.
- Actualizar el backlog y las referencias de Sprint en el mismo cambio que modifique estado, alcance o evidencia.
- La selección definitiva de elementos y el plan de trabajo pertenecen a la planificación de cada Sprint; las actas se registran solo cuando se celebren reuniones reales.
