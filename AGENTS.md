# Instrucciones para agentes de código

Estas instrucciones se aplican a todo el repositorio. Síguelas junto con las instrucciones del sistema, del desarrollador y las solicitudes de la persona usuaria; estas instrucciones no las sustituyen ni las pueden contradecir.

## 1. Comprende el proyecto antes de actuar

- Antes de cualquier cambio, lee `README.md`, `docs/README.md` y la documentación directamente relacionada con la tarea. No empieces a editar basándote solo en el nombre de una historia o en una conversación anterior.
- Para trabajo de producto, consulta las historias y el Product Backlog. Para una funcionalidad planificada, consulta también el plan de su Sprint. Para arquitectura, dependencias o configuración, lee los ADR vigentes y el estándar de código aplicable.
- En cambios amplios, de planificación o de estructura documental, revisa el conjunto de documentación afectado y sus índices. Para aplicar el temario, consulta los materiales relevantes en `docs/assets/course-materials/`.
- Inspecciona el código, la estructura y las convenciones existentes antes de proponer o modificar una implementación. Distingue el estado real de la rama local de referencias históricas, ramas remotas y planes futuros.
- Si hay conflicto entre documentación, código y ADR, no elijas en silencio: identifica la discrepancia, determina qué fuente es vigente y resuélvela con el cambio mínimo o registra la decisión necesaria.

## 2. Contexto y decisiones vigentes

- UniMovil ayuda a estudiantes y visitantes a orientarse y desplazarse por el Campus de Moncloa de la UCM.
- El producto público se ofrecerá en aplicaciones nativas Android/iOS y en un cliente accesible desde navegadores web. El primer flujo es consultar el mapa y buscar lugares públicos sin registro ni permiso de ubicación. El cliente web público y la aplicación administrativa son productos separados.
- El stack objetivo se registra en `docs/adr/`: Expo, React Native, Expo Router, TypeScript y MapLibre para móvil; la estrategia técnica y los navegadores compatibles del cliente público web se decidirán mediante ADR en el Sprint 3; NestJS y REST/OpenAPI para la API cuando exista una necesidad de servidor; PostgreSQL/PostGIS para persistencia compartida; React/Vite para administración cuando se refinen esas historias.
- No añadas backend, base de datos, autenticación, almacenamiento, rutas, panel administrativo ni servicios cloud antes de que una historia refinada los necesite.
- MapLibre necesita un build nativo: Expo Go no sirve como única vía de desarrollo o aceptación. El mapa actual usa teselas raster de OpenStreetMap para visualización interactiva de bajo volumen, con `User-Agent` identificable, atribución visible y respeto a la caché; no se descargan ni precargan teselas y el mapa base no ofrece uso offline. El proveedor para un piloto o publicación debe elegirse y documentarse antes de ese uso.
- La documentación vigente prevalece sobre implementaciones o documentos antiguos del remoto. Usa código histórico solo como referencia y verifica su pertinencia, procedencia y licencia antes de reutilizarlo.
- Las decisiones aceptadas se mantienen mediante ADR numerados en `docs/adr/`. No cambies silenciosamente una decisión aceptada: crea un ADR nuevo o actualiza el existente según su convención, registra alternativas y consecuencias, y enlaza la decisión que se sustituye.

## 3. Idioma y estándares

- Escribe código, comentarios técnicos, identificadores, nombres de carpetas y archivos en inglés.
- Escribe la documentación del proyecto, historias de usuario y textos visibles de la interfaz en español, salvo nombres técnicos o marcas que deban conservarse.
- Usa TypeScript estricto en los paquetes TypeScript. Sigue ESLint, Prettier, `.editorconfig`, el lockfile y las convenciones locales del paquete; no inventes un segundo estándar.
- Mantén las funcionalidades organizadas por dominio. Separa presentación, lógica de dominio y acceso a datos; evita reglas de negocio dentro de componentes de interfaz.
- Prefiere cambios pequeños, legibles, tipados y coherentes con las dependencias existentes. No añadas paquetes, abstracciones, configuraciones, comentarios o refactors que no sean necesarios para la solicitud.
- Usa Conventional Commits (`feat`, `fix`, `docs`, `test`, `build`, `ci`, `chore`) y referencia el identificador HU en cambios funcionales cuando corresponda.

