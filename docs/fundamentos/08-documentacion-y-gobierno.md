# 8. Documentación y gobierno del proyecto

## 8.1. Separación documental

La documentación se mantiene en tres espacios con responsabilidades distintas:

- **Este repositorio (`UniMovil`):** código y documentación técnica directamente vinculada a la implementación. Código y documentación técnica evolucionan juntos para evitar divergencias.
- **[UniMovil-docs](https://github.com/ddavid07/UniMovil-docs):** documentación académica y de proyecto, catálogo funcional, requisitos e historias de usuario, metodología, backlog, iteraciones, reuniones, validación, presentaciones, memoria e investigación.
- **[Wiki de UniMovil](https://github.com/ddavid07/UniMovil/wiki):** orientación rápida y operativa. Es complementaria y no sustituye a la documentación versionada.

Los documentos históricos se conservan como referencia y no representan la planificación vigente. El antiguo plan de acción completo está en `historical/plan-de-accion.md` dentro de UniMovil-docs. La planificación actual es evolutiva y se refleja en el backlog y en las iteraciones que el equipo confirme; no existe un plan completo cerrado e inmutable.

## 8.2. Estructura técnica

```text
docs/
  fundamentos/       fundamentos técnicos y gobierno
    adr/             decisiones técnicas
apps/
  mobile/            aplicación Android e iOS
  api/               backend NestJS
  admin/             panel web de administración
packages/             contratos y configuración compartida
scripts/              automatización del repositorio
```

La documentación técnica actual está indexada en [docs/fundamentos/README.md](README.md). La instalación y los comandos locales están en [CONTRIBUTING.md](../../CONTRIBUTING.md), y la seguridad técnica en [SECURITY.md](../../SECURITY.md).

## 8.3. Regla de actualización

Todo cambio que altere el comportamiento, una interfaz, una configuración o una decisión técnica debe actualizar la documentación correspondiente en el mismo pull request que modifica el código. Los requisitos y la documentación académica se actualizan en UniMovil-docs.

## 8.4. ADR

Las decisiones técnicas con impacto transversal se registran como Architecture Decision Records en `docs/fundamentos/adr/`. Cada ADR debe explicar contexto, decisión, alternativas, consecuencias, estado y fecha. Los ADR permanecen junto al código para conservar la relación con su implementación.

## 8.5. Trazabilidad y responsabilidades

Los cambios importantes deben relacionarse con una historia, requisito, incidencia, ADR o pull request. CODEOWNERS asigna la revisión inicial a las personas mantenedoras configuradas en GitHub.

## 8.6. Uso de IA generativa

La IA generativa podrá utilizarse para acelerar diseño, documentación, pruebas y código, pero el equipo seguirá siendo responsable de revisar el código generado, validar licencias y atribuciones, ejecutar comprobaciones, no introducir secretos ni datos personales, comprender las decisiones incorporadas y mantener la trazabilidad.

## 8.7. Cambios de decisiones

Una decisión técnica podrá revisarse si cambian los requisitos, el proveedor deja de ser adecuado, aparece una restricción técnica o económica, la seguridad o privacidad lo exige, o la experiencia demuestra que la decisión no funciona. La revisión conserva el historial mediante un nuevo ADR que reemplaza o complementa al anterior.
