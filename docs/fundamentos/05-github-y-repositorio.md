# 5. GitHub y configuración del repositorio

## 5.1. Visibilidad

UniMovil podrá mantenerse público mientras no contenga secretos, datos personales reales, credenciales, certificados ni información interna no autorizada.

La licencia Apache 2.0 permite reutilizar el código, pero no autoriza por sí sola el uso de marcas, logotipos, datos privados o servicios de la UCM.

## 5.2. Rama principal

- Rama principal: `main`.
- No se realizarán pushes directos ordinarios a `main`.
- Los cambios llegarán mediante pull requests.
- `main` no podrá borrarse ni recibir force pushes.
- Se exigirá que CI pase antes de fusionar.
- Se resolverán las conversaciones de revisión antes de fusionar.
- Se utilizará squash merge como estrategia predeterminada.
- Se eliminarán automáticamente las ramas ya fusionadas.

## 5.3. Nombres de ramas

```text
feature/<descripcion-corta>
fix/<descripcion-corta>
docs/<descripcion-corta>
chore/<descripcion-corta>
```

Las ramas deben ser pequeñas, tener una responsabilidad clara y partir de `main` actualizada.

## 5.4. Pull requests

Todo pull request deberá:

- Explicar qué cambia y por qué.
- Relacionar la historia de usuario, incidencia o decisión correspondiente.
- Indicar impacto funcional, de seguridad, privacidad y compatibilidad.
- Incluir evidencia de pruebas.
- Indicar si requiere migraciones o cambios de configuración.
- Confirmar que no contiene secretos ni datos personales.
- Ser revisado al menos por una persona del equipo.

Se utilizará una plantilla de pull request para mantener esta información uniforme.

## 5.5. CODEOWNERS

Se utilizará `.github/CODEOWNERS` para asignar responsables a:

- Workflows y configuración de GitHub.
- Aplicación móvil.
- Backend y API.
- Contratos y modelo de datos.
- Documentación.
- Seguridad y licencia.

Durante el arranque, el propietario actual del repositorio será el responsable predeterminado. Cuando se incorporen las cuentas de los cinco miembros, se asignarán responsables por área para que las partes críticas no dependan de una única persona.

## 5.6. GitHub Actions

Los workflows deberán:

- Declarar `permissions` mínimos.
- Utilizar `persist-credentials: false` en checkout cuando proceda.
- Fijar las acciones por SHA y comentar la versión legible.
- Definir límites de tiempo.
- Utilizar `concurrency` para cancelar ejecuciones obsoletas.
- No imprimir secretos.
- Separar calidad, seguridad y publicación.
- Utilizar secretos y variables de entorno de GitHub, nunca valores sensibles versionados.

## 5.7. CI obligatoria

En pull requests se validará como mínimo:

- Instalación reproducible con `npm ci`.
- Formato.
- Lint.
- TypeScript estricto.
- Tests unitarios.
- Cobertura mínima definida por el equipo.
- Build de la API.
- Validación de contratos y documentación.
- Auditoría básica de dependencias.

La aplicación móvil añadirá comprobaciones de Expo, lint, typecheck y tests de componentes. Los builds completos para iOS y Android se ejecutarán cuando el entorno de credenciales y publicación esté preparado.

## 5.8. Dependabot

Se configurará Dependabot para:

- Dependencias npm.
- GitHub Actions.
- Frecuencia semanal.
- Grupos de actualizaciones relacionadas.
- Etiquetas `dependencies` y `supply-chain`.
- Límite de pull requests abiertas.

No se activará auto-merge de Dependabot hasta comprobar que el CI es estable.

## 5.9. Seguridad de GitHub

Están activados en el repositorio público:

- Dependabot alerts.
- Dependabot security updates.
- Secret scanning.
- Push protection.
- Dependency Review en pull requests.
- CodeQL para TypeScript y JavaScript.
- OSV-Scanner o herramienta equivalente.
- Protección de rama `main` con PR obligatorio, aprobación, checks y sin force push ni borrado.

El repositorio es público para utilizar las prestaciones gratuitas de seguridad y gobernanza de GitHub. Secret scanning y push protection están habilitados; CodeQL analiza TypeScript/JavaScript y Dependency Review bloquea dependencias nuevas de severidad alta o crítica. OpenSSF Scorecard se ejecuta de forma periódica. Véanse [ADR-0014](adr/0014-repositorio-publico-y-controles-github.md) y [SECURITY.md](../../SECURITY.md).

## 5.10. Workflows previstos

```text
.github/workflows/
  ci.yml             Calidad, tipos, tests y build
  security.yml       Secretos y dependencias
  codeql.yml         Análisis CodeQL
  dependency-review.yml Revisión de dependencias en PR
  scorecard.yml      Métricas OpenSSF del repositorio
  release.yml        Publicación, cuando se definan versiones
```

No se copiarán automáticamente todos los workflows de `verification-engine`. Fuzzing, mutation testing, SBOM avanzado y pipelines de publicación se añadirán cuando haya necesidad documentada.

## 5.11. Protección de datos en el repositorio

- No se versionarán tokens, claves, certificados ni archivos `.env`.
- No se utilizarán datos reales de estudiantes, profesores o visitantes en pruebas.
- Los fixtures contendrán datos ficticios.
- Los logs de CI no mostrarán información personal.
- Las claves de mapas se gestionarán como configuración por entorno.
- Las credenciales de publicación móvil se almacenarán como secretos protegidos.
