# Sprint 4 — transporte público y rutas multimodales

> **Estado:** incremento implementado localmente. Este documento conserva el plan inicial y registra abajo la evidencia técnica y los límites; no crea actas ni afirma ceremonias que no constan.

## Sprint Goal

Una persona puede comparar las alternativas disponibles para un trayecto y consultar líneas y paradas de autobús del campus con su recorrido, conexiones y vigencia claramente identificados.

## Historias incluidas

| ID     | Historia                                                                             | Resultado esperado                                                                                                                          |
| ------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| HU-022 | [Consultar rutas con diferentes medios](../../user-stories/03-routes-and-transit.md) | Alternativas disponibles de caminar, bicicleta y autobús, con duración, distancia, transbordos y tramos a pie cuando los datos lo permitan. |
| HU-025 | [Comparar y ajustar alternativas](../../user-stories/03-routes-and-transit.md)       | Preferencia seleccionable y explicación breve de diferencias y limitaciones.                                                                |
| HU-026 | [Consultar una línea de autobús](../../user-stories/03-routes-and-transit.md)        | Recorrido, paradas ordenadas, horarios disponibles, fuente y fecha de actualización.                                                        |
| HU-027 | [Consultar una parada](../../user-stories/03-routes-and-transit.md)                  | Ubicación, líneas asociadas, horarios disponibles, incidencias vigentes y acceso al planificador.                                           |

Las prioridades globales del Product Backlog no cambian. HU-028 (tiempo real) no se incluye: el recurso ETA de EMT requiere credencial y la integración no está aprobada.

## Cliente público web

HU-022/025/026/027 se entregan en la experiencia móvil y web pública: comparación de alternativas, líneas, paradas y estados de vigencia con presentación adaptable y alternativa textual. Se reutilizan los contratos y datos verificados del Sprint 3; el panel de administración no forma parte del cliente público.

## Entrada, alcance y límites

- El Sprint 3 dejó el cálculo peatonal y la presentación web/móvil que se reutilizan en este incremento.
- La fuente seleccionada es el conjunto oficial GTFS de EMT Madrid con licencia y trazabilidad conservadas en [ADR-0013](../../adr/0013-emt-gtfs-and-transit-routing.md) y la guía de datos.
- No se simularán horarios, llegada en tiempo real, disponibilidad, retrasos ni transbordos no respaldados por datos.
- No se añaden bicicleta compartida, compra de billetes, tarifas, geolocalización continua, panel de transporte ni servicios externos sin decisión registrada.

## Decisiones y dependencias

La fuente, su transformación, el estado no realtime y la alternativa directa están decididos en [ADR-0013](../../adr/0013-emt-gtfs-and-transit-routing.md). La ETA no se integra porque requiere credencial; el enlace de incidencias abre el canal oficial sin copiar su contenido al catálogo.

La alternativa de autobús reutiliza el grafo peatonal de ADR-0012 para acceder a una parada y salir de otra, y solo ofrece un servicio directo respaldado por calendario GTFS. La bicicleta se identifica como no disponible por ausencia de una red ciclista verificada; no se simulan transbordos.

## Responsabilidades funcionales

| Área                               | Responsabilidad                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Product Owner                      | Aclarar los modos prioritarios, qué significa “disponible” y qué información de horarios puede publicarse. |
| Scrum Master                       | Hacer visibles dependencias externas de operadores y ayudar a adaptar el plan si no hay fuente autorizada. |
| Developers — transporte y datos    | Investigar fuentes, preparar catálogo versionado y validar vínculos línea/parada/recorrido/servicio.       |
| Developers — rutas y móvil         | Integrar combinaciones a pie/bus/bicicleta y presentación accesible de alternativas.                       |
| Developers — API/contratos         | Evolucionar contratos tipados y validadores; exponer metadatos de fuente y actualización.                  |
| Developers — calidad/documentación | Probar casos de conexión y datos caducados, comprobar ambos builds y actualizar el material afectado.      |

## Plan de trabajo y dependencias

| ID  | Actividad y entregable                                                                                                                             | Depende de                    | Área funcional        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------- |
| T1  | Refinar HU-022/025/026/027, definir escenarios de transbordo, trayecto incompleto y horario no disponible.                                         | Historias + Sprint 3          | PO + Developers       |
| T2  | Inventariar fuentes candidatas y validar autoridad, uso, formato, cobertura, actualización y atribución; dejar evidencia reproducible.             | T1                            | Transporte y datos    |
| T3  | Redactar y aceptar ADR de datos/transporte; especificar cómo se marca vigencia y qué se muestra si la fuente falla.                                | T2, ADR de rutas del Sprint 3 | Arquitectura + PO     |
| T4  | Definir modelos de línea, parada, secuencia, servicio y alternativa; añadir validadores y contrato API si el origen de datos lo requiere.          | T3                            | API/contratos         |
| T5  | Integrar capas de transporte en mapa, detalle de línea/parada y selección de alternativas en los clientes móviles y web pública.                   | T4                            | Rutas y clientes      |
| T6  | Manejar rutas conectadas/no conectadas, tramos peatonales, alternativa no disponible y datos viejos sin presentarlos como actuales en móvil y web. | T4, T5                        | Rutas y clientes      |
| T7  | Cubrir importación/parseo, asociaciones, orden, límites, vigencia y errores con fixtures de datos autorizados o claramente sintéticos.             | T4–T6                         | Calidad               |
| T8  | Validar atribuciones, teclado/lector de pantalla, diseño adaptable, contraste, build web, builds nativos Android/iOS y documentación en la PR.     | T7                            | Calidad/documentación |
| T9  | Inspeccionar incremento y actualizar backlog con el estado observado; no crear actas retrospectivas.                                               | T8                            | Scrum Team            |

