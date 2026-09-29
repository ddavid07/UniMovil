# Funcionalidades de UniMovil

## 1. Descripción del proyecto

UniMovil será una aplicación móvil para facilitar los desplazamientos dentro del campus de Moncloa de la Universidad Complutense de Madrid (UCM), también conocido como Ciudad Universitaria.

La aplicación centralizará la información sobre lugares, rutas, transporte, accesibilidad, avisos e incidencias relacionadas con la movilidad en el campus. Estará orientada principalmente a estudiantes, profesores y personal de la universidad, pero también permitirá el acceso a visitantes y personas externas.

La información de movilidad podrá consultarse públicamente. El registro de una cuenta permitirá utilizar funcionalidades personalizadas y participar en la comunicación de incidencias.

La aplicación estará destinada a dispositivos móviles Android e iOS. El alcance de una versión para navegador se decidirá posteriormente.

## 2. Tipos de usuario

### 2.1. Visitante

- Consultar el mapa del campus.
- Buscar edificios, facultades, servicios y puntos de interés.
- Consultar rutas y medios de transporte.
- Consultar horarios y paradas de autobús disponibles.
- Consultar avisos públicos.
- Consultar información de accesibilidad.
- Registrarse como visitante para acceder a funcionalidades personalizadas.

### 2.2. Usuario de la comunidad universitaria

Incluye estudiantes, profesores, investigadores, personal de administración y servicios, y otros miembros habituales de la UCM.

- Utilizar todas las funcionalidades disponibles para usuarios registrados.
- Guardar lugares, rutas y líneas de transporte favoritas.
- Consultar el historial de búsquedas y rutas.
- Crear y consultar incidencias.
- Recibir notificaciones personalizadas.
- Configurar preferencias de movilidad y accesibilidad.

### 2.3. Gestor de movilidad

Persona encargada de revisar y mantener la información de movilidad.

- Gestionar incidencias comunicadas por los usuarios.
- Publicar avisos y cambios temporales.
- Actualizar información de rutas, paradas y lugares.
- Coordinar la información con los responsables de la universidad.
- Consultar estadísticas de uso e incidencias.

### 2.4. Administrador

- Gestionar usuarios y permisos.
- Gestionar la configuración general de la aplicación.
- Gestionar campus, edificios, puntos de interés, rutas y categorías.
- Gestionar gestores de movilidad.
- Consultar registros de actividad administrativa.
- Configurar fuentes externas e integraciones.

## 3. Registro, acceso y cuenta de usuario

- Permitir el registro de estudiantes, profesores, personal universitario, visitantes y personas externas.
- Permitir indicar el tipo de usuario durante el registro.
- Permitir iniciar y cerrar sesión.
- Permitir recuperar el acceso a la cuenta.
- Permitir modificar los datos básicos del perfil.
- Permitir cambiar la contraseña.
- Permitir eliminar la cuenta.
- Permitir cerrar temporalmente la cuenta sin eliminar sus datos cuando corresponda.
- Diferenciar los permisos según el tipo de cuenta y el rol asignado.
- Permitir consultar información pública sin crear una cuenta cuando la funcionalidad no requiera personalización.
- Solicitar permiso para utilizar la ubicación del dispositivo.
- Permitir utilizar la aplicación sin compartir la ubicación de forma permanente.
- Informar claramente de los permisos solicitados y del uso de los datos.

## 4. Mapa del campus de Moncloa

- Mostrar un mapa interactivo del campus.
- Mostrar los límites y las zonas principales del campus.
- Mostrar edificios, facultades, escuelas, centros de investigación y residencias.
- Mostrar entradas y salidas de los edificios.
- Mostrar calles, caminos peatonales y zonas de paso.
- Mostrar paradas y recorridos de autobús.
- Mostrar aparcamientos y zonas de estacionamiento.
- Mostrar aparcamientos de bicicletas y otros recursos de movilidad.
- Mostrar puntos de interés y servicios universitarios.
- Mostrar la posición actual del usuario cuando conceda permiso de ubicación.
- Permitir ampliar, reducir y desplazar el mapa.
- Permitir cambiar entre distintos niveles de información del mapa.
- Permitir activar y desactivar categorías de elementos.
- Destacar temporalmente zonas cerradas, obras, desvíos o accesos restringidos.
- Mostrar información contextual al seleccionar un elemento del mapa.
- Permitir centrar el mapa en la posición actual del usuario.
- Mostrar una leyenda con los símbolos utilizados.

## 5. Búsqueda y consulta de lugares

