import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Route, Truck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface RecentTrip {
  id: string;
  route: string;
  status: string;
  start_time: string;
  start_location: string;
  end_location: string;
}

interface TopVehicle {
  license_plate: string;
  route_assigned: string | null;
  status: string;
  last_location_update: string | null;
}

export const FleetActivitySummary = () => {
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [topVehicles, setTopVehicles] = useState<TopVehicle[]>([]);
  const [routeCount, setRouteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [tripsRes, vehiclesRes, routesRes] = await Promise.all([
      supabase
        .from("trips")
        .select("id, route, status, start_time, start_location, end_location")
        .order("start_time", { ascending: false })
        .limit(5),
      supabase
        .from("vehicles")
        .select("license_plate, route_assigned, status, last_location_update")
        .eq("status", "active")
        .not("current_latitude", "is", null)
        .order("last_location_update", { ascending: false })
        .limit(6),
      supabase
        .from("kenyan_routes")
        .select("id", { count: "exact", head: true }),
    ]);

    setRecentTrips(tripsRes.data || []);
    setTopVehicles(vehiclesRes.data || []);
    setRouteCount(routesRes.count || 0);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      in_progress: { label: "In Progress", variant: "default" },
      completed: { label: "Completed", variant: "secondary" },
      cancelled: { label: "Cancelled", variant: "destructive" },
      scheduled: { label: "Scheduled", variant: "outline" },
    };
    const c = config[status] || { label: status, variant: "outline" };
    return <Badge variant={c.variant} className="text-[10px] px-1.5 py-0">{c.label}</Badge>;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Fleet Activity
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Route className="h-3 w-3 mr-1" />
            {routeCount} routes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-hidden">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading activity...</div>
        ) : (
          <>
            {/* Active vehicles on the road */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Active on Road
              </p>
              <div className="grid grid-cols-2 gap-2">
                {topVehicles.slice(0, 4).map((v) => (
                  <div
                    key={v.license_plate}
                    className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/live-tracking")}
                  >
                    <Truck className="h-3.5 w-3.5 text-success flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{v.license_plate}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {v.route_assigned || "No route"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {topVehicles.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">No active vehicles with GPS</p>
              )}
            </div>

            {/* Recent trips */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Recent Trips
              </p>
              <div className="space-y-2">
                {recentTrips.slice(0, 4).map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/dashboard")}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <TrendingUp className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          {trip.start_location} <ArrowRight className="h-2.5 w-2.5 inline" /> {trip.end_location}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(trip.start_time), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(trip.status)}
                  </div>
                ))}
                {recentTrips.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-3">No trips recorded yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
