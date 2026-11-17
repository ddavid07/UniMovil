import type { Place } from "@unimovil/contracts";
import { PlaceResults } from "./PlaceResults";
import { PlaceSheet } from "./PlaceSheet";
import type { useCampus } from "../useCampus";

interface Props {
  campus: ReturnType<typeof useCampus>;
  listOpen: boolean;
  onCloseList: () => void;
  onSelect: (id: string) => void;
  onPlanRoute?: ((place: Place) => void) | undefined;
}
export function CampusDialogs({
  campus,
  listOpen,
  onCloseList,
  onSelect,
  onPlanRoute,
}: Props) {
  return (
    <>
      <PlaceResults
        places={campus.visible}
        open={listOpen}
        onClose={onCloseList}
        onSelect={onSelect}
        onReset={campus.reset}
      />
      <PlaceSheet
        key={campus.selected?.id ?? "none"}
        place={campus.selected}
        onClose={() => campus.select(null)}
        onPlanRoute={onPlanRoute}
      />
    </>
  );
}