## Archivos previstos

- `apps/mobile/src/features/campus/domain/transit.ts` y `components/TransitPanel.tsx`: validación de GTFS, selección de línea/sentido, paradas, horarios y alternativa directa.
- `apps/mobile/src/features/campus/components/RoutePlanner.tsx`: selección de alternativa a pie/autobús y tramos de acceso/salida.
- `apps/mobile/src/features/campus/map/`: rutas, líneas y paradas en mapas nativo y web.
- `apps/mobile/src/features/campus/data/campus-transit.json` y `scripts/import-transit-gtfs.py`: snapshot y procedimiento de importación trazables.
- Sin cambios a API o `packages/contracts`: la fuente y el cálculo del incremento se mantienen localmente en el cliente.

## Riesgos y respuestas

| Riesgo                                            | Probabilidad / impacto | Mitigación y respuesta                                                                                                             | Seguimiento     |
| ------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Fuente no autorizada o no mantenida               | Alta / Alta            | Verificar permiso y titular antes de importar; si falta, excluir el conjunto y dejar la historia dependiente fuera del incremento. | PO + datos      |
| Horarios estáticos desactualizados                | Media / Alta           | Registrar fecha/estado y regla de caducidad; ocultar o marcar como desactualizado si vence.                                        | Transporte      |
| Datos incompletos producen alternativas engañosas | Media / Alta           | Validar conectividad, transbordos y tramos a pie; mostrar modos no disponibles y motivo.                                           | Rutas           |
| Alcance multimodal supera la evidencia            | Media / Media          | Entregar solo modos respaldados; adaptar alcance con PO sin simular datos.                                                         | Developers + PO |

## Verificación, documentación y DoD

Pruebas de dominio y contrato validarán orden de paradas, enlaces, servicios por día, metadatos, expiración y ausencia de fuente; pruebas de integración cubrirán los extremos peatonales y la comparación. La interfaz expondrá en texto qué modo se ofrece, fuente/actualización y el motivo de indisponibilidad.

El incremento actualiza historias, backlog, ADR, `data-sources.md`, guía, código y pruebas. Los horarios se presentan como estáticos con fuente y actualización; el panel enlaza a la página de incidencias EMT y aclara que UniMovil no sincroniza avisos ni ETA. La evidencia de builds y pruebas se anota en el resultado de implementación.

## Ceremonias

Las ceremonias Scrum se realizarán conforme a la metodología. `docs/meetings/` recibirá actas solo de reuniones que ocurran realmente; el resultado del Sprint se añadirá tras inspeccionar el incremento.

## Resultado de implementación local

- HU-026: el panel busca líneas por número/nombre/destino, presenta sentidos, recorridos y paradas ordenadas, consulta salidas programadas por fecha/calendario y muestra fuente, licencia y actualización.
- HU-027: el mapa y la ficha muestran ubicación, líneas y salidas programadas, permiten planificar una ruta a la parada y enlazan a la página oficial de incidencias EMT. UniMovil no copia ni sincroniza avisos operativos.
- HU-022/025: se comparan rutas peatonales y una alternativa directa de autobús cuando los horarios y tramos a pie la respaldan; se muestran duración, distancia, espera, paradas y transbordos. La bicicleta aparece como no disponible porque no hay red ciclista verificada. La preferencia «menos distancia» compara alternativas disponibles; «menos transbordos» mantiene el recorrido a pie, que no requiere cambio de línea.
- [ADR-0013](../../adr/0013-emt-gtfs-and-transit-routing.md) documenta la fuente y el alcance. HU-028 (ETA/retrasos en tiempo real) no se implementa; su endpoint requiere API key. No se incorporan claves al cliente.
- Verificación técnica local: formato, lint, TypeScript, 17 suites/58 pruebas Jest, compatibilidad de dependencias Expo, exportaciones JavaScript Android/iOS/web y prueba de navegador Chromium (1280 × 800 y 390 × 844), que comprueba búsqueda, rutas, selección de parada compartida, estado del horario y enlace oficial.
- `npm run mobile:android` compiló e instaló el APK de desarrollo y abrió la aplicación en un Pixel 6 emulado con Android 16/API 36. El arranque nativo y el mapa se inspeccionaron en pantalla; las interacciones de rutas y transporte se verificaron mediante pruebas de dominio/interfaz y la prueba de navegador.
- La CI versionada incluye instalación de Chromium y ejecución de la misma prueba tras la exportación web; no se afirma que GitHub Actions se haya ejecutado. La validación nativa iOS no se ejecuta por falta de macOS/Xcode y permanece como excepción aceptada; el bundle iOS no se presenta como build nativo.
- `npm audit --omit=optional` vuelve a detectar las cuatro vulnerabilidades moderadas transitivas en `minimatch` ya registradas en Sprint 2. La solución automática sugerida fuerza un downgrade incompatible de Expo a 52.0.49; no se aplicó ningún cambio automático y se conserva el riesgo aceptado.
- No se publicaron cambios ni se modificó el remoto, y no se añaden actas de eventos Scrum.