- Buscar por nombre de edificio, facultad, centro, servicio o punto de interés.
- Buscar por categorías.
- Buscar por dirección o ubicación aproximada.
- Mostrar resultados ordenados por proximidad o relevancia.
- Mostrar sugerencias mientras el usuario escribe.
- Mostrar el resultado seleccionado en el mapa.
- Mostrar la ficha detallada de cada lugar.
- Mostrar nombre, descripción, ubicación y horarios cuando estén disponibles.
- Mostrar entradas accesibles y restricciones de acceso.
- Mostrar servicios disponibles en cada edificio.
- Mostrar fotografías o recursos visuales cuando existan.
- Mostrar información de contacto institucional cuando sea pública.
- Mostrar enlaces a páginas oficiales de la UCM cuando corresponda.
- Permitir guardar un lugar como favorito.
- Permitir compartir la ubicación o la ficha de un lugar.

## 6. Puntos de interés y servicios

La aplicación permitirá consultar, entre otros, los siguientes tipos de puntos:

- Facultades y escuelas.
- Aulas y espacios docentes.
- Bibliotecas.
- Secretarías y oficinas de atención.
- Cafeterías y comedores.
- Servicios médicos y de atención.
- Instalaciones deportivas.
- Residencias y colegios mayores.
- Salones de actos y espacios culturales.
- Zonas de estudio.
- Baños.
- Cajeros y servicios de pago cuando proceda.
- Papelerías y reprografía.
- Aparcamientos.
- Aparcamientos de bicicletas.
- Puntos de carga para vehículos eléctricos.
- Paradas de autobús.
- Entradas accesibles.
- Puntos de información.
- Puntos de encuentro y zonas relevantes para visitantes.

Las categorías deberán poder ampliarse o modificarse desde el área de administración.

## 7. Planificación de rutas

- Permitir seleccionar un origen y un destino.
- Permitir utilizar la posición actual como origen.
- Permitir seleccionar lugares del mapa como origen o destino.
- Permitir buscar origen y destino por texto.
- Calcular rutas dentro del campus de Moncloa.
- Mostrar rutas a pie.
- Mostrar rutas en bicicleta cuando existan caminos adecuados.
- Mostrar rutas utilizando autobús y desplazamiento a pie.
- Mostrar rutas combinadas entre distintos medios de transporte.
- Mostrar rutas adaptadas para personas con movilidad reducida.
- Mostrar rutas alternativas.
- Mostrar distancia estimada.
- Mostrar duración estimada.
- Mostrar indicaciones paso a paso.
- Mostrar los puntos de transporte utilizados durante la ruta.
- Mostrar cambios de línea o transbordos cuando correspondan.
- Mostrar obstáculos, cierres y restricciones conocidos.
- Permitir guardar una ruta como favorita.
- Permitir compartir una ruta.
- Permitir consultar rutas recientes.
- Actualizar las rutas cuando cambien las condiciones conocidas del campus.
- Permitir elegir preferencias, como la ruta más rápida, más accesible o con menos transbordos.

## 8. Transporte público y autobuses

La aplicación mostrará los servicios de autobús que recorren el campus cuando la información esté disponible mediante fuentes oficiales o datos públicos fiables.

- Mostrar las líneas que pasan por el campus de Moncloa.
- Mostrar el recorrido de cada línea.
- Mostrar todas las paradas.
- Mostrar la ubicación de las paradas en el mapa.
- Mostrar los horarios programados.
- Mostrar los días de servicio.
- Diferenciar días lectivos, fines de semana y festivos cuando sea necesario.
- Mostrar el tiempo estimado hasta el siguiente autobús cuando exista información en tiempo real.
- Mostrar incidencias, retrasos, cancelaciones y cambios de recorrido.
- Mostrar información de accesibilidad de las paradas y vehículos cuando esté disponible.
- Permitir consultar las líneas cercanas a la posición del usuario.
- Permitir buscar una línea o una parada.
- Permitir guardar líneas y paradas como favoritas.
- Permitir recibir avisos sobre líneas favoritas.
- Integrar información en tiempo real cuando la fuente de datos lo permita.
- Indicar la fecha de actualización de los horarios y datos.
- Enlazar con la información oficial del operador cuando corresponda.

## 9. Aparcamiento y estacionamiento

- Mostrar aparcamientos del campus y sus ubicaciones.
- Mostrar los accesos a cada aparcamiento.
- Mostrar horarios y condiciones de uso.
- Indicar si el acceso es público, restringido o requiere autorización.
- Mostrar plazas reservadas para personas con movilidad reducida.
- Mostrar zonas de carga y descarga.
- Mostrar información de aparcamiento para bicicletas.
- Mostrar puntos de carga para vehículos eléctricos.
- Mostrar disponibilidad de plazas cuando exista información fiable.
- Mostrar restricciones temporales de acceso.
- Permitir guardar aparcamientos como favoritos.
- Calcular rutas hasta un aparcamiento.
- Mostrar normas y recomendaciones de estacionamiento.

