# Contribuir a UniMovil

Esta guía describe el flujo para proponer cambios en el repositorio. La documentación detallada del producto está en [`docs/`](docs/README.md); esta guía cubre el trabajo técnico y la integración.

## Antes de empezar

1. Lee el [`README.md`](README.md), [`AGENTS.md`](AGENTS.md) y el [índice de documentación](docs/README.md).
2. Para un cambio funcional, consulta la historia y sus criterios de aceptación en [`docs/requirements/user-stories/`](docs/requirements/user-stories/), el [Product Backlog](docs/backlog/product-backlog.md) y el plan del Sprint aplicable.
3. Para arquitectura, dependencias o configuración, revisa los ADR aceptados y el estándar de código aplicable.
4. Comprueba que el cambio no contradice el alcance o las decisiones vigentes. Si una decisión aceptada debe cambiar, documenta la alternativa y sus consecuencias en un ADR antes de implementar el cambio dependiente.

## Preparar el entorno

El proyecto fija Node.js `26.13.1` en `.node-version` y npm `11.20.0` en `package.json`.

```bash
npm ci
```

Android necesita Android Studio y Android SDK. Los builds nativos iOS necesitan macOS y Xcode. Para cuentas, favoritos e incidencias se requiere el stack local de Supabase; los pasos y variables están en la [guía de desarrollo](docs/development/README.md). Usa datos sintéticos y no añadas secretos al repositorio.

## Rama y commits

- Trabaja en una rama basada en `main`; no integres cambios directamente en `main`.
- Usa uno de los prefijos acordados: `feat/`, `fix/`, `docs/`, `test/`, `build/` o `ci/`. Añade una referencia breve a la HU cuando el cambio sea funcional.
- Usa Conventional Commits: `feat`, `fix`, `docs`, `test`, `build`, `ci` o `chore`. Incluye el identificador HU en cambios funcionales cuando corresponda.
- Mantén el cambio enfocado y actualiza el lockfile si cambia una dependencia.

Ejemplos:

```text
Rama:   feat/HU-020-route-details
Commit: feat(HU-020): add route details

Rama:   docs/update-development-guide
Commit: docs: update development guide
```

## Implementación y documentación

- Escribe código, comentarios técnicos, identificadores, carpetas y nombres de archivo en inglés. Escribe la documentación y los textos de interfaz en español, salvo nombres técnicos o marcas.
- Sigue TypeScript estricto, ESLint, Prettier, `.editorconfig` y las convenciones del paquete. Separa presentación, dominio y acceso a datos.
- Al añadir una dependencia a la aplicación Expo, usa `npx expo install` y comprueba compatibilidad con `npm run check:expo`.
- Mantén los cambios accesibles y cubre los estados de carga, error, vacío o falta de conexión que correspondan.
- Conserva la procedencia, licencia y fecha de los datos externos. No infieras apertura, vigencia, disponibilidad o accesibilidad sin una fuente que lo confirme.
- Actualiza en el mismo cambio las historias, backlog, ADR, guías, fuentes de datos o planes de Sprint afectados. Si la documentación no se ve afectada, indícalo en la descripción del PR.
- No incluyas secretos, tokens, datos personales innecesarios, `.env` locales ni artefactos generados. Usa `.env.example` solo para nombres de variables sin valores secretos.

## Comprobaciones

Ejecuta las comprobaciones que correspondan a las capas y plataformas afectadas. Los siguientes comandos existen en el workspace:

| Comprobación                             | Comando                                         |
| ---------------------------------------- | ----------------------------------------------- |
| Formato                                  | `npm run format:check`                          |
| ESLint                                   | `npm run lint`                                  |
| TypeScript                               | `npm run typecheck`                             |
| Pruebas del workspace                    | `npm run test:ci`                               |
| Pruebas unitarias del API                | `npm run api:test`                              |
| Compatibilidad de dependencias Expo      | `npm run check:expo`                            |
| Integración local con Supabase           | `npm run test:local-supabase`                   |
| Exportación de web y prueba de navegador | `npm run export:web` y `npm run test:web`       |
| Builds nativos                           | `npm run mobile:android` o `npm run mobile:ios` |

La prueba web requiere Chromium. La integración local con Supabase requiere iniciar y configurar el entorno como describe la guía de desarrollo. Un bundle JavaScript no sustituye un build ni una prueba nativa. Registra los comandos ejecutados y sus resultados; no marques como comprobada una plataforma que no se haya podido ejecutar.

## Pull requests

Propón cambios mediante una pull request hacia `main`. La plantilla del repositorio solicita objetivo, historias relacionadas, cambios principales, documentación, comprobaciones y evidencia. Antes de fusionar deben pasar los checks de CI requeridos por la configuración efectiva del repositorio.

La política aceptada en [ADR-0006](docs/adr/0006-github-governance-and-ci.md) no exige aprobación ni revisión humana obligatoria: quien crea la PR puede fusionarla cuando los checks requeridos estén en verde. La revisión de compañeros puede ser voluntaria. Auto-merge con squash se usa si está disponible. La última comprobación de las reglas y Settings efectivos está registrada en ADR-0006; los workflows versionados, por sí solos, no confirman la configuración remota.

No afirmes que una historia está terminada si falta un criterio de aceptación. Registra la limitación, la excepción aceptada o el trabajo restante en la documentación del Sprint y en el backlog; distingue la implementación local, la integración en GitHub y la publicación.
