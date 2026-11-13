# UniMovil

![Licencia Apache 2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)
![Android](https://img.shields.io/badge/platform-Android-3DDC84.svg)
![iOS](https://img.shields.io/badge/platform-iOS-000000.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg)

UniMovil es una aplicación móvil para facilitar los desplazamientos dentro del campus de Moncloa de la Universidad Complutense de Madrid.

La aplicación centraliza mapas, lugares, rutas, transporte, accesibilidad, avisos e incidencias de movilidad en una única plataforma.

## Objetivo

UniMovil permite a la comunidad universitaria y a sus visitantes encontrar lugares, planificar desplazamientos y conocer el estado de la movilidad del campus de forma sencilla y accesible.

La información general puede consultarse públicamente. Las cuentas registradas permiten personalizar la experiencia y participar en la comunicación de incidencias.

## Funcionalidades

- Mapa interactivo del campus con edificios, servicios, entradas y puntos de interés.
- Búsqueda y consulta detallada de lugares.
- Cálculo de rutas a pie, en bicicleta y combinadas con autobús.
- Consulta de líneas, paradas, horarios y avisos de transporte.
- Rutas y accesos adaptados para personas con movilidad reducida.
- Información sobre aparcamientos, bicicletas y otros recursos de movilidad.
- Comunicación y seguimiento de incidencias.
- Publicación de avisos sobre obras, cierres y cambios de servicio.
- Favoritos, rutas guardadas, preferencias y notificaciones.
- Gestión administrativa de contenidos, incidencias y fuentes de datos.
- Estadísticas agregadas para mejorar la movilidad del campus.

## Usuarios

| Rol                | Capacidades                                                         |
| ------------------ | ------------------------------------------------------------------- |
| Público            | Consultar mapas, lugares, rutas, transporte y avisos públicos.      |
| Usuario registrado | Gestionar favoritos, preferencias, notificaciones e incidencias.    |
| Gestor             | Mantener información de movilidad y gestionar avisos e incidencias. |
| Administrador      | Gestionar usuarios, roles, configuración y fuentes de datos.        |

El tipo de usuario —estudiante, profesor, personal o visitante— no determina automáticamente sus permisos.

## Arquitectura y tecnologías

UniMovil se organiza como un monorepo con aplicación móvil, API y paquetes compartidos:

```text
apps/mobile    Aplicación Android e iOS
apps/api       Backend y API REST
apps/admin     Panel web de gestión
packages/      Contratos, configuración y utilidades de pruebas compartidas
docs/          Documentación técnica vinculada al código
```

El stack tecnológico está formado por:

- React Native, Expo, Expo Router y TypeScript.
- Node.js, TypeScript y NestJS para el backend.
- Supabase sobre PostgreSQL con PostGIS.
- API REST documentada con OpenAPI.
- npm Workspaces para el monorepo.
- ESLint, Prettier, TypeScript estricto y pruebas automatizadas.
- GitHub Actions, Dependabot, auditoría npm, verificación de firmas, OSV-Scanner, Gitleaks y reglas de seguridad ESLint.

La aplicación móvil se comunica con el backend mediante HTTPS. La API aplica autenticación, autorización, validación y reglas de negocio; la aplicación no accede directamente a la base de datos.

## Mapas y rutas

- MapLibre React Native renderiza los mapas.
- MapTiler Cloud Free proporciona los mapas base iniciales.
- openrouteservice calcula las rutas.
- OpenStreetMap aporta datos geográficos respetando su atribución y políticas de uso.
- Los edificios, servicios, paradas y recursos específicos del campus se mantienen en la base de datos de UniMovil.

Los proveedores externos se mantienen detrás de una configuración sustituible y sus claves nunca se incluyen en el código fuente.

## Seguridad y privacidad

- Mínimo privilegio y permisos comprobados en el servidor.
- Uso de ubicación únicamente con autorización del usuario.
- Sin seguimiento continuo de ubicación por defecto.
- Datos personales e incidencias protegidos.
- Datos de prueba ficticios y sin información real.
- Secretos gestionados mediante variables de entorno y configuración segura.
- Dependencias y workflows revisados automáticamente.

## Documentación

- Documentación técnica: este repositorio, indexada en [docs/fundamentos/README.md](docs/fundamentos/README.md).
- Documentación académica y de proyecto: [UniMovil-docs](https://github.com/ddavid07/UniMovil-docs).
- Wiki operativa: [Wiki de UniMovil](https://github.com/ddavid07/UniMovil/wiki).

La documentación académica, funcional y de seguimiento —incluidos requisitos, historias de usuario, backlog, iteraciones y memoria— vive en UniMovil-docs. La Wiki ofrece orientación rápida; las decisiones técnicas y la arquitectura permanecen versionadas junto al código.

Consulta [Contribuir a UniMovil](CONTRIBUTING.md) para instalar el monorepo y ejecutar las aplicaciones y comprobaciones locales.

## Desarrollo

La aplicación móvil incorpora la exploración del campus mediante un catálogo local de solo lectura. MapLibre necesita un build nativo y configuración pública de MapTiler; consulta CONTRIBUTING para requisitos, atribución y validación. La API de lugares y la administración del catálogo pertenecen a incrementos posteriores.

Instala las dependencias, configura el cliente de mapas y crea el build de desarrollo:

```sh
npm ci
npm run build:packages
cp apps/mobile/.env.example apps/mobile/.env.local
# Configura la clave pública de cliente en el archivo local.
npm run android --workspace=@unimovil/mobile
# iOS requiere macOS y Xcode: npm run ios --workspace=@unimovil/mobile
```

`npm run dev:mobile` arranca Metro después de instalar el build nativo. API y panel se pueden ejecutar en terminales independientes con `npm run dev:api` y `npm run dev:admin`.

Consulta [Contribuir a UniMovil](CONTRIBUTING.md) para los requisitos de Node.js/npm, configuración local y comprobaciones. El equipo trabaja con ramas cortas, pull requests, revisiones y CI. La rama `main` está protegida y requiere revisión y comprobaciones automatizadas. Los cambios deben mantener la documentación y seguir Conventional Commits.

## Licencia

UniMovil se distribuye bajo la [Apache License 2.0](LICENSE).

La licencia del código no concede derechos sobre las marcas, logotipos, datos privados o servicios de la Universidad Complutense de Madrid. Las dependencias de terceros mantienen sus propias licencias.

## Equipo

UniMovil es desarrollado por un equipo universitario de cinco personas como proyecto académico para la Universidad Complutense de Madrid.
