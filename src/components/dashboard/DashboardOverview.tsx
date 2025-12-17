import { FleetStatusGrid } from "./FleetStatusGrid";
import { AlertPanel } from "./AlertPanel";
import { FleetMetricsWidgets } from "./FleetMetricsWidgets";
import { FleetMapView } from "./FleetMapView";

export const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Widgets */}
      <FleetMetricsWidgets />

      {/* Alert Panel + Map View */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AlertPanel />
        <FleetMapView />
      </div>

      {/* Live Fleet Status Grid */}
      <FleetStatusGrid />
    </div>
  );
};
