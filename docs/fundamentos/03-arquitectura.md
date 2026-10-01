# 3. Arquitectura

## 3.1. Arquitectura de alto nivel

UniMovil se organizará en tres bloques principales:

```text
Aplicación móvil Android/iOS
             |
             | HTTPS / REST / JSON
             v
        API NestJS
             |
       +-----+------+
       |            |
       v            v
 Supabase         Servicios externos
 PostgreSQL/      mapas, rutas, avisos
   PostGIS
```

La aplicación móvil no accederá directamente a la base de datos. Todas las operaciones protegidas pasarán por la API.

## 3.2. Responsabilidades de la aplicación móvil

- Presentar el mapa y la información del campus.
- Gestionar navegación y estado de interfaz.
- Solicitar permisos del dispositivo.
- Mostrar rutas, lugares, transporte, avisos e incidencias.
- Mantener preferencias locales no sensibles cuando proceda.
- Enviar peticiones autenticadas a la API.
- Gestionar estados de carga, error y falta de conexión.

La aplicación móvil no decidirá por sí sola si una persona tiene permisos de gestor o administrador.

## 3.3. Responsabilidades de la API

- Autenticar y autorizar usuarios.
- Validar entradas.
- Aplicar reglas de negocio.
- Consultar y modificar PostgreSQL/PostGIS mediante Supabase y la capa de backend definida.
- Integrar proveedores externos.
- Normalizar errores y respuestas.
- Registrar actividad administrativa relevante.
- Ocultar datos privados y controlar el acceso a incidencias.

## 3.4. Módulos iniciales del backend

- Identidad y cuentas.
- Usuarios y roles.
- Lugares y puntos de interés.
- Mapas y geometrías.
- Rutas.
- Transporte y paradas.
- Accesibilidad.
- Incidencias.
- Avisos.
- Favoritos y preferencias.
- Notificaciones.
- Administración.
- Integraciones externas.
- Auditoría.

Los nombres son una organización inicial y podrán dividirse o combinarse cuando el modelo de dominio esté definido.

## 3.5. Fuentes externas

Los proveedores externos se consumirán mediante adaptadores o servicios aislados. La lógica de negocio no dependerá directamente de una SDK concreta cuando sea evitable.

Cada fuente deberá conservar:

- Identificador de la fuente.
- Fecha de consulta o importación.
- Fecha de actualización conocida.
- Estado de la fuente.
- Resultado de validación.

## 3.6. Datos geográficos

- Los puntos tendrán coordenadas válidas.
- Las rutas y zonas se almacenarán como geometrías apropiadas.
- Se documentará el sistema de referencia utilizado.
- Se distinguirán datos oficiales, importados y aportados por usuarios.
- Las rutas calculadas no se almacenarán como definitivas si dependen de datos temporales.

## 3.7. Entornos

Se prevén, como mínimo, entornos separados conceptualmente:

- Local: desarrollo individual.
- Integración: validación conjunta y datos de prueba.
- Publicación: entorno usado para demostraciones o entrega.

La topología está registrada en ADR-0009: proyectos Supabase separados por entorno y servicios de API/panel independientes; el proveedor de hosting se seleccionará al confirmar presupuesto, región y titularidad institucional. Los nombres y secretos concretos se configuran al provisionar cada entorno, no se comparten y nunca se versionan.

## 3.8. Principios arquitectónicos

- Separación de responsabilidades.
- Dependencias externas detrás de adaptadores.
- Validación en los límites del sistema.
- Mínimo privilegio.
- Trazabilidad de cambios importantes.
- Configuración por entorno.
- No almacenar secretos en el repositorio.
- Preferir soluciones simples y reversibles.
