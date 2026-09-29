# 6. Toolchain y estándares de desarrollo

## 6.1. Runtime y gestor de paquetes

- Node.js LTS.
- Versión fijada mediante `.node-version`.
- npm como gestor de paquetes.
- `package-lock.json` versionado.
- `npm ci` para instalaciones reproducibles en CI.
- npm Workspaces para el monorepo.

La versión concreta de Node se fijará al crear el proyecto base y deberá actualizarse mediante una decisión documentada.

## 6.2. TypeScript

- `strict: true`.
- No utilizar `any` sin justificación.
- Tipos explícitos en límites de módulos y API.
- No confiar en tipos del cliente para validar entradas externas.
- Validación en tiempo de ejecución para peticiones, respuestas y configuración.

## 6.3. Formato y lint

- Prettier para formato automático.
- ESLint para calidad y errores comunes.
- Configuración compartida entre paquetes cuando sea posible.
- CI debe fallar si el código no está formateado.
- No se deben realizar cambios manuales incompatibles con el formateador.

## 6.4. Commits

Se utilizará Conventional Commits:

```text
feat: añadir búsqueda de lugares
fix: corregir cálculo de distancia
docs: documentar proveedor de mapas
test: añadir casos de incidencias
chore: actualizar dependencias
refactor: separar servicio de transporte
ci: endurecer permisos del workflow
```

Los commits deben ser pequeños, comprensibles y compilar cuando sea razonable.

## 6.5. Pruebas

Se aplicarán varios niveles:

- Unitarias para reglas y funciones aisladas.
- Integración para API, base de datos y adaptadores.
- Componentes para la interfaz móvil.
- End-to-end para flujos críticos.
- Pruebas manuales en Android y iOS.
- Casos positivos, negativos y límites.

Las pruebas no deben depender de servicios externos no controlados. Se utilizarán mocks, fixtures o entornos de prueba.

## 6.6. Scripts mínimos

El monorepo deberá proporcionar scripts equivalentes a:

```text
npm run format
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run ci
```

El script `ci` deberá reproducir localmente las comprobaciones esenciales del workflow principal.

## 6.7. Configuración

- La configuración se leerá desde variables de entorno o archivos de ejemplo.
- `.env.example` documentará nombres sin incluir valores secretos.
- Se validará la configuración al iniciar el backend.
- No se usarán valores secretos por defecto.
- Las configuraciones de desarrollo, integración y publicación estarán separadas.

## 6.8. Estilo de código

- Nombres descriptivos.
- Funciones pequeñas y con una responsabilidad clara.
- Módulos organizados por dominio, no únicamente por tipo de archivo.
- Evitar duplicación de reglas de negocio.
- Comentarios para explicar decisiones, no código evidente.
- Errores tipados y tratables.
- No ocultar fallos mediante `catch` vacíos.

## 6.9. Dependencias

Antes de añadir una dependencia importante se revisará:

- Licencia.
- Mantenimiento y actividad.
- Compatibilidad con Android e iOS.
- Compatibilidad con la versión de Node y Expo.
- Tamaño y rendimiento.
- Riesgos de seguridad.
- Existencia de una alternativa interna razonable.

## 6.10. Versionado y releases

La estrategia exacta de releases todavía no está fijada. Cuando se defina, se utilizará versionado semántico y notas de cambios verificables.
