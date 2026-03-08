import { FleetStatusGrid } from "./FleetStatusGrid";
import { AlertPanel } from "./AlertPanel";
import { FleetMetricsWidgets } from "./FleetMetricsWidgets";
import { FleetMapView } from "./FleetMapView";
import { FleetActivitySummary } from "./FleetActivitySummary";
import { useApiKeys } from "@/hooks/useApiKeys";

export const DashboardOverview = () => {
  const { isMapboxConfigured } = useApiKeys();
  const mapConfigured = isMapboxConfigured();

  return (
    <div className="space-y-6">
      {/* Key Metrics Widgets */}
      <FleetMetricsWidgets />

      {/* Alert Panel + Map/Activity View */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-full">
          <AlertPanel />
        </div>
        <div className="h-full">
          {mapConfigured ? <FleetMapView /> : <FleetActivitySummary />}
        </div>
      </div>

      {/* Live Fleet Status Grid */}
      <FleetStatusGrid />
    </div>
  );
};
