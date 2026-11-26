# Definición de Terminado (Definition of Done)

## Propósito y alcance

Esta definición establece el entendimiento compartido de qué significa que una historia de usuario o el Incremento de UniMovil esté terminado. Se aplica junto con los criterios de aceptación de cada historia, la [metodología de trabajo](README.md), los ADR vigentes y el alcance del Sprint.

La definición busca que el Incremento sea utilizable e integrable con el trabajo anterior. No exige por sí sola desplegar, publicar en tiendas o habilitar un servicio remoto; esos resultados requieren alcance y comprobaciones operativas propias. El estado de implementación local, integración en GitHub y publicación se documenta por separado y no se deduce uno del otro.

## Criterios comunes

Una historia o entrega cumple la Definición de Terminado cuando satisface los criterios aplicables siguientes:

1. **Alcance y aceptación:** cumple todos los criterios de aceptación comprobables y las restricciones de la historia y el Sprint. El Product Owner puede verificar el resultado respecto a esos criterios. Si un criterio no se satisface, queda abierto en el backlog y no se presenta como completado.
2. **Implementación completa:** el flujo acordado está integrado con los Incrementos anteriores; sus estados relevantes de carga, error, reintento, falta de conexión o ausencia de resultados tienen una respuesta comprensible cuando aplican.
3. **Estándares técnicos:** el código y los identificadores están en inglés, TypeScript estricto está satisfecho en sus paquetes y se cumplen ESLint, Prettier, `.editorconfig`, convenciones del paquete y lockfile vigente. La lógica de dominio y el acceso a datos se mantienen separados de la presentación según las convenciones del proyecto.
4. **Pruebas y calidad:** se añaden o actualizan pruebas adecuadas al riesgo y al cambio. Las comprobaciones aplicables de formato, lint, tipos, pruebas, compatibilidad de Expo, exportación y build se ejecutan y sus resultados se registran con precisión. Los defectos que impiden los criterios de aceptación se resuelven antes de declarar la historia terminada.
5. **Plataformas afectadas:** se verifica el comportamiento en las plataformas incluidas en el alcance de la historia. Los cambios de cliente público comprueban la experiencia web y móvil cuando afectan a ambas. Para web, se exporta y comprueba el cliente en la matriz acordada: Chromium en escritorio (1280 × 800) y ventana estrecha (390 × 844), con teclado, diseño adaptable y alternativa textual cuando correspondan. Para cambios nativos se comprueban builds y flujos en los entornos nativos aplicables; exportar JavaScript no equivale a validar una aplicación nativa.
6. **Accesibilidad y comprensión:** controles, textos, foco, etiquetas y anuncios de estado son comprensibles y utilizables en las superficies afectadas. La información esencial no depende solo del color o del mapa; se ofrece una alternativa textual cuando la función depende de cartografía. Las comprobaciones manuales se realizan cuando el criterio no puede demostrarse solo con pruebas automatizadas.
7. **Seguridad y privacidad:** permisos y autorización corresponden al comportamiento previsto y se aplican en el servidor cuando procede. No se incorporan secretos, credenciales, datos personales innecesarios ni información sensible a código, fixtures, logs o artefactos. Los datos de cuenta e incidencias respetan los controles y límites aceptados en sus ADR.
8. **Datos y dependencias externas:** los datos incorporados tienen fuente, licencia, fecha y ámbito trazables cuando corresponda. No se infieren vigencia, apertura, disponibilidad o accesibilidad sin evidencia. La atribución del proveedor cartográfico está visible y su uso respeta las condiciones documentadas.
9. **Documentación sincronizada:** se actualizan en el mismo cambio las historias, Product Backlog, ADR, instrucciones de desarrollo, fuentes de datos y planes de Sprint afectados. Si se comprueba que un documento no necesita cambios, la PR o el resultado local lo indica brevemente.
10. **Integración y evidencia:** el cambio es reproducible con las versiones y configuración documentadas; se conserva evidencia de las pruebas, plataformas y limitaciones reales. Cuando se integra mediante PR, pasan los checks requeridos de CI antes de la fusión. La política de GitHub no requiere aprobación humana para fusionar con CI en verde, según [ADR-0006](../adr/0006-github-governance-and-ci.md).
11. **Riesgos y trabajo restante:** los riesgos vigentes y los límites conocidos se reflejan en el plan del Sprint o en el [registro transversal de riesgos](../risks/risk-management-plan.md). El trabajo que no cumple los criterios vuelve al Product Backlog con su estado y evidencia; una propuesta futura no se presenta como implementada.