## 10. Bicicletas, patinetes y movilidad personal

- Mostrar aparcamientos y anclajes para bicicletas.
- Mostrar zonas autorizadas para bicicletas y otros vehículos personales.
- Mostrar estaciones de bicicleta compartida cuando existan.
- Mostrar disponibilidad de bicicletas o espacios cuando exista información en tiempo real.
- Mostrar puntos de reparación o mantenimiento.
- Mostrar puntos de carga autorizados.
- Mostrar rutas recomendadas para bicicletas.
- Mostrar normas de circulación y estacionamiento dentro del campus.
- Permitir consultar rutas evitando zonas no autorizadas.
- Permitir informar de aparcamientos o infraestructuras dañadas.

## 11. Accesibilidad y movilidad adaptada

- Identificar edificios y accesos accesibles.
- Mostrar rampas, ascensores y entradas adaptadas.
- Permitir calcular rutas evitando escaleras.
- Permitir calcular rutas adaptadas a sillas de ruedas.
- Informar de pendientes, obstáculos y superficies irregulares cuando los datos existan.
- Informar de ascensores o accesos temporalmente fuera de servicio.
- Mostrar paradas y vehículos accesibles cuando la información esté disponible.
- Permitir configurar preferencias de accesibilidad.
- Aplicar las preferencias de accesibilidad a las rutas y resultados.
- Utilizar textos, iconos y colores comprensibles y accesibles.
- Permitir consultar la información sin depender exclusivamente del mapa visual.

## 12. Incidencias, problemas y sugerencias

- Permitir a usuarios registrados comunicar una incidencia.
- Seleccionar una categoría de incidencia.
- Escribir una descripción.
- Indicar la ubicación en el mapa.
- Utilizar la ubicación actual para registrar el lugar.
- Adjuntar fotografías.
- Indicar el nivel de urgencia percibido.
- Consultar las incidencias públicas de una zona.
- Consultar el estado de las incidencias propias.
- Recibir actualizaciones sobre las incidencias comunicadas.
- Permitir retirar o corregir una comunicación antes de su revisión.
- Permitir valorar si una incidencia sigue presente.
- Permitir enviar sugerencias de mejora.
- Evitar la publicación de datos personales innecesarios.
- Permitir moderar contenidos inapropiados o duplicados.

Los gestores podrán:

- Revisar nuevas incidencias.
- Solicitar información adicional.
- Clasificar y priorizar incidencias.
- Marcar una incidencia como duplicada.
- Asignar una incidencia a un responsable.
- Cambiar su estado.
- Añadir comentarios internos.
- Publicar respuestas visibles para el usuario.
- Adjuntar información sobre la resolución.
- Marcar una incidencia como resuelta.
- Reabrir una incidencia si vuelve a producirse.
- Consultar el historial de cambios.

## 13. Avisos y comunicaciones

- Mostrar avisos generales del campus.
- Mostrar cierres temporales de edificios o caminos.
- Mostrar obras y desvíos.
- Mostrar cambios de horarios.
- Mostrar interrupciones de líneas de autobús.
- Mostrar cambios temporales en accesos y aparcamientos.
- Mostrar alertas relacionadas con la movilidad.
- Clasificar los avisos por tipo y prioridad.
- Indicar fecha de publicación y vigencia.
- Permitir consultar avisos activos y anteriores.
- Permitir buscar avisos.
- Permitir guardar avisos relevantes.
- Permitir compartir avisos públicos.

Los gestores podrán:

- Crear, editar y retirar avisos.
- Programar la publicación y caducidad de un aviso.
- Asociar un aviso a una zona, edificio, línea o parada.
- Definir su prioridad.
- Adjuntar enlaces, imágenes o documentación pública.
- Enviar notificaciones relacionadas con el aviso.

## 14. Notificaciones

- Enviar notificaciones sobre incidencias y avisos relevantes.
- Enviar notificaciones sobre cambios en líneas o paradas favoritas.
- Enviar notificaciones sobre rutas guardadas cuando exista una alteración importante.
- Notificar cambios de estado de incidencias propias.
- Permitir activar y desactivar categorías de notificaciones.
- Permitir configurar horarios de silencio.
- Evitar notificaciones duplicadas.
- Mostrar un historial de notificaciones recibidas.
- Permitir abrir directamente el aviso o incidencia relacionado.

