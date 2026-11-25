# Metodología de trabajo

## Enfoque

El proyecto toma Scrum como marco de trabajo inicial, alineado con el temario de la asignatura. El equipo inspecciona incrementos de producto, obtiene feedback y adapta el Product Backlog. La [Guía Scrum](https://scrumguides.org/scrum-guide.html) es la referencia del marco; los [materiales del curso](../assets/course-materials/README.md) complementan su aplicación académica.

## Responsabilidades

Scrum define tres responsabilidades dentro de un único Scrum Team:

- **Product Owner:** maximiza el valor del producto y ordena el Product Backlog.
- **Scrum Master:** ayuda al equipo y a la organización a comprender y aplicar Scrum, facilita la mejora y ayuda a eliminar impedimentos.
- **Developers:** crean un incremento usable y deciden cómo organizar el trabajo necesario para alcanzar el objetivo del Sprint.

La coordinación del trabajo y las responsabilidades funcionales se describen en los [planes de Sprint](../iterations/README.md). Scrum no exige crear subequipos ni convierte al Scrum Master en responsable de repartir tareas; los Developers se autoorganizan.

## Ciclo de trabajo

El trabajo se organiza en Sprints de duración fija, de un mes como máximo. La duración concreta se acuerda teniendo en cuenta el calendario académico y la posibilidad de obtener feedback. Cada Sprint comprende:

1. **Sprint Planning:** acordar por qué el Sprint es valioso, definir un Sprint Goal, seleccionar trabajo que contribuya al objetivo y preparar un plan inicial.
2. **Daily Scrum:** encuentro diario de hasta 15 minutos para que los Developers inspeccionen el progreso hacia el Sprint Goal y adapten el plan.
3. **Sprint Review:** inspeccionar el incremento con las personas interesadas, conversar sobre resultados y feedback, y adaptar el Product Backlog.
4. **Sprint Retrospective:** inspeccionar cómo trabajó el equipo y acordar mejoras concretas.

El refinamiento del Product Backlog es una actividad continua, no un evento Scrum adicional. Los planes de Sprint se encuentran en [iterations/](../iterations/); las reuniones se registran en [meetings/](../meetings/) después de que se celebren.

## Artefactos y calidad

- **Product Backlog:** lista ordenada y evolutiva del trabajo del producto. Su índice actual es el [backlog](../backlog/product-backlog.md); las historias completas están en [user-stories/](../user-stories/README.md).
- **Sprint Backlog:** Sprint Goal, elementos seleccionados y plan de trabajo actualizado por los Developers.
- **Increment:** resultado usable que cumple la Definition of Done acordada por el equipo.

Para las capacidades públicas, los criterios se comprueban en las plataformas afectadas. Desde el alcance de [ADR-0010](../adr/0010-public-web-client.md), los nuevos incrementos funcionales incluyen su experiencia web; la matriz de navegadores y ventanas compatibles se define en el Sprint 3 y se usa para verificar el diseño adaptable. La web administrativa permanece separada.

Los criterios de aceptación pertenecen a cada historia y especifican su comportamiento esperado. La Definition of Done es el acuerdo común de calidad para el incremento; se acuerda antes del primer Sprint y se aplica junto con los criterios de aceptación. Una tarea no se considera terminada solo por estar implementada o presentada.

## Refinamiento y planificación

Antes de incorporar una historia a un Sprint, el equipo aclara su valor, alcance, ejemplos, reglas y dependencias. Se comprueba que sea comprensible, comprobable y lo bastante pequeña para completar dentro de una iteración. Si hay incertidumbre significativa, se investiga o se divide el trabajo antes de comprometerlo.

El equipo ordena los elementos refinados considerando su valor, riesgo, dependencias, capacidad y aprendizaje esperado.

## Trazabilidad y adaptación

Las historias conservan sus identificadores HU para enlazar necesidades, cambios de código y pruebas. Las decisiones arquitectónicas nuevas se registran en [adr/](../adr/). Los acuerdos de una reunión y los resultados de cada Sprint se documentan una sola vez y se enlazan cuando sea necesario.

El feedback, los riesgos y los cambios de alcance se incorporan al backlog con su contexto. El equipo revisa esta metodología cuando obtiene evidencia que justifica cambiarla y registra los acuerdos relevantes mediante Git.
