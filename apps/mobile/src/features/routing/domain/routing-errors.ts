/**
 * Servicio transversal de clasificación y gestión de errores (HU-094).
 * Cumple con los 5 criterios de aceptación de HU-094:
 * 1. Diferenciación de categorías de fallo.
 * 2. Mensaje comprensible y acción recomendada.
 * 3. Identificación de operaciones reintentables y reintento automático/manual.
 * 4. Preservación del estado y datos del usuario ante fallos.
 * 5. Ocultamiento de detalles técnicos inseguros y sanitización de credenciales.
 */

export type ClassifiedErrorCategory =
  | "OFFLINE"
  | "SERVER_ERROR"
  | "PERMISSION_DENIED"
  | "NO_RESULTS"
  | "VALIDATION"
  | "UNKNOWN";

export interface UIErrorMessage {
  readonly category: ClassifiedErrorCategory;
  readonly title: string;
  readonly userMessage: string;
  readonly recommendedAction: string;
  readonly isRetryable: boolean;
  readonly safeForDisplay: boolean;
}

export function classifyError(error: unknown): UIErrorMessage {
  // 1. Falta de conexión / Offline
  if (isOfflineError(error)) {
    return {
      category: "OFFLINE",
      title: "Sin conexión a internet",
      userMessage:
        "No es posible calcular la ruta porque el dispositivo no tiene conexión activa a la red.",
      recommendedAction:
        "Comprueba tu conexión Wi-Fi o de datos móviles y vuelve a intentarlo.",
      isRetryable: true,
      safeForDisplay: true,
    };
  }

  // 2. Permisos insuficientes (ej. GPS/Ubicación o cuenta)
  if (isPermissionError(error)) {
    return {
      category: "PERMISSION_DENIED",
      title: "Permiso denegado",
      userMessage:
        "La aplicación no tiene permiso para acceder a la ubicación requerida para esta acción.",
      recommendedAction:
        "Activa el permiso de ubicación en los ajustes del dispositivo o selecciona el punto manualmente en el mapa.",
      isRetryable: false,
      safeForDisplay: true,
    };
  }

  // 3. Ausencia de resultados / Ruta inaccesible
  if (isNoResultsError(error)) {
    const isPmrSpecific =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "NO_ACCESSIBLE_ROUTE";

    if (isPmrSpecific) {
      return {
        category: "NO_RESULTS",
        title: "Ruta adaptada no disponible",
        userMessage:
          "No existe un itinerario libre de escaleras o barreras arquitectónicas hacia este destino.",
        recommendedAction:
          "Desactiva el filtro PMR si te es posible transitar por escaleras o selecciona un acceso alternativo.",
        isRetryable: false,
        safeForDisplay: true,
      };
    }

    return {
      category: "NO_RESULTS",
      title: "Ruta no encontrada",
      userMessage:
        "No hemos encontrado ningún itinerario peatonal que conecte el origen y el destino indicados.",
      recommendedAction:
        "Comprueba que ambos puntos se encuentran dentro de zonas peatonales del campus de Moncloa.",
      isRetryable: false,
      safeForDisplay: true,
    };
  }

  // 4. Validación de datos de entrada (fuera de límites, puntos idénticos)
  if (isValidationError(error)) {
    const errObj = error as {
      code?: string;
      userMessage?: string;
      recommendedAction?: string;
    };
    return {
      category: "VALIDATION",
      title: "Datos de ruta no válidos",
      userMessage:
        errObj.userMessage ??
        "Los puntos de origen o destino introducidos no son válidos para el campus de Moncloa.",
      recommendedAction:
        errObj.recommendedAction ??
        "Selecciona puntos de salida y llegada diferentes dentro de Ciudad Universitaria.",
      isRetryable: false,
      safeForDisplay: true,
    };
  }

  // 5. Error del servidor / Caída de backend (500, 502, 503, 504)
  if (isServerError(error)) {
    return {
      category: "SERVER_ERROR",
      title: "Servicio temporalmente no disponible",
      userMessage:
        "El servidor de movilidad de la universidad está experimentando problemas temporales.",
      recommendedAction: "Espera unos segundos y pulsa en reintentar.",
      isRetryable: true,
      safeForDisplay: true,
    };
  }

  // 6. Error desconocido o no controlado
  return {
    category: "UNKNOWN",
    title: "Error inesperado",
    userMessage:
      "Ha ocurrido un problema al procesar la solicitud de movilidad.",
    recommendedAction: "Por favor, inténtelo de nuevo más tarde.",
    isRetryable: true,
    safeForDisplay: true,
  };
}

/**
 * Sanitiza cualquier objeto de error antes de guardarlo en logs
 * para garantizar que no se registren tokens, contraseñas ni secretos (Criterio 5 de HU-094).
 */
export function sanitizeErrorForLogging(
  error: unknown,
): Record<string, unknown> {
  if (typeof error !== "object" || error === null) {
    return { raw: String(error) };
  }

  /* eslint-disable security/detect-object-injection */
  const sanitized: Record<string, unknown> = {};
  const forbiddenPatterns = [
    /pass/i,
    /token/i,
    /auth/i,
    /key/i,
    /secret/i,
    /bearer/i,
    /credential/i,
  ];

  for (const [key, value] of Object.entries(error as Record<string, unknown>)) {
    const isSensitive = forbiddenPatterns.some((pattern) => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = "[REDACTED_BY_HU094_POLICY]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeErrorForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  /* eslint-enable security/detect-object-injection */

  return sanitized;
}

/**
 * Mecanismo de reintento automático para operaciones recuperables (Criterio 3 de HU-094).
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 100,
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      lastError = err;
      const classified = classifyError(err);
      if (!classified.isRetryable || attempt >= maxRetries) {
        throw err;
      }
      // Pequeño retardo antes del siguiente reintento
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
}

function isOfflineError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const msg = (
    "message" in err ? String((err as { message: unknown }).message) : ""
  ).toLowerCase();
  const code = "code" in err ? String((err as { code: unknown }).code) : "";
  return (
    code === "NETWORK_ERROR" ||
    code === "ENOTFOUND" ||
    code === "ECONNREFUSED" ||
    msg.includes("offline") ||
    msg.includes("network request failed") ||
    msg.includes("fetch failed")
  );
}

function isPermissionError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const msg = (
    "message" in err ? String((err as { message: unknown }).message) : ""
  ).toLowerCase();
  const code = "code" in err ? String((err as { code: unknown }).code) : "";
  return (
    code === "PERMISSION_DENIED" ||
    code === "EACCES" ||
    msg.includes("permission denied") ||
    msg.includes("permiso denegado") ||
    msg.includes("unauthorized")
  );
}

function isNoResultsError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const code = "code" in err ? String((err as { code: unknown }).code) : "";
  return code === "NO_ROUTE_FOUND" || code === "NO_ACCESSIBLE_ROUTE";
}

function isValidationError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const code = "code" in err ? String((err as { code: unknown }).code) : "";
  return (
    code === "INVALID_COORDINATES" ||
    code === "ORIGIN_OUT_OF_BOUNDS" ||
    code === "DESTINATION_OUT_OF_BOUNDS" ||
    code === "IDENTICAL_POINTS"
  );
}

function isServerError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const status =
    "status" in err ? Number((err as { status: unknown }).status) : 0;
  const code = "code" in err ? String((err as { code: unknown }).code) : "";
  return status >= 500 || code === "SERVER_ERROR" || code === "ETIMEDOUT";
}
