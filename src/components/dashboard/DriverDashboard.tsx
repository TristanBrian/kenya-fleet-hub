import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Truck, MapPin, TrendingUp, Fuel, Clock, 
  AlertTriangle, CheckCircle2, Star, Route 
} from "lucide-react";
import { format } from "date-fns";

interface DriverData {
  id: string;
  license_number: string;
  performance_score: number;
  total_trips: number;
  speeding_incidents: number;
  harsh_braking_events: number;
  idle_time_hours: number;
  vehicle?: {
    id: string;
    license_plate: string;
    vehicle_type: string;
    status: string;
    route_assigned: string | null;
    fuel_efficiency_kml: number;
  } | null;
}

interface Trip {
  id: string;
  route: string;
  start_location: string;
  end_location: string;
  status: string;
  start_time: string;
  end_time: string | null;
  progress_percent: number;
  distance_km: number | null;
}

interface FuelLog {
  id: string;
  liters: number;
  total_cost_kes: number;
  route: string | null;
  created_at: string;
}

export const DriverDashboard = ({ profile }: { profile: any }) => {
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch driver record with vehicle info
    const { data: driver, error: driverError } = await supabase
      .from("drivers")
      .select(`
        *,
        vehicle:vehicles(id, license_plate, vehicle_type, status, route_assigned, fuel_efficiency_kml)
      `)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (driverError) {
      console.error("Error fetching driver:", driverError);
    }

    if (driver) {
      setDriverData(driver as any);

      // Fetch trips for this driver
      const { data: tripData } = await supabase
        .from("trips")
        .select("*")
        .eq("driver_id", driver.id)
        .order("start_time", { ascending: false })
        .limit(10);

      setTrips(tripData || []);

      // Fetch fuel logs for this driver
      const { data: fuelData } = await supabase
        .from("fuel_logs")
        .select("*")
        .eq("driver_id", driver.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setFuelLogs(fuelData || []);
    }

    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      in_progress: "default",
      completed: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Truck className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!driverData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Driver Profile Not Found</h3>
          <p className="text-muted-foreground">
            Your driver profile has not been set up yet. Please contact your fleet manager.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeTrip = trips.find(t => t.status === "in_progress");
  const completedTripsCount = trips.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Welcome & Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Star className={`h-5 w-5 ${getScoreColor(driverData.performance_score || 100)}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(driverData.performance_score || 100)}`}>
              {driverData.performance_score || 100}%
            </div>
            <Progress value={driverData.performance_score || 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Route className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{driverData.total_trips || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTripsCount} completed recently
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Speeding Incidents</CardTitle>
            <AlertTriangle className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{driverData.speeding_incidents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Keep it safe!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Idle Time</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{driverData.idle_time_hours || 0}h</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Vehicle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            My Assigned Vehicle
          </CardTitle>
        </CardHeader>
        <CardContent>
          {driverData.vehicle ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">License Plate</p>
                <p className="font-semibold text-lg">{driverData.vehicle.license_plate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Type</p>
                <p className="font-semibold">{driverData.vehicle.vehicle_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={driverData.vehicle.status === 'active' ? 'default' : 'secondary'}>
                  {driverData.vehicle.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Route</p>
                <p className="font-semibold">{driverData.vehicle.route_assigned || "No route assigned"}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Truck className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No vehicle currently assigned to you.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Trip */}
      {activeTrip && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary animate-pulse" />
              Active Trip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{activeTrip.route}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTrip.start_location} → {activeTrip.end_location}
                  </p>
                </div>
                {getStatusBadge(activeTrip.status)}
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{activeTrip.progress_percent}%</span>
                </div>
                <Progress value={activeTrip.progress_percent} />
              </div>
              <p className="text-xs text-muted-foreground">
                Started: {format(new Date(activeTrip.start_time), "PPp")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Trips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trips.length > 0 ? (
            <div className="space-y-3">
              {trips.slice(0, 5).map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{trip.route}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.start_location} → {trip.end_location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(trip.start_time), "PPp")}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(trip.status)}
                    {trip.distance_km && (
                      <p className="text-xs text-muted-foreground mt-1">{trip.distance_km} km</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Route className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No trips recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fuel Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5 text-primary" />
            Recent Fuel Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fuelLogs.length > 0 ? (
            <div className="space-y-3">
              {fuelLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{log.liters} Liters</p>
                    <p className="text-sm text-muted-foreground">{log.route || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "PPp")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">KES {log.total_cost_kes?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Fuel className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No fuel logs recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
