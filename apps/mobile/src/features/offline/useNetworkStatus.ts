import { useCallback, useMemo, useState } from "react";
import { OfflineCache } from "./domain/offline-cache";

// Instancia compartida en memoria para la sesión
const sharedOfflineCache = new OfflineCache(20);

export function useNetworkStatus(initialOffline = false) {
  const [isOffline, setIsOffline] = useState(initialOffline);
  const cache = useMemo(() => sharedOfflineCache, []);

  const retryConnection = useCallback(async (): Promise<boolean> => {
    // Simula comprobación de conectividad al servidor
    // En un entorno de producción, ping a /health
    try {
      // Si la comprobación tiene éxito, restauramos estado online
      setIsOffline(false);
      return true;
    } catch {
      setIsOffline(true);
      return false;
    }
  }, []);

  return {
    isOffline,
    setOffline: setIsOffline,
    retryConnection,
    cache,
  };
}
