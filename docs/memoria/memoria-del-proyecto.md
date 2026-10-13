# Memoria del Proyecto: UniMovil

**Plataforma Integral de Movilidad y Orientación para el Campus de Moncloa**

---

* **Asignatura:** Ingeniería del Software I
* **Titulación:** Doble Grado en Ingeniería Informática y Matemáticas
* **Centro:** Facultad de Informática, Universidad Complutense de Madrid (UCM)
* **Curso Académico:** 2026/2027
* **Autores:** 
  * Naoufal Kebli 
  * Daniel David 
  * Pablo Palacios 
  * Pedro Cespón 
  * Charlie Fox
* **Profesor / Tutor:** D. Gonzalo Méndez
* **Repositorio oficial:** [github.com/ddavid07/UniMovil](https://github.com/ddavid07/UniMovil)

---

## Índice de Contenidos

1. [Introducción y Motivación](#1-introducción-y-motivación)
   * 1.1. Contexto y problema detectado
   * 1.2. Objetivos del sistema
   * 1.3. Alcance del proyecto
2. [Metodología de Desarrollo y Proceso Software](#2-metodología-de-desarrollo-y-proceso-software)
   * 2.1. Justificación del modelo ágil e incremental
   * 2.2. Roles del equipo Scrum
   * 2.3. Eventos y ciclo de los Sprints
   * 2.4. Definición de Terminado (*Definition of Done - DoD*)
3. [Gestión de Riesgos — Plan RSGR (Barry Boehm)](#3-gestión-de-riesgos--plan-rsgr-barry-boehm)
   * 3.1. Identificación y tipología de riesgos
   * 3.2. Evaluación de probabilidad y severidad (SQAS-SEI)
   * 3.3. Priorización y regla de Pareto 80-20
   * 3.4. Fichas de Reducción, Supervisión y Gestión
4. [Especificación de Requisitos y Gestión del Backlog](#4-especificación-de-requisitos-y-gestión-del-backlog)
   * 4.1. Perfiles de usuario y actores
   * 4.2. Priorización MoSCoW y definición del MVP
   * 4.3. Catálogo de Historias de Usuario principales
   * 4.4. Estimación del esfuerzo (Story Points y escala de Fibonacci)
5. [Arquitectura y Diseño del Sistema](#5-arquitectura-y-diseño-del-sistema)
   * 5.1. Organización Monorepo y contratos compartidos
   * 5.2. Capa de presentación móvil (React Native + Expo Router)
   * 5.3. Capa de servicios y lógica de negocio (NestJS REST API)
   * 5.4. Capa de persistencia y cartografía (PostgreSQL + PostGIS)
6. [Registro de Sprints e Incrementos de Producto](#6-registro-de-sprints-e-incrementos-de-producto)
   * 6.1. Sprint 0: Fundaciones de ingeniería y pipeline de CI/CD
   * 6.2. Sprint 1: Núcleo del MVP (Contratos, API y Buscador móvil)
7. [Conclusiones y Trabajo Futuro](#7-conclusiones-y-trabajo-futuro)

---

## 1. Introducción y Motivación

### 1.1. Contexto y problema detectado
El campus de Moncloa de la Universidad Complutense de Madrid constituye uno de los recintos universitarios más extensos y concurridos de España. Alberga más de una veintena de facultades, centros de investigación, bibliotecas históricas, instalaciones deportivas y una red compleja de viales, sendas peatonales y paradas de transporte público (Metro y autobuses de la EMT).

A pesar de esta envergadura, la comunidad universitaria (especialmente estudiantes de nuevo ingreso, visitantes de congresos y opositores) se enfrenta cotidianamente a importantes barreras de orientación:
* **Falta de granularidad en herramientas genéricas:** Aplicaciones comerciales como Google Maps o Apple Maps ubican los edificios a nivel genérico, pero no indican por qué puerta se accede, qué desniveles existen o si un acceso peatonal está cortado por obras.
* **Carencia de información de accesibilidad:** Las personas con movilidad reducida (PMR) carecen de antemano de un mapa fiable que garantice itinerarios sin escaleras, con rampas homologadas o ascensores operativos.
* **Dispersión en el transporte multimodal:** Dificultad para comparar en tiempo real si resulta más eficiente caminar o esperar a las líneas internas de autobuses universitarios (como las líneas G o F de la EMT).

### 1.2. Objetivos del sistema
* **Objetivo General:** Diseñar, desarrollar y desplegar **UniMovil**, una plataforma integral de movilidad y orientación geográfica centrada en el campus de Moncloa de la UCM.
* **Objetivos Específicos:**
  1. Proveer un mapa interactivo enriquecido con los puntos de interés universitarios.
  2. Implementar un buscador predictivo que localice edificios, secretarías, bibliotecas y cafeterías.
  3. Calcular rutas peatonales adaptadas, permitiendo activar filtros estrictos de accesibilidad PMR.
  4. Habilitar un canal de avisos en tiempo real sobre obras, desvíos e incidencias de movilidad.
  5. Proporcionar un panel web de administración para que los gestores universitarios mantengan la información cartográfica actualizada.

### 1.3. Alcance del proyecto
* **Dentro del alcance (In Scope):** Aplicación móvil multiplataforma (Android e iOS), servidor backend con API REST documentada, base de datos con soporte geoespacial, catálogo de puntos de interés de Moncloa y sistema de gestión de incidencias.
* **Fuera del alcance (Out of Scope):** Navegación en interiores de aulas planta por planta (*indoor mapping* avanzado), pasarelas de pago y reservas comerciales.

---

## 2. Metodología de Desarrollo y Proceso Software

### 2.1. Justificación del modelo ágil e incremental
Frente a los modelos clásicos en cascada (*Waterfall*), donde los requisitos se congelan al inicio y cualquier cambio tardío resulta letal para el coste y el cronograma, el equipo ha adoptado un **modelo de proceso ágil e incremental fundamentado en Scrum e integrado con Kanban**.

Esta decisión se apoya en los principios fundamentales de la Ingeniería del Software:
* **Naturaleza evolutiva del software:** Los requisitos de movilidad y las fuentes de datos del campus son dinámicos.
* **Entrega continua de valor:** Cada Sprint produce un *Incremento de producto potencialmente desplegable* que puede ser evaluado por los usuarios y profesores.
* **Transparencia e inspección:** La combinación de revisiones periódicas y un tablero Kanban permite monitorizar el flujo de trabajo y limitar el trabajo en curso (*Work In Progress - WIP*).

### 2.2. Roles del equipo Scrum
* **Product Owner:** Responsable de maximizar el valor del producto, priorizar el *Product Backlog* y velar por el cumplimiento de las necesidades de los usuarios universitarios.
* **Scrum Master:** Líder al servicio del equipo, encargado de asegurar la adopción de las prácticas ágiles, eliminar impedimentos técnicos y moderar las ceremonias.
* **Equipo de Desarrollo (Development Team):** Equipo multifuncional y autoorganizado responsable del diseño, codificación, pruebas y aseguramiento de la calidad de los incrementos.

### 2.3. Eventos y ciclo de los Sprints
El proyecto se estructura en **Sprints de 2 a 3 semanas de duración fija**:
1. **Sprint Planning:** Selección de historias de usuario del *Product Backlog* para conformar el *Sprint Backlog*, fijando un *Sprint Goal* concreto.
2. **Daily Scrum:** Reuniones de sincronización diaria orientadas al flujo de trabajo frente al tablero Kanban.
3. **Sprint Review:** Demostración del incremento funcional terminado a las partes interesadas.
4. **Sprint Retrospective:** Inspección interna del equipo sobre personas, procesos y herramientas para aplicar mejoras en el siguiente ciclo.

### 2.4. Definición de Terminado (*Definition of Done - DoD*)
Una Historia de Usuario se considera estrictamente "Terminada" (*Done*) únicamente si satisface:
* Código escrito en TypeScript estricto, sin advertencias de linting (ESLint) y con formato automático (Prettier).
* Pruebas unitarias implementadas y superadas en el pipeline de Integración Continua (`ci.yml`).
* Integración mediante Pull Request revisada y aprobada por un compañero de equipo en GitHub.
* Documentación y contratos de API actualizados en `@unimovil/contracts`.

---

## 3. Gestión de Riesgos — Plan RSGR (Barry Boehm)

Siguiendo el modelo de gestión proactiva del riesgo propuesto por **Barry Boehm** y las directrices del **Software Engineering Institute (SEI)**, el equipo elaboró un Plan de Reducción, Supervisión y Gestión del Riesgo (RSGR).

### 3.1. Identificación y análisis
Se identificaron los riesgos potenciales técnicos y de proyecto que amenazan la calidad y el cronograma del sistema:

| ID | Riesgo Identificado | Tipo de Riesgo | Probabilidad | Severidad | Nivel SQAS-SEI |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **R1** | Falta de experiencia previa con frameworks móviles (React Native / Expo) | Técnico | Probable | Serious | **High (H)** |
| **R2** | Retrasos en la disponibilidad de APIs de rutas o mapas externos | Técnico | Occasional | Serious | **Medium (M)** |
| **R3** | Desincronización de formatos de datos entre la app móvil y el servidor | Técnico | Probable | Critical | **Intolerable (IN)** |
| **R4** | Errores en la coordinación del control de versiones en Git y conflictos en `main` | Proyecto | Occasional | Minor | **Low (L)** |
| **R5** | Complejidad imprevista en el cálculo de rutas sin escaleras (accesibilidad) | Técnico | Occasional | Critical | **High (H)** |

### 3.2. Priorización (Regla de Pareto 80-20)
Aplicando el principio de Pareto, el equipo focaliza sus recursos de mitigación en el 20% de los riesgos que generan el 80% del impacto: **R1 (Curva de aprendizaje móvil)** y **R3 (Desincronización de contratos API-Móvil)**.

### 3.3. Fichas de gestión de riesgos prioritarios

#### Ficha del Riesgo R3: Desincronización de contratos de datos
* **Reducción (Mitigación preventiva):** Creación del paquete compartido `@unimovil/contracts` en la arquitectura monorepo. Todos los tipos de TypeScript se definen en un único punto canónico consumido por la API y la App móvil.
* **Supervisión:** Comprobaciones automáticas de tipado (`tsc --noEmit`) en las Pull Requests mediante GitHub Actions.
* **Gestión (Plan de contingencia):** En caso de incoherencia, revertir al contrato previo versionado en npm workspaces y bloquear despliegues hasta sincronización.

#### Ficha del Riesgo R1: Curva de aprendizaje de tecnología móvil
* **Reducción:** Uso de Expo Router sobre React Native, simplificando la navegación mediante rutas de sistema de archivos estándar y eliminando configuraciones nativas complejas en Gradle y Xcode.
* **Supervisión:** Prototipado rápido y validación periódica con Expo Go en dispositivos físicos Android e iOS.
* **Gestión:** Disponer de una arquitectura desacoplada donde la lógica pesada reside en el backend NestJS, reduciendo la complejidad del frontend móvil.

---

## 4. Especificación de Requisitos y Gestión del Backlog

### 4.1. Priorización MoSCoW y definición del MVP
De acuerdo con la técnica **MoSCoW**, se clasificó el catálogo completo de requisitos para acotar el **Producto Mínimo Viable (MVP)**:

* **Must Have (Esenciales para el MVP):**
  * `HU-010`: Visualizar el mapa interactivo del campus de Moncloa.
  * `HU-011`: Centrar en la ubicación GPS actual del dispositivo.
  * `HU-013`: Buscar facultades, bibliotecas y servicios por nombre o texto.
  * `HU-014`: Consultar la ficha detallada de un lugar (horarios, accesos, contacto).
  * `HU-021`: Cálculo de ruta peatonal óptima sobre el mapa.
  * `HU-040`: Filtro de preferencias de accesibilidad para evitar escaleras.
* **Should Have (Importantes pero no bloqueantes para el lanzamiento inicial):**
  * `HU-022`: Comparativa multimodal (a pie vs. autobús EMT vs. bicicleta).
  * `HU-050`: Formulario para comunicar incidencias de movilidad (obras, rampas rotas).
  * `HU-070`: Panel web de gestión para actualizar lugares del campus.
* **Could Have (Deseables si el calendario lo permite):**
  * `HU-060`: Almacenamiento local de facultades favoritas.
  * `HU-051`: Adjuntar fotografías como evidencia a las incidencias.
* **Won’t Have (Descartados para esta versión):**
  * Navegación en interiores de edificios (*indoor positioning*).

### 4.2. Catálogo de Historias de Usuario Seleccionadas

```text
HU-013: Buscar lugares en el campus
--------------------------------------------------------------------------------
Como estudiante o visitante,
Quiero escribir el nombre de una facultad, biblioteca o servicio en el buscador,
Para localizarlo inmediatamente sin tener que explorar manualmente todo el mapa.

Criterios de Aceptación:
1. El buscador ofrece resultados en tiempo real según el usuario escribe.
2. Permite buscar por nombre oficial ("Facultad de Informática") o siglas ("FDI").
3. Muestra categoría, distancia y badge de accesibilidad PMR en cada resultado.
```

```text
HU-014: Consultar la ficha de un lugar
--------------------------------------------------------------------------------
Como usuario,
Quiero consultar la información detallada de un edificio,
Para conocer sus horarios de atención, dirección y puertas de entrada habilitadas.

Criterios de Aceptación:
1. Muestra descripción, horarios de apertura y datos de contacto de secretaría.
2. Desglosa los puntos de acceso indicando si disponen de rampa o ascensor.
3. Permite cerrar la ficha o solicitar una ruta hasta el destino.
```

### 4.3. Estimación del esfuerzo (Story Points)
Se utilizó la técnica de **Planning Poker** y la **secuencia de Fibonacci (1, 2, 3, 5, 8, 13)** para estimar la complejidad relativa, riesgo e incertidumbre de cada historia del Backlog:

$$\text{Velocidad estimada del equipo} \approx 25\text{ Puntos de Historia por Sprint}$$

---

## 5. Arquitectura y Diseño del Sistema

UniMovil adopta un patrón arquitectónico desacoplado organizado como un **Monorepo gestionado por npm Workspaces**:

```text
UniMovil (Monorepo)
├── packages/contracts/   -> Tipos de dominio, DTOs e interfaces TypeScript
├── apps/api/             -> Backend REST en NestJS (Node.js)
├── apps/mobile/          -> Aplicación nativa Android/iOS en React Native + Expo
└── apps/admin/           -> Portal web administrativo en React + Vite
```

### 5.1. Contratos Compartidos (`@unimovil/contracts`)
Garantiza el desacoplamiento seguro. Define las interfaces de `Place`, `AccessPoint`, `GeoCoordinates`, `PlaceSearchParams` y `PlaceListResponse`. Ambos extremos del sistema compilan contra este contrato canónico, imposibilitando discrepancias de formato en tiempo de ejecución.

### 5.2. Capa Servidor (`apps/api`)
Construida con **NestJS**. Proporciona una arquitectura modular empresarial basada en controladores, servicios e inyección de dependencias. Expone los endpoints REST securizados con CORS:
* `GET /places`: Catálogo geográfico filtrable.
* `GET /places/search?q=...`: Búsqueda predictiva.
* `GET /places/:id`: Detalle y accesibilidad de un recinto.

### 5.3. Capa Cliente Móvil (`apps/mobile`)
Desarrollada con **React Native y Expo Router**. Aplica un diseño por componentes reactivos (`SearchBar`, `CategoryFilter`, `PlaceCard`, `PlaceDetailModal`) garantizando compatibilidad idéntica tanto en dispositivos Android como iOS y soporte para funcionamiento offline con datos cacheados.

---

## 6. Registro de Sprints e Incrementos de Producto

### 6.1. Sprint 0: Fundaciones y DevOps
* Configuración del repositorio Git con ramas protegidas y política de Pull Requests obligatorias.
* Configuración de linters, formateadores automáticos y pipeline de GitHub Actions (`ci.yml`, CodeQL y escaneo de licencias Apache 2.0).

### 6.2. Sprint 1: Núcleo del MVP (En curso)
* **Parte 1 (PR #14):** Definición formal de contratos de datos geográficos y accesibilidad en `@unimovil/contracts`.
* **Parte 2 (PR #15):** Implementación de la API de lugares en NestJS con catálogo de coordenadas reales del campus de Moncloa.
* **Parte 3 (PR #16):** Desarrollo de la interfaz móvil con barra de búsqueda reactiva, filtros de categorías y modal de ficha técnica de facultades.

---

## 7. Conclusiones y Trabajo Futuro

El avance alcanzado hasta la fecha demuestra la eficacia de aplicar una metodología ágil disciplinada combinada con un estricto control de versiones en Git. La arquitectura modular adoptada ha permitido desacoplar las responsabilidades del equipo y garantizar que cada entrega represente un incremento funcional verificable.

Los próximos pasos contemplan la integración del visor cartográfico interactivo (Sprint 1, Parte 4) y el motor de cálculo de rutas peatonales adaptadas sin barreras arquitectónicas (Sprint 2).
