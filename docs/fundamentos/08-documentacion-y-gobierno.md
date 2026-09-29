# 8. Documentación y gobierno del proyecto

## 8.1. Estructura documental

La documentación se organiza por propósito:

```text
docs/
  funcionalidades.md
  historias-de-usuario/
  fundamentos/
    01-fundamentos-del-producto.md
    02-stack-tecnologico.md
    03-arquitectura.md
    04-mapas-cartografia-y-rutas.md
    05-github-y-repositorio.md
    06-toolchain-y-estandares.md
    07-seguridad-y-privacidad.md
    08-documentacion-y-gobierno.md
    adr/
```

## 8.2. Regla de actualización

Todo cambio que altere una decisión documentada deberá actualizar la documentación correspondiente en el mismo pull request que modifica el código.

## 8.3. ADR

Las decisiones con impacto transversal se registrarán como Architecture Decision Records. Cada ADR debe explicar:

- Contexto.
- Decisión.
- Alternativas consideradas.
- Consecuencias.
- Estado.
- Fecha.

## 8.4. Trazabilidad

Los cambios importantes deben relacionarse con uno o más elementos:

- Historia de usuario.
- Requisito.
- Incidencia.
- ADR.
- Pull request.

## 8.5. Responsabilidades del equipo

El equipo de cinco personas compartirá la responsabilidad del producto. Las áreas de código podrán tener responsables principales mediante CODEOWNERS, pero ninguna parte crítica debe depender de una única persona.

## 8.6. Uso de IA generativa

La IA generativa podrá utilizarse para acelerar diseño, documentación, pruebas y código, pero el equipo seguirá siendo responsable de:

- Revisar el código generado.
- Validar licencias y atribuciones.
- Ejecutar pruebas.
- No introducir secretos ni datos personales.
- Comprender las decisiones incorporadas.
- Mantener la trazabilidad del cambio.

## 8.7. Cambios de decisiones

Una decisión podrá revisarse si:

- Cambian los requisitos.
- El proveedor deja de ser adecuado.
- Aparece una restricción técnica o económica.
- La seguridad o privacidad lo exige.
- La experiencia del equipo demuestra que la decisión no funciona.

La revisión no se hará eliminando el historial: se creará un nuevo ADR que reemplace o complemente al anterior.
