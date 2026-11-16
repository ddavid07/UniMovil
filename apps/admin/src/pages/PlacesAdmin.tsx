import type { FC } from "react";
import { PlacesView, type PlacesViewProps } from "../components/PlacesView.tsx";

/**
 * PlacesAdmin (HU-070, HU-071)
 *
 * Pantalla principal de administración de edificios, facultades y recursos de movilidad
 * del Campus de Moncloa. Permite filtrar, editar estado operativo y accesibilidad PMR.
 *
 * @author pablopr06 <pabpalac@ucm.es>
 */
export const PlacesAdmin: FC<PlacesViewProps> = (props) => {
  return <PlacesView {...props} />;
};

export default PlacesAdmin;
