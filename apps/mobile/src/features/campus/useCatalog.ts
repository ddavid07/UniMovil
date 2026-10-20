import { useEffect, useState } from "react";
import type { Place } from "@unimovil/contracts";
import type { PlacesRepository } from "./data/repository";
type CatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; places: readonly Place[] };
export function useCatalog(repository: PlacesRepository) {
  const [catalog, setCatalog] = useState<CatalogState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    setCatalog({ status: "loading" });
    void repository.list().then(
      (places) => {
        if (current) setCatalog({ status: "ready", places });
      },
      () => {
        if (current) setCatalog({ status: "error" });
      },
    );
    return () => {
      current = false;
    };
  }, [repository, attempt]);
  return { catalog, retry: () => setAttempt((value) => value + 1) };
}
