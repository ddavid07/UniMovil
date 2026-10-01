# 7. Seguridad y privacidad

## 7.1. Principios

- Mínimo privilegio.
- Privacidad desde el diseño.
- Validación en cada frontera.
- No confiar en datos enviados por el cliente.
- No almacenar información que no sea necesaria.
- Trazabilidad de acciones administrativas.
- Fallar de forma segura.

## 7.2. Autenticación y autorización

- La autenticación se separará de la autorización.
- La API comprobará permisos en cada operación protegida.
- La interfaz puede ocultar acciones, pero no sustituye al control del servidor.
- Los roles serán público, usuario registrado, gestor y administrador.
- El tipo de relación con la UCM no otorgará permisos automáticamente.
- Supabase Auth proporciona identidad; la API NestJS valida tokens y decide permisos de UniMovil. No se conceden roles por datos controlados por el cliente ni por relación con la UCM.

## 7.3. Ubicación

- La aplicación solicitará permiso antes de acceder a la ubicación.
- La ubicación se utilizará para la función solicitada.
- No habrá seguimiento continuo por defecto.
- No se guardará el historial de posiciones salvo decisión explícita y justificada.
- Si el usuario rechaza la ubicación, podrá seguir consultando la información manualmente.

## 7.4. Incidencias y fotografías

- Las incidencias requerirán una cuenta registrada.
- Se ocultará la identidad del autor en la vista pública.
- Las fotografías se validarán por tamaño y formato.
- Se evitará almacenar metadatos innecesarios.
- Las evidencias se guardarán en Supabase Storage privado. Carga, validación, moderación y autorización se orquestan en backend; nunca se expone la service key.
- La moderación tendrá estados explícitos (pendiente, aprobada, rechazada, retirada) y auditoría. Lo no aprobado no será público.
- El periodo concreto de conservación se aprobará antes de operar con datos reales; hasta entonces se aplica minimización y se usan datos ficticios.

## 7.5. Secretos

Nunca se versionarán:

- Claves de MapTiler.
- Claves de openrouteservice.
- Contraseñas.
- Tokens de sesión.
- Certificados.
- Claves privadas.
- Credenciales de bases de datos.
- Credenciales de tiendas móviles.

Los secretos se gestionarán mediante variables de entorno locales y secretos protegidos de GitHub Actions o del proveedor de despliegue.

## 7.6. Dependencias y cadena de suministro

- Dependabot.
- Dependency Review.
- CodeQL.
- Secret scanning.
- OSV-Scanner.
- Revisión de licencias.
- Acciones de GitHub fijadas por SHA.
- Lockfile versionado.
- Instalaciones CI con `npm ci`.

## 7.7. Datos de prueba

- Solo datos ficticios.
- Ningún correo real de estudiantes o profesores.
- Ninguna coordenada que revele información privada.
- Ninguna fotografía real de personas.
- Fixtures documentados y reproducibles.

## 7.8. Auditoría

Se registrarán cambios administrativos sobre lugares, transporte, accesibilidad, avisos e incidencias. Los registros no incluirán contraseñas, tokens ni secretos.

## 7.9. Cumplimiento y revisión

Antes de una publicación real se revisarán privacidad, base legal, tratamiento de ubicación, conservación de datos y uso de marcas o datos de la UCM con las personas responsables correspondientes. Esta documentación técnica no sustituye una revisión legal.

## 7.10. Límites operativos actuales

El repositorio es privado y el plan GitHub Free no ofrece protección de ramas ni CodeQL/secret scanning hospedados para este caso. El pipeline ejecutará controles alternativos (auditoría de dependencias, análisis de secretos y análisis estático). La limitación se revisará si cambia el plan o la visibilidad; no se cambia la visibilidad ni se asume un coste como parte de la implementación.
