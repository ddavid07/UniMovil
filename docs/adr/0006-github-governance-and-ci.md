# ADR-0006: gobierno de GitHub, CI y dependencias

- **Estado:** Aceptada
- **Fecha:** 2026-11-23
- **Decisores:** Equipo UniMovil

## Contexto

El repositorio es público y contiene código bajo Apache-2.0. Las reglas descritas en documentación antigua no bastan para confirmar qué controles están realmente habilitados. La lectura disponible confirma que no se devuelven rulesets; el endpoint de protección de `main` no fue accesible, por lo que su estado no se puede afirmar.

## Decisión

### Flujo de cambios

- `main` será la rama estable. No se trabajará directamente sobre ella; cada cambio entrará mediante pull request y deberá superar todos los checks de CI requeridos. **No se exigirá aprobación ni revisión de otra persona para fusionar.**
- Se habilitará auto-merge con squash: el autor podrá activarlo en su PR y, cuando CI esté en verde, GitHub lo fusionará sin esperar a una revisión. Si auto-merge no estuviera disponible, el autor podrá fusionar manualmente al pasar los checks.
- Se deshabilitarán merge commits y rebase merge para mantener un historial lineal y breve; se impedirá el force-push y borrado de `main`.
- La revisión por otra persona puede hacerse de forma voluntaria, pero nunca será una condición de merge ni un check obligatorio.
- Ramas con prefijos `feat/`, `fix/`, `docs/`, `test/`, `build/` o `ci/`, más una referencia breve a la historia cuando aplique.
- Los PR incluirán objetivo, alcance, historias asociadas, evidencia y lista de comprobaciones ejecutadas. Se incorporarán plantillas de PR y de incidencias.

### CI y seguridad

- CI de pull request y de `main`: instalación reproducible con `npm ci`, formato, ESLint, TypeScript, pruebas disponibles, comprobación de compatibilidad de Expo y exportación de bundles JavaScript Android/iOS y web.
- Los builds nativos completos no se ejecutarán en cada PR durante el Sprint 1; se validarán en el spike y antes de aceptar cambios de plataforma. Se automatizarán cuando la capacidad de CI y su coste estén claros.
- Workflows con permisos mínimos, `timeout-minutes`, concurrencia con cancelación y acciones de terceros fijadas a SHA completo. Los permisos de escritura del token se limitarán a jobs que los necesiten.
- Dependabot semanal para `npm` desde la raíz del monorepo y para GitHub Actions; agrupar actualizaciones patch/minor y mantener las major en PRs separadas para que quien las gestione pueda leer el impacto y los checks. Activar actualizaciones de seguridad.
- Habilitar Dependency Review en PR y CodeQL para TypeScript. Activar secret scanning y push protection donde el plan del repositorio lo permita. No incluir secretos, tokens ni datos personales en workflows, fixtures o logs.
- No se añade Scorecard como control obligatorio del Sprint 1; se reconsiderará si aporta señales accionables al repositorio.

### Aplicación de la configuración remota

Los archivos versionados describirán workflows, Dependabot y plantillas. Las reglas de rama y controles que viven en Settings son una operación separada: se deberán verificar y aplicar desde GitHub por una persona con permisos antes del primer merge. La regla requerirá PR y CI en verde, fijará **cero aprobaciones obligatorias** y habilitará auto-merge con squash. Esta decisión no afirma que ya estén activos ni los modifica.

## Alternativas consideradas

- **Pushear directamente a `main`:** descartado porque evita CI, trazabilidad del cambio y la posibilidad de activar auto-merge después de comprobar los checks.
- **Exigir CI de compilación iOS/Android completa en cada PR desde el primer día:** descartado por coste y complejidad de runners; se conserva la verificación nativa como puerta de aceptación del Sprint.
- **Pipelines con permisos amplios o acciones flotantes por tag:** descartados para reducir privilegios y cambios no reproducibles.
- **Actualizar dependencias solo cuando falle el build:** descartado porque acumula riesgo y hace más costosa la actualización.

## Consecuencias

- La protección de `main` debe comprobarse manualmente; la lectura de GitHub disponible no verificó la protección existente.
- No se requiere disponibilidad de otra persona para fusionar un cambio que haya pasado los checks. El autor es responsable de leer el resultado de CI y de activar o completar la fusión.
- Al no ser obligatoria la revisión humana, se reduce una barrera de colaboración, pero también una oportunidad de detectar problemas. CI, pruebas, PRs pequeños y revisión voluntaria siguen disponibles como medidas complementarias.
- El CI inicial solo hará obligatorios checks reproducibles que el workspace implemente.
- Las PR de Dependabot también pasarán por CI y no requerirán aprobación humana; se podrán fusionar automáticamente cuando cumplan las reglas. El equipo atenderá primero las alertas de seguridad.
- Los builds nativos podrían requerir runners macOS o una prueba manual documentada mientras no se disponga de ellos.

## Referencias

- [GitHub Docs: ramas protegidas y checks requeridos](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs: reglas disponibles para rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [Stack actual y configuración histórica de referencia en `main`](https://github.com/ddavid07/UniMovil/tree/main/.github)
