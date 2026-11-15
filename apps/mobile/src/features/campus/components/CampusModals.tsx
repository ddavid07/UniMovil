import type { TransitStop } from "@unimovil/contracts";
import type { useCampus } from "../useCampus";
import type { useRouting } from "../../routing/useRouting";
import { CampusDialogs } from "./CampusDialogs";
import { RouteSheet } from "../../routing/components/RouteSheet";
import { TransitStopSheet } from "../../transit/components/TransitStopSheet";

interface Props {
  readonly campus: ReturnType<typeof useCampus>;
  readonly routing: ReturnType<typeof useRouting>;
  readonly listOpen: boolean;
  readonly selectedTransitStop: TransitStop | null;
  readonly onCloseList: () => void;
  readonly onSelect: (id: string) => void;
  readonly onCloseTransitStop: () => void;
  readonly onPlanRouteToStop: (stop: TransitStop) => void;
}

export function CampusModals({
  campus,
  routing,
  listOpen,
  selectedTransitStop,
  onCloseList,
  onSelect,
  onCloseTransitStop,
  onPlanRouteToStop,
}: Props) {
  return (
    <>
      <CampusDialogs
        campus={campus}
        listOpen={listOpen}
        onCloseList={onCloseList}
        onSelect={onSelect}
        onPlanRoute={(place) => routing.openRouting(place)}
      />
      <RouteSheet route={routing.route} onClose={routing.clearRoute} />
      <TransitStopSheet
        stop={selectedTransitStop}
        onClose={onCloseTransitStop}
        onPlanRouteToStop={onPlanRouteToStop}
      />
    </>
  );
}