Los criterios se aplican de forma pertinente al elemento, pero su pertinencia se decide al planificar y verificar el trabajo, no después de observar el resultado. Una tarea técnica que contribuya a una historia debe satisfacer los estándares y pruebas que le correspondan, aunque no tenga criterios de aceptación de usuario propios.

## Excepciones de verificación

Si una plataforma, dato o servicio externo no está disponible, la limitación no se sustituye por una prueba que no demuestre el comportamiento. Para cerrar un Sprint con una excepción, su plan registra el criterio afectado, la causa, la evidencia que sí se obtuvo, el riesgo, la decisión de aceptación y el trabajo que queda pendiente. La excepción queda limitada a ese Sprint y no cambia la definición general.

Los planes de los Sprints 1–7 registran la excepción de validación nativa iOS por falta de macOS/Xcode. Esa excepción no equivale a un build ni a una prueba nativa, y no se extiende automáticamente a incrementos posteriores. La exportación JavaScript iOS solo demuestra la exportación correspondiente.

Una excepción no permite afirmar que se verificó una plataforma, que se satisfizo un criterio sin evidencia, ni que un servicio local está listo para producción. En particular, las pruebas con Supabase local y datos sintéticos no autorizan uso de datos reales ni despliegue remoto.

## Integración, fusión y publicación

La Definición de Terminado se refiere al estado del elemento y del Incremento. El trabajo local puede completar su implementación y verificación sin que ello signifique que ya se ha publicado o fusionado en GitHub. El plan y el resultado del Sprint distinguen esos estados.

Cuando se integre un cambio en GitHub, se usa una pull request hacia `main` y se esperan los checks requeridos en verde. No se exige aprobación ni revisión humana obligatoria; la fusión puede realizarla el autor conforme a ADR-0006. La última comprobación de las reglas efectivas está registrada en ADR-0006; los archivos locales por sí solos no demuestran el estado de Settings.

La preparación de un piloto, el uso de cuentas o incidencias reales, el despliegue y la publicación requieren verificar además las condiciones operativas, legales, de privacidad, proveedor y mantenimiento aplicables. Esta definición no los autoriza.

## Uso en los Sprints

Cada plan de Sprint enlaza esta definición y añade solo verificaciones específicas de su alcance: historias seleccionadas, fuentes, plataforma, builds, integración, privacidad, riesgos y evidencia. Si un Sprint propone una excepción, debe mantenerla explícita y no convertirla en una regla general para el proyecto.

La Definición de Terminado se revisa cuando haya evidencia que justifique elevar la calidad o adaptar el proceso, mediante el proceso de mejora del equipo y manteniendo trazabilidad con los criterios de aceptación y estándares vigentes.

## Referencias

- [Metodología de trabajo](README.md)
- [Historias de usuario](../requirements/user-stories/README.md)
- [ADR-0006 — gobierno de GitHub, CI y dependencias](../adr/0006-github-governance-and-ci.md)
- [ADR-0011 — cliente web público y renderizadores cartográficos](../adr/0011-public-web-client-and-map-renderer.md)
- [Materiales del curso sobre Scrum](../assets/course-materials/lecture-notes/topic-03-1-agile-and-scrum.pdf)
- [Plantilla de Sprint](../iterations/sprint-template.md)