## 15. Personalización del usuario

- Guardar lugares favoritos.
- Guardar líneas y paradas favoritas.
- Guardar aparcamientos y puntos de interés favoritos.
- Guardar rutas habituales.
- Consultar búsquedas recientes.
- Consultar rutas recientes.
- Configurar el medio de transporte preferido.
- Configurar preferencias de accesibilidad.
- Configurar campus o zona de inicio, aunque actualmente el alcance sea Moncloa.
- Configurar idioma de la aplicación.
- Configurar unidades de distancia y tiempo.
- Gestionar permisos de ubicación y notificaciones.
- Sincronizar preferencias entre dispositivos.

## 16. Área de administración y gestión de contenidos

- Gestionar usuarios.
- Gestionar roles y permisos.
- Gestionar edificios y facultades.
- Gestionar entradas y accesos.
- Gestionar puntos de interés.
- Gestionar categorías.
- Gestionar paradas y líneas de autobús.
- Gestionar horarios.
- Gestionar aparcamientos y recursos de movilidad.
- Gestionar información de accesibilidad.
- Gestionar cierres, obras y zonas restringidas.
- Gestionar avisos.
- Gestionar incidencias.
- Gestionar fotografías y recursos asociados.
- Importar datos desde fuentes externas.
- Exportar información para su revisión o mantenimiento.
- Consultar cuándo se actualizó cada dato.
- Consultar quién modificó un dato.
- Recuperar versiones anteriores de información importante.
- Activar o desactivar temporalmente contenidos.
- Configurar fuentes de datos y frecuencias de actualización.

## 17. Estadísticas y análisis

- Consultar el número de usuarios registrados.
- Consultar usuarios activos.
- Consultar búsquedas más frecuentes.
- Consultar lugares más consultados.
- Consultar rutas más utilizadas.
- Consultar medios de transporte seleccionados.
- Consultar líneas y paradas más consultadas.
- Consultar número de incidencias por categoría.
- Consultar incidencias por zona.
- Consultar tiempos de resolución.
- Consultar avisos con mayor alcance.
- Consultar errores o fallos de actualización de datos.
- Filtrar estadísticas por periodos de tiempo.
- Exportar informes.
- Mostrar los datos de forma agregada y respetando la privacidad de los usuarios.

## 18. Integraciones y fuentes de información

- Integrar mapas y datos geográficos.
- Integrar datos oficiales de la UCM.
- Integrar información pública de las líneas de autobús.
- Integrar horarios estáticos.
- Integrar datos de transporte en tiempo real cuando estén disponibles.
- Integrar información de accesibilidad.
- Integrar sistemas de autenticación institucional si la UCM los proporciona.
- Integrar servicios de notificaciones móviles.
- Integrar servicios de geolocalización del dispositivo.
- Detectar errores o interrupciones en las fuentes externas.
- Mostrar la procedencia y fecha de actualización de los datos.
- Permitir sustituir una fuente externa por otra sin modificar la funcionalidad visible para el usuario.

## 19. Seguridad, privacidad y control de datos

- Proteger las cuentas de usuario.
- Controlar el acceso mediante roles y permisos.
- Solicitar consentimiento para utilizar la ubicación.
- No realizar seguimiento continuo de la ubicación por defecto.
- Permitir retirar permisos desde la aplicación.
- Recoger únicamente los datos necesarios.
- Proteger fotografías, incidencias y datos personales.
- Permitir consultar y modificar los datos personales almacenados.
- Permitir solicitar la eliminación de los datos personales.
- Registrar las acciones administrativas relevantes.
- Evitar mostrar información personal de los autores de incidencias salvo que sea necesario.
- Aplicar medidas para impedir abuso, spam y comunicaciones maliciosas.
- Informar sobre la política de privacidad y las condiciones de uso.

## 20. Experiencia de uso y soporte

- Mostrar una introducción inicial a las funciones principales.
- Permitir utilizar la aplicación con una conexión de red inestable cuando sea posible.
- Mostrar estados de carga, error y ausencia de resultados.
- Informar cuando los datos estén desactualizados.
- Permitir reintentar operaciones fallidas.
- Mostrar mensajes de error comprensibles.
- Proporcionar una sección de ayuda.
- Proporcionar preguntas frecuentes.
- Permitir contactar con el equipo responsable.
- Permitir comunicar errores de la aplicación.
- Mostrar la versión instalada.
- Informar de cambios relevantes en nuevas versiones.
- Mantener un diseño coherente entre Android y iOS.
- Adaptar la interfaz a distintos tamaños y orientaciones de pantalla.
