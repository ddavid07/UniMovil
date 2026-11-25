# Sprint 13 — resiliencia, accesibilidad web y móvil y preparación de versión

> **Estado:** plan futuro propuesto; exige refinar criterios de cierre y confirmar los entornos del cliente web y de ambas plataformas nativas.

## Sprint Goal

La versión integrada en navegador, Android e iOS comunica fallos y limitaciones con claridad, ofrece ayuda accesible y una lista de cambios, y puede validarse de forma repetible con evidencia de calidad, seguridad y compatibilidad.

## Historias candidatas

| ID     | Historia                                                                                       | Resultado esperado                                                                              |
| ------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| HU-094 | [Gestionar errores y falta de conexión](../../user-stories/08-security-privacy-and-quality.md) | Diferenciar causas, conservar entradas y permitir acciones seguras/reintento.                   |
| HU-095 | [Utilizar una interfaz accesible](../../user-stories/08-security-privacy-and-quality.md)       | Controles nombrados, contraste, ampliación de texto, lector de pantalla y alternativas al mapa. |
| HU-096 | [Consultar ayuda y soporte](../../user-stories/08-security-privacy-and-quality.md)             | Ayuda coherente con funciones reales, canal aprobado y versión instalada.                       |
| HU-098 | [Consultar los cambios de una versión](../../user-stories/08-security-privacy-and-quality.md)  | Versión y notas fieles al artefacto, sin pérdida de datos en actualización.                     |

Este Sprint completa criterios transversales acumulados y prepara una versión candidata; no autoriza despliegue público, envío a tiendas ni política de soporte que no haya sido acordada.

## Resultado esperado de la secuencia

Al concluir los incrementos planificados, la versión de desarrollo debe integrar:

- Mapa, búsqueda, fichas, recursos y rutas peatonales, multimodales y accesibles en clientes públicos web y móvil, limitados por la evidencia de sus fuentes.
- Datos con procedencia, licencia, fecha, cobertura y estado; información desconocida o vencida no se presenta como confirmada.
- Cuentas, favoritos, preferencias, historial y rutas guardadas con privacidad, autorización y borrado verificados.
- Comunicación y consulta de incidencias con evidencias privadas, estados visibles y revisión administrativa trazable.
- Avisos y restricciones con vigencia, gestión mediante panel separado y publicación segura en clientes públicos.
- Herramientas de administración conectadas a API para catálogo y transporte, con importación validada, recuperación y trazabilidad.
- Pruebas de dominio, interfaz, contratos, API y E2E; CI para todos los clientes y validación de accesibilidad, seguridad, navegador, Android e iOS.

Este resultado es un objetivo de planificación, no evidencia de implementación ni autorización para operar datos reales o publicar.

## Condiciones de entrada

- Los flujos seleccionados de mapa, búsqueda, rutas, cuentas, incidencias, avisos y administración deben estar integrados en una línea de producto reproducible. Los defectos críticos impiden declarar lista la versión y vuelven al backlog.
- Los workflows de CI ejecutan format, lint, typecheck, pruebas, contratos, builds y controles de seguridad relevantes para todos los workspaces.
- La matriz de navegadores/ventanas fijada en el ADR del Sprint 3 está disponible en CI o en una ruta manual reproducible; los flujos públicos principales y estados adaptables se prueban en ella.
- La excepción de validación iOS de Sprints anteriores no se extiende. Si el equipo no tiene macOS/Xcode local, configurar runner macOS con simulador o dispositivo y comprobarlo antes de depender de ese control.
- El catálogo de datos, los proveedores externos, la privacidad y los límites de uso están documentados; no debe haber credenciales reales en Git.

## Alcance y límites

- Unificar estados de carga, error, vacío, falta de red, permisos insuficientes, fuente caducada y reintento con acciones útiles.
- Identificar datos disponibles offline y lo que requiere conexión. Respetar la política de teselas de ADR-0007: no precargar ni descargar mosaicos OSM; la experiencia offline no promete el mapa base.
- Revisar navegación, lector de pantalla, foco, etiquetas, contraste, tamaño de texto y alternativas textuales en móvil y administración; corregir defectos encontrados.
- Revisar diseño adaptable de la experiencia pública web, teclado, foco visible, zoom, lector de pantalla y mapa/lista alternativa en las ventanas y navegadores soportados.
- Añadir ayuda y contacto únicamente cuando exista un canal responsable; no inventar tiempos de respuesta ni soporte operativo.
- Generar notas de versión desde cambios confirmados y comprobar actualización/migración sin pérdida de preferencias, favoritos o incidencias.
- Completar comprobaciones de seguridad y accesibilidad acordadas; incidentes críticos, vulnerabilidades severas o fallos de datos bloquean la aceptación hasta resolverse o tener una decisión válida de riesgo.

## Responsabilidades y tareas

