# 1. Fundamentos del producto

## 1.1. Propósito

UniMovil es una plataforma para facilitar los desplazamientos dentro del campus de Moncloa de la Universidad Complutense de Madrid, también conocido como Ciudad Universitaria.

La aplicación centralizará información sobre lugares, rutas, transporte, accesibilidad, avisos e incidencias de movilidad.

## 1.2. Alcance geográfico

- Universidad Complutense de Madrid.
- Campus de Moncloa.
- Desplazamientos dentro del campus y sus accesos inmediatos relacionados con la movilidad universitaria.
- Información de autobuses y otros medios que recorran el campus cuando existan fuentes fiables.

No se define como objetivo inicial gestionar movilidad académica, como Erasmus, intercambios o traslados administrativos.

## 1.3. Usuarios y roles

### Público

Puede consultar mapa, lugares, rutas, transporte, accesibilidad y avisos públicos sin iniciar sesión.

### Usuario registrado

Puede guardar favoritos, rutas y preferencias, recibir notificaciones y crear o consultar sus incidencias.

El registro estará abierto a estudiantes, profesores, personal universitario, visitantes y personas externas. El tipo de relación con la universidad será un dato de perfil, no un rol de autorización.

### Gestor

Puede revisar incidencias, actualizar información de movilidad y publicar avisos.

### Administrador

Puede gestionar usuarios, roles, configuración, fuentes de datos y permisos globales.

## 1.4. Principios de producto

- La información pública debe ser consultable sin crear una cuenta.
- La aplicación debe ser útil para una persona que no conozca el campus.
- La accesibilidad será una característica funcional, no una adaptación posterior.
- La ubicación del usuario no se almacenará de forma continua por defecto.
- Los datos externos deben mostrar su procedencia y fecha de actualización.
- Las incidencias deben tener seguimiento y estados comprensibles.
- Las funciones administrativas estarán separadas de la consulta pública.
- Se evitará depender de un único proveedor externo cuando sea razonable.

## 1.5. Plataformas

- Plataforma principal: aplicación móvil para Android e iOS.
- El backend y la API serán independientes de la plataforma móvil.
- La posibilidad de ejecutar una versión web se mantiene abierta gracias a la elección de Expo, pero no se considera una decisión cerrada de producto.
- El panel de gestión podrá ser web si el equipo confirma que es la opción más adecuada para los gestores.

## 1.6. Documentos funcionales relacionados

- `docs/fundamentos/funcionalidades.md` contiene el catálogo de funcionalidades.
- `docs/historias-de-usuario/` contiene las historias de usuario, criterios de aceptación y reglas de negocio.
