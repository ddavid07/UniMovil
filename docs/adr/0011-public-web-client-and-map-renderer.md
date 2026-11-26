# ADR-0011: cliente web público y renderizadores cartográficos

- **Estado:** Aceptada
- **Fecha:** 2026-11-25
- **Decisores:** Equipo UniMovil
- **Relacionado con:** ADR-0002, ADR-0004, ADR-0007 y ADR-0010

## Contexto

El producto debe ofrecer los flujos públicos en web y en las aplicaciones nativas. Expo, React Native y Expo Router ya forman la base común. MapLibre React Native requiere código nativo, mientras que el navegador necesita un renderizador web y sus propios estilos. Una aplicación administrativa separada no satisface el acceso público.

## Decisión

- Mantener un único proyecto Expo con React Native Web y Expo Router para el cliente público, y generar el sitio estático con Metro.
- Mantener MapLibre React Native en Android/iOS y usar Leaflet con React Leaflet en web mediante el archivo específico `CampusMap.web.tsx`. La importación dinámica del mapa evita cargar `window` durante la generación estática.
- Compartir dominio, datos, búsqueda, filtros, ubicación opcional y componentes React Native cuando sea adecuado; permitir componentes y estilos específicos de navegador en la capa de presentación.
- La primera matriz automatizada cubre Chromium en escritorio (1280 × 800) y ventana estrecha (390 × 844), junto con exportación web. Firefox, Safari y Edge no se afirman como probados en este incremento.
- La web conserva navegación por teclado, foco visible, atribución, lista textual y controles accesibles. No requiere cuenta ni permiso de ubicación para consultar información pública.
- En web, el navegador envía su agente de usuario normal al servidor de teselas; no se suplanta ni se intenta configurar una cabecera `User-Agent`. En móvil se conserva la identificación de aplicación aprobada en ADR-0007.
- OpenStreetMap estándar sigue limitado a visualización interactiva de bajo volumen; no se precargan ni descargan teselas. Antes de un piloto o publicación se requiere elegir un proveedor adecuado.

## Alternativas consideradas

- **WebView de MapLibre React Native:** descartada porque añade una capa nativa innecesaria y no proporciona la experiencia web accesible requerida.
- **Aplicación web separada desde el primer flujo:** descartada por duplicar dominio, rutas, configuración y entrega del catálogo en esta etapa.
- **Leaflet en todas las plataformas:** descartada porque MapLibre React Native ya ofrece el mapa nativo y la lógica de producto no debe quedar atada a Leaflet.
- **Exponer directamente el componente nativo MapLibre en navegador:** descartada por su requisito de código nativo.

## Consecuencias

- `npm run web:start` sirve el cliente en desarrollo; `npm run export:web` produce la exportación estática local en `apps/mobile/dist/`.
- La CI debe exportar la web además de los bundles JavaScript Android/iOS.
- El renderizador y la interfaz de mapas tienen diferencias de plataforma y se prueban por separado; el dominio, la procedencia y los criterios funcionales se comparten.
- La comprobación Chromium no equivale a una matriz completa de navegadores, lectores de pantalla ni builds nativos.
- Este ADR no autoriza un despliegue remoto ni cambia GitHub Settings.

## Referencias

- [ADR-0010: cliente público web](0010-public-web-client.md)
- [HU-099: consultar UniMovil desde un navegador](../requirements/user-stories/09-public-web-client.md)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Leaflet](https://leafletjs.com/)
- [Política de uso de teselas de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/)
