# UniMovil

![Licencia Apache 2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)
![Android](https://img.shields.io/badge/platform-Android-3DDC84.svg)
![iOS](https://img.shields.io/badge/platform-iOS-000000.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg)

UniMovil es una aplicación móvil para facilitar los desplazamientos dentro del campus de Moncloa de la Universidad Complutense de Madrid, también conocido como Ciudad Universitaria.

La plataforma reúne en un único lugar la información necesaria para orientarse por el campus, localizar edificios y servicios, planificar rutas, consultar el transporte disponible, conocer las condiciones de accesibilidad y comunicar incidencias relacionadas con la movilidad.

## Objetivo

UniMovil ayuda a estudiantes, profesores, personal universitario, visitantes y personas externas a responder rápidamente a las preguntas fundamentales de cualquier desplazamiento por el campus:

- ¿Dónde estoy?
- ¿Dónde está el lugar al que necesito llegar?
- ¿Cuál es la mejor forma de llegar?
- ¿Qué transporte y recursos de movilidad están disponibles?
- ¿Existe alguna incidencia, obra o restricción en el recorrido?
- ¿Cómo puedo comunicar un problema?

La información general de movilidad puede consultarse públicamente. Las cuentas registradas permiten personalizar la experiencia y participar en el sistema de incidencias.

## Funcionalidades principales

### Mapa y lugares

- Mapa interactivo del campus de Moncloa.
- Edificios, facultades, escuelas y centros universitarios.
- Entradas, salidas y accesos relevantes.
- Servicios, bibliotecas, cafeterías, instalaciones y puntos de interés.
- Búsqueda por nombre, categoría o ubicación.
- Filtros de categorías y capas del mapa.
- Fichas detalladas de lugares.
- Cierres, obras y restricciones temporales.

### Rutas y transporte

- Cálculo de rutas a pie y en bicicleta.
- Rutas combinadas con autobús y desplazamientos a pie.
- Distancias, tiempos estimados e indicaciones paso a paso.
- Rutas alternativas.
- Preferencias por rapidez, accesibilidad o número de transbordos.
- Líneas, paradas, recorridos y horarios de autobús.
- Información de retrasos, cancelaciones y llegadas cuando exista una fuente en tiempo real.
- Rutas y trayectos favoritos.

### Accesibilidad y recursos de movilidad

- Rutas que evitan escaleras y obstáculos conocidos.
- Ascensores, rampas y entradas adaptadas.
- Información sobre accesibilidad de edificios y paradas.
- Aparcamientos y plazas reservadas.
- Aparcamientos de bicicletas y recursos para movilidad personal.
- Puntos de carga y mantenimiento cuando estén disponibles.

### Incidencias y avisos

- Comunicación de problemas de movilidad.
- Ubicación, categoría, descripción y fotografías de una incidencia.
- Seguimiento del estado de las incidencias propias.
- Consulta de incidencias públicas autorizadas.
- Avisos sobre obras, cierres, cambios de horario y alteraciones del transporte.
- Gestión de incidencias y comunicaciones por parte de responsables autorizados.

### Personalización

- Registro para estudiantes, profesores, personal, visitantes y personas externas.
- Favoritos de lugares, paradas, líneas y rutas.
- Historial de búsquedas y rutas.
- Preferencias de transporte y accesibilidad.
- Notificaciones sobre avisos, incidencias y recursos favoritos.
- Configuración de permisos de ubicación y notificaciones.

### Administración y análisis

- Gestión de edificios, lugares, categorías y recursos.
- Gestión de líneas, paradas, recorridos y horarios.
- Mantenimiento de la información de accesibilidad.
- Publicación y retirada de avisos.
- Revisión, clasificación y resolución de incidencias.
- Importación y actualización de fuentes externas.
- Estadísticas agregadas de uso y movilidad.
- Auditoría de cambios administrativos.

## Usuarios y permisos

UniMovil utiliza un modelo de permisos sencillo:

| Rol | Capacidades principales |
| --- | --- |
| Público | Consultar mapas, lugares, rutas, transporte, accesibilidad y avisos públicos. |
| Usuario registrado | Utilizar personalización, favoritos, historial, notificaciones e incidencias. |
| Gestor | Mantener información de movilidad, revisar incidencias y publicar avisos. |
| Administrador | Gestionar usuarios, roles, configuración, fuentes y permisos globales. |

La relación de una persona con la universidad —estudiante, profesor, trabajador o visitante— se almacena como información de perfil y no determina automáticamente sus permisos.

## Construcción del sistema

UniMovil se organiza como un monorepo con una aplicación móvil, una API y paquetes compartidos:

```text
apps/
  mobile/       Aplicación Android e iOS
  api/          Backend y API REST
  admin/        Herramientas de gestión, cuando corresponda

packages/
  contracts/    Contratos y esquemas compartidos
  config/       Configuración común
  ui/           Componentes reutilizables

docs/           Funcionalidades, historias y decisiones técnicas
scripts/        Automatización y herramientas del proyecto
```

La aplicación móvil nunca accede directamente a la base de datos. La comunicación se realiza mediante una API REST sobre HTTPS, que aplica autenticación, autorización, validación, reglas de negocio y control de errores.

## Stack tecnológico

- **Aplicación móvil:** React Native, Expo, Expo Router y TypeScript.
- **Backend:** Node.js, TypeScript y NestJS.
- **Base de datos:** Supabase sobre PostgreSQL con PostGIS.
- **API:** REST, JSON y OpenAPI.
- **Mapas móviles:** MapLibre React Native.
- **Mapas base:** MapTiler Cloud Free.
- **Rutas:** openrouteservice.
- **Datos geográficos:** OpenStreetMap y datos propios del campus.
- **Gestión de paquetes:** npm y npm Workspaces.
- **Calidad:** ESLint, Prettier, TypeScript estricto y pruebas automatizadas.
- **Automatización:** GitHub Actions, Dependabot, CodeQL, secret scanning y OpenSSF Scorecard.

## Mapas y datos geográficos

MapLibre se utiliza para renderizar mapas sin acoplar la aplicación a un proveedor concreto. MapTiler proporciona inicialmente los mapas base y los estilos dentro de sus límites de uso gratuito.

openrouteservice se utiliza para calcular rutas a pie, en bicicleta y adaptadas. Los edificios, servicios, paradas, accesos y recursos específicos del campus se mantienen en la base de datos de UniMovil para poder controlar su calidad y actualización.

OpenStreetMap se utiliza respetando sus condiciones de atribución y sus políticas de uso. Las claves de los proveedores externos se gestionan mediante configuración segura y nunca se incluyen en el código fuente.

## Seguridad y privacidad

UniMovil aplica los siguientes principios:

- Mínimo privilegio y permisos comprobados en el servidor.
- Información pública separada de datos personales.
- Ubicación utilizada únicamente con autorización del usuario.
- Sin seguimiento continuo de ubicación por defecto.
- No se almacenan secretos en el repositorio.
- Datos de prueba ficticios y sin información personal real.
- Incidencias y fotografías protegidas y moderables.
- Dependencias y workflows revisados automáticamente.
- Registro de acciones administrativas relevantes.

## Documentación

La documentación del proyecto se encuentra en [`docs/`](docs/):

- [Funcionalidades](docs/funcionalidades.md): catálogo completo de capacidades del producto.
- [Historias de usuario](docs/historias-de-usuario/README.md): historias, criterios de aceptación y reglas de negocio.
- [Fundamentos del proyecto](docs/fundamentos/README.md): decisiones de producto, arquitectura, tecnología, GitHub, seguridad y estándares.
- [ADRs](docs/fundamentos/adr/README.md): decisiones técnicas importantes y sus alternativas.

## Desarrollo y calidad

El proyecto utiliza una estrategia basada en ramas cortas y pull requests. La rama `main` se protege mediante revisiones y comprobaciones automáticas.

Los cambios deben:

- Relacionarse con una historia de usuario, requisito, incidencia o decisión.
- Pasar formato, lint, comprobación de tipos, pruebas y build.
- Mantener actualizada la documentación afectada.
- Evitar secretos, datos personales y dependencias sin revisar.
- Seguir Conventional Commits.

Las acciones de GitHub utilizan permisos mínimos, dependencias fijadas y comprobaciones de seguridad para proteger el código y la cadena de suministro.

## Licencia

UniMovil se distribuye bajo la [Apache License 2.0](LICENSE).

La licencia del código no concede derechos sobre las marcas, logotipos, datos privados o servicios de la Universidad Complutense de Madrid. Las dependencias de terceros mantienen sus propias licencias y condiciones.

## Equipo

UniMovil es desarrollado por un equipo universitario de cinco personas como proyecto académico para la Universidad Complutense de Madrid.
