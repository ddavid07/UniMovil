# ADR-0011 — Fuentes y vigencia de datos de transporte

## Estado

Aceptada

## Contexto

El producto contempla paradas, líneas, recorridos y horarios. No se ha acreditado que UCM u operadores proporcionen actualmente un feed abierto/autorizado con cobertura y condiciones aptas para UniMovil.

## Decisión

- Importar únicamente datos oficiales o cuyo uso haya sido autorizado, registrando fuente, licencia/condiciones, fecha de importación, última actualización y validación.
- La primera implementación soportará datos estáticos/manuales revisados. No se ofrecerá tiempo real hasta identificar un feed autorizado y probar cobertura, calidad, frecuencia y condiciones de redistribución.
- Mostrar estado y fecha de vigencia; los datos caducados se identificarán como tales y no se presentarán como actuales.
- Ante fallo de fuente, conservar el último dato validado con advertencia de antigüedad; no inventar/estimar llegadas.
- Mantener adaptadores por fuente y fixtures sintéticos para pruebas.

## Alternativas consideradas

- Consultar fuentes de terceros sin verificar derechos o estabilidad.
- Usar Nominatim/teselas públicas como backend de transporte.
- No mostrar información cuando la actualización falle.

## Consecuencias

La confianza y procedencia son visibles; el alcance de transporte en tiempo real queda condicionado a datos legítimos y fiables. Sin feed confirmado, las funciones de tiempo real no se pueden declarar completas y se deberá revisar alcance con producto cuando llegue el momento.

## Fecha

2026-10-01