## 4. Forma de trabajar

1. Identifica el resultado solicitado, las historias/criterios aplicables, las restricciones y los archivos afectados.
2. Lee la documentación y el código pertinentes; comprueba compatibilidad y documentación oficial cuando una versión, API, política o dependencia pueda haber cambiado.
3. Si la tarea tiene varias partes, explica brevemente el enfoque y avanza por pasos que puedan revisarse.
4. Implementa el alcance solicitado sin cambios laterales. Conserva datos, trabajo local y convenciones que no formen parte de la tarea.
5. Actualiza la documentación, el backlog o los ADR afectados para mantener la trazabilidad.
6. Revisa el resultado y comunica con precisión lo que quedó hecho, lo que se comprobó y cualquier limitación pendiente.

No inventes requisitos, decisiones aprobadas, reuniones, integrantes responsables, resultados de pruebas, fuentes de datos, permisos o configuración remota. Si falta información no bloqueante, declara una suposición razonable y continúa; si una decisión externa bloquea la implementación, completa el trabajo independiente y señala exactamente qué falta.

## 5. Calidad, pruebas y accesibilidad

- Implementa historias mediante cortes verticales y satisface todos sus criterios de aceptación. Gestiona estados de carga, error, vacío y falta de conexión cuando correspondan.
- Sigue la estrategia de pruebas del paquete. Añade o ejecuta pruebas cuando la persona usuaria solicite pruebas o verificación; nunca afirmes que una comprobación pasó si no la ejecutaste e informa claramente las que no se ejecutaron.
- Para interfaces móviles, web pública y administración, conserva navegación comprensible, etiquetas accesibles, soporte de lector de pantalla, contraste adecuado y controles usables. En web verifica diseño adaptable en la matriz de navegadores/ventanas acordada. No presentes un mapa como única forma de transmitir información importante.
- No introduzcas secretos, credenciales, datos personales innecesarios ni archivos `.env` locales en el repositorio. Usa variables de entorno documentadas y plantillas sin valores secretos cuando sean necesarias.
- Para datos cartográficos, conserva fuente, licencia y fecha de comprobación. No infieras accesibilidad, horarios, entradas o vigencia a partir de coordenadas o de una fuente que no lo confirme. Mantén las atribuciones visibles y respeta las políticas del proveedor.

## 6. GitHub y límites de publicación

- Trabaja en la rama local activa salvo que la solicitud indique otra cosa. No hagas cambios directamente en `main`.
- El flujo previsto usa pull requests y checks de CI. No configures ni describas una aprobación humana obligatoria: el autor debe poder fusionar su PR cuando los checks requeridos estén en verde; se prevé auto-merge con squash. La revisión de compañeros puede ser voluntaria, nunca una barrera.
- Las reglas de rama, auto-merge y controles que residen en GitHub Settings deben distinguirse de los archivos locales. No afirmes que están activos sin comprobarlo.
- No hagas push, no modifiques el remoto, GitHub Settings, la Wiki remota ni publiques o despliegues cambios sin una solicitud explícita. No reescribas ni descartes historial o trabajo local sin autorización expresa.
- No crees actas que presenten como ocurridas reuniones que no se celebraron. Mantén los planes en `docs/iterations/` y registra actas reales en `docs/meetings/`.

## 7. Documentación de referencia

- `docs/README.md`: índice principal.
- `docs/user-stories/`: requisitos y criterios de aceptación.
- `docs/backlog/`: prioridades y estado del Product Backlog.
- `docs/methodology/`: proceso de trabajo.
- `docs/iterations/`: plan y resultados de cada Sprint; consulta especialmente el Sprint activo.
- `docs/adr/`: arquitectura y decisiones técnicas vigentes.
- `docs/assets/course-materials/`: temario y referencias académicas.
- `docs/meetings/`: actas de reuniones celebradas.
- La Wiki sirve como navegación y orientación; la documentación detallada versionada en este repositorio es la fuente principal del proyecto.