| ID  | Actividad y entregable                                                                                                                                    | Depende de             | Área funcional        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------- |
| T1  | Consolidar defectos, criterios de aceptación y matriz de dispositivos/tecnologías de asistencia para los flujos del objetivo.                             | Incrementos anteriores | PO + Developers       |
| T2  | Revisar estados de error en móvil/web/API/admin; estandarizar códigos y mensajes sin exponer stack traces o datos sensibles.                              | T1                     | API + experiencia     |
| T3  | Revisar operación sin red y caché permitida; conservar formularios solo con consentimiento y permitir reintentos idempotentes.                            | T2, ADR-0007           | Dominio + privacidad  |
| T4  | Ejecutar revisión de accesibilidad manual y automática en web, móvil y administración: controles, formularios, mapa, rutas, tablas y mensajes dinámicos.  | T1                     | Accesibilidad/calidad |
| T5  | Corregir los defectos priorizados por impacto; añadir regresiones automatizadas para cada criterio corregido.                                             | T2–T4                  | Developers            |
| T6  | Preparar ayuda, contacto aprobado, versión y notas de cambios ligadas a un artefacto identificable para web y móvil.                                      | T1                     | Producto + clientes   |
| T7  | Completar pruebas unitarias, componentes, integración API/DB, E2E móvil, web y admin, seguridad de roles, migración y regresión.                          | T5, T6                 | Calidad               |
| T8  | Ejecutar build web reproducible y builds nativos limpios Android/iOS; usar CI macOS/simulador si no hay entorno local; guardar evidencia sin secretos.    | T7                     | Integración           |
| T9  | Revisar licencias/procedencia, SBOM/dependencias según controles adoptados, variables de entorno y guía de reproducción; actualizar docs y release notes. | T7, T8                 | Calidad/documentación |
| T10 | Inspeccionar criterios de la versión; registrar defectos abiertos, decisiones de riesgo aprobadas y elementos excluidos.                                  | T9                     | Scrum Team            |

| Área                                 | Responsabilidad                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Product Owner                        | Validar el comportamiento integrado y el contenido de ayuda/notas de versión.                  |
| Scrum Master                         | Facilitar inspección de riesgos, impedimentos y mejora del flujo.                              |
| Developers — web/móvil/admin/API     | Resolver fallos funcionales y de experiencia con incrementos pequeños y pruebas de regresión.  |
| Developers — seguridad/accesibilidad | Comprobar amenazas, permisos, controles accesibles y datos personales.                         |
| Developers — CI/integración          | Mantener build web, builds reproducibles, workflows y evidencia para navegador, Android e iOS. |
| Developers — documentación           | Alinear guías, historias, ADR, riesgos y release notes con el estado real.                     |

## Archivos y sistemas previstos

Aplicaciones `apps/mobile/`, cliente público web definido en ADR-0010 y su ADR técnico, `apps/api/`, `apps/admin/`, `packages/`, `.github/workflows/`, `.maestro/`, scripts de CI/E2E y documentación de desarrollo, seguridad, datos, historias, backlog y release. No cambiar Settings del remoto sin solicitud y comprobación independiente.

## Riesgos y respuestas

| Riesgo                                            | Probabilidad / impacto | Mitigación, señal y respuesta                                                                                       | Seguimiento   |
| ------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------- |
| No hay entorno nativo iOS                         | Media / Alta           | Usar runner macOS/simulador mantenido y validar la ruta completa; sin evidencia nativa no se cierra la DoD general. | Integración   |
| Accesibilidad se reduce a comprobación automática | Media / Alta           | Añadir recorrido manual con VoiceOver/TalkBack, teclado web y ampliación de texto; registrar y corregir defectos.   | Calidad       |
| Caché offline muestra contenido vencido           | Media / Alta           | Etiquetar fecha/estado y expirar según política; no almacenar teselas si ADR-0007 lo prohíbe.                       | Datos + móvil |
| Notas describen funcionalidad no incluida         | Baja / Media           | Generar a partir de cambios integrados y enlazar versión/artefacto; retirar afirmaciones no verificables.           | Producto      |
| Flujos integrados no comparten errores/contratos  | Media / Alta           | Pruebas E2E y contract tests; resolver incompatibilidades antes de declarar versión candidata.                      | API + QA      |

## Pruebas, documentación y Definition of Done

La evidencia cubre pruebas de regresión, contratos API, E2E representativos, accesibilidad manual/automática, matriz de navegador, validación sin red, actualización desde una instalación previa y build web y ejecución nativa en Android e iOS. Los informes identifican versión, plataforma, configuración y limitaciones, y no contienen secretos o datos personales.

DoD: criterios de las historias del alcance satisfechos; CI web y de workspaces completa; vulnerabilidades/riesgos tratados conforme a política; datos con procedencia/estado; documentación y ayuda vigentes; aceptación del Product Owner; build web verificado en navegadores compatibles y builds nativos Android/iOS verificables; cambios de configuración operativa pendientes explícitamente separados de cambios locales. Una exportación JS no sustituye un build o prueba nativa.

La Definition of Done de la versión incluye además build/CI web y evidencia en la matriz de navegadores acordada, con navegación por teclado, diseño adaptable y alternativa textual comprobados. HU-028 (tiempo real) y HU-078/079 (estadísticas/exportación) no forman parte de esta versión mientras no se resuelvan sus fuentes, finalidad y políticas. Esta planificación no autoriza piloto, hosting o publicación: aún requieren proveedor cartográfico compatible, titularidad de cuentas, condiciones de uso, responsables y aprobaciones externas documentadas.

## Ceremonias y cierre

Realizar Sprint Planning, Daily Scrum, Sprint Review y Retrospective según la metodología. Sus actas se crearán solo después de las reuniones. El resultado del Sprint distinguirá aceptación del incremento, defectos restantes, riesgos aceptados por quien tenga autoridad y cualquier dependencia de publicación externa.
