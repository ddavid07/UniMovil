import type { RouteResponse, TransitStop } from "@unimovil/contracts";
import type { Incident } from "../../incidents/domain/incidents";
import type { useCampus } from "../useCampus";
import type { useRouting } from "../../routing/useRouting";
import { CampusDialogs } from "./CampusDialogs";
import { RouteSheet } from "../../routing/components/RouteSheet";
import { TransitStopSheet } from "../../transit/components/TransitStopSheet";
import { IncidentSheet } from "../../incidents/components/IncidentSheet";

interface Props {
  readonly campus: ReturnType<typeof useCampus>;
  readonly routing: ReturnType<typeof useRouting>;
  readonly listOpen: boolean;
  readonly selectedTransitStop: TransitStop | null;
  readonly selectedIncident?: Incident | null;
  readonly onCloseList: () => void;
  readonly onSelect: (id: string) => void;
  readonly onCloseTransitStop: () => void;
  readonly onCloseIncident?: () => void;
  readonly onPlanRouteToStop: (stop: TransitStop) => void;
  readonly route: RouteResponse | null;
  readonly onAcceptRoute?: (() => void) | undefined;
}

export function CampusModals({
  campus,
  routing,
  listOpen,
  selectedTransitStop,
  selectedIncident,
  onCloseList,
  onSelect,
  onCloseTransitStop,
  onCloseIncident,
  onPlanRouteToStop,
  route,
  onAcceptRoute,
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
      <RouteSheet
        route={route}
        onClose={routing.clearRoute}
        onAccept={onAcceptRoute}
      />
      <TransitStopSheet
        stop={selectedTransitStop}
        onClose={onCloseTransitStop}
        onPlanRouteToStop={onPlanRouteToStop}
      />
      <IncidentSheet
        incident={selectedIncident ?? null}
        onClose={onCloseIncident ?? (() => {})}
      />
    </>
  );
}
