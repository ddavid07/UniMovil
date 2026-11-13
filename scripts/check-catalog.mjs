import { readFile } from "node:fs/promises";
import {
  parsePlaces,
  PLACE_CATEGORIES,
} from "../packages/contracts/dist/index.js";

const catalogUrl = new URL(
  "../apps/mobile/src/features/campus/data/catalog.json",
  import.meta.url,
);
// Fixed repository-relative URL; no external path is accepted.
// eslint-disable-next-line security/detect-non-literal-fs-filename
const contents = await readFile(catalogUrl, "utf8");
const places = parsePlaces(JSON.parse(contents));
if (places.length < 24) throw new Error("Se requieren al menos 24 lugares.");
for (const category of PLACE_CATEGORIES) {
  if (places.filter((place) => place.category === category).length < 4)
    throw new Error(`Faltan lugares de ${category}.`);
}
if (
  places.some(
    (place) => place.source.checkedAt > new Date().toISOString().slice(0, 10),
  )
)
  throw new Error("No se permiten comprobaciones futuras.");
console.log(
  `Catálogo validado: ${places.length} lugares, seis categorías, procedencia OSM/ODbL.`,
);
