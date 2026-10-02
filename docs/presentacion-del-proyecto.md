# Presentación y motivación de UniMovil

## Motivación del proyecto

UniMovil nace de un problema que todos los miembros de la comunidad universitaria hemos vivido:

Llegas a la parada de metro de Ciudad Universitaria, tienes clase o un trámite en 15 minutos en una facultad que no es la tuya (o en una secretaría o biblioteca), y te surge la gran duda: 

* ¿Dónde está exactamente la entrada? 
* ¿Me da tiempo a ir andando, o me sale más a cuenta esperar al autobús (como la línea G o la F) o coger una bici de BiciMAD?

Hoy en día aplicaciones genéricas como Google Maps no resuelven con suficiente detalle la movilidad dentro del campus universitario. Por eso estamos desarrollando **UniMovil**, una aplicación móvil centrada exclusivamente en la movilidad dentro de Moncloa.

---

## Enfoque mediante Historias de Usuario

Para diseñar la aplicación hemos empezado por las **Historias de Usuario**, que nos marcan qué necesita exactamente un estudiante en su día a día:

### 1. HU-013 — Buscar lugares
> **«Como estudiante, quiero escribir el nombre de un edificio, biblioteca o cafetería en un buscador, para ver exactamente en el mapa dónde está y por qué puerta se entra.»**

### 2. HU-022 — Comparar rutas con diferentes transportes
> **«Como usuario, quiero poner mi destino y comparar al momento cuánto tardo a pie, en bicicleta o en autobús, para elegir la forma más rápida de llegar.»**

---

## Arquitectura del flujo de datos

¿Cómo funciona esto por detrás en nuestro software?

1. La **aplicación móvil** recoge tu ubicación y el destino que has buscado.
2. Se lo envía a nuestro **servidor**, que consulta una **base de datos geográfica** donde tenemos registradas todas las facultades, paradas de autobús de la EMT y caminos peatonales del campus.
3. El servidor calcula los tiempos y le devuelve a tu pantalla la ruta dibujada sobre el mapa.

---

## Estado actual del proyecto

En esta fase inicial ya tenemos definidos todos los requisitos, el flujo de trabajo en el repositorio de GitHub con control de versiones, y la estructura de carpetas lista para empezar a implementar las pantallas y la búsqueda.
