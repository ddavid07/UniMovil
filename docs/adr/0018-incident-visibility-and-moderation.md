# ADR-0018: privacidad, estados y publicación de incidencias

- **Estado:** Aceptada
- **Fecha:** 2026-11-25
- **Decisores:** Equipo UniMovil
- **Relacionado con:** ADR-0003, ADR-0014, ADR-0015 y ADR-0016

## Contexto

HU-050–053 separan la comunicación privada de una incidencia de su consulta pública. El Sprint 7 no incluye el panel de gestión; HU-054–056 se planifican en el Sprint 8. Por ello, una incidencia no puede hacerse pública automáticamente ni por una acción del propio informante.

## Decisión

- Toda incidencia nueva se crea en estado `received` y con publicación `private`. Solo un rol de gestión asignado desde servidor podrá cambiar su estado de publicación a `published` o retirarlo.
- La situación operativa de la incidencia y su visibilidad pública serán campos distintos. En el Sprint 7 la aplicación implementa el envío privado, el historial propio y la consulta pública filtrada; la interfaz de gestión y sus transiciones se implementan en el Sprint 8. El feed local se prueba con fixtures sintéticos publicados desde la base de datos; las incidencias reales no se crean ni se publican desde este entorno.
- La API pública devolverá solo una proyección minimizada: identificador público, categoría, zona o ubicación aprobada, descripción revisada, estado público y fecha de actualización. Excluirá autor, correo, adjuntos, notas internas, identificadores internos y metadatos de ubicación no aprobados.
- La ubicación se seleccionará o corregirá manualmente. La ubicación del dispositivo no se recogerá en segundo plano ni se incluirá automáticamente en una incidencia.
- Las confirmaciones de usuarios de que un problema continúa o se resolvió se conservarán como aportaciones privadas y no cambiarán automáticamente el estado oficial.
- La ausencia de un flujo institucional de moderación, roles de gestión configurados, política de retención y autorización para incidencias reales se acepta como riesgo de los Sprints 5–7. No bloquea implementar y probar el flujo con datos sintéticos; no se afirma que exista revisión de incidencias reales.

## Alternativas consideradas

- **Publicar cada envío al crearse:** descartada porque un relato no verificado puede contener información falsa o personal.
- **Permitir al informante publicar su propio reporte:** descartada porque la autoría no equivale a revisión ni autorización institucional.
- **Mezclar estado operativo y publicación:** descartada porque una incidencia podría estar en revisión y aun así no ser publicable.
- **Incluir el panel de gestión en Sprint 7:** descartada para conservar la dependencia y alcance actuales; la gestión se planifica en Sprint 8.

## Consecuencias

- El dominio y el esquema deberán impedir la publicación desde endpoints de usuario y comprobar el rol de gestión en servidor.
- La API pública requerirá pruebas que verifiquen el filtrado de estados y la ausencia de datos personales y adjuntos.
- La experiencia pública debe ofrecer estados vacíos y de error sin afirmar que UniMovil contiene todas las incidencias activas del campus.
- La consulta pública filtra por `published` y nunca permite publicar desde el API de usuario. Los fixtures de desarrollo son sintéticos y no representan una aprobación institucional.

## Referencias

- [HU-050–053: comunicación y consulta de incidencias](../user-stories/05-incidents-and-notices.md)
- [HU-054–056: gestión y seguimiento de incidencias](../user-stories/05-incidents-and-notices.md)
- [Sprint 7](../iterations/sprint-07/README.md)
- [Sprint 8](../iterations/sprint-08/README.md)
