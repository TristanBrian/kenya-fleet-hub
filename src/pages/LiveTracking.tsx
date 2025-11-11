import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck, Clock, Navigation, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import KenyaFleetMap from "@/components/KenyaFleetMap";

interface Vehicle {
  id: string;
  license_plate: string;
  vehicle_type: string;
  route_assigned: string | null;
  status: string;
  current_latitude: number | null;
  current_longitude: number | null;
}

const LiveTracking = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
    
    // Set up real-time subscription for live location updates
    const channel = supabase
      .channel('live-locations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles'
        },
        () => {
          fetchVehicles();
        }
      )
      .subscribe();

    // Also refresh every 30 seconds
    const interval = setInterval(() => {
      fetchVehicles();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("status", "active")
        .not("current_latitude", "is", null);

      if (error) {
        console.error("Error fetching vehicles:", error);
      } else {
        setVehicles(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success border-success";
      case "maintenance": return "bg-warning/10 text-warning border-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getVehicleIcon = (type: string) => {
    return <Truck className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MapPin className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading live tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Live Vehicle Tracking 🗺️
          </h1>
          <p className="text-muted-foreground">
            Real-time location monitoring across Kenya
          </p>
        </div>
        <Badge variant="outline" className="border-success text-success">
          <span className="h-2 w-2 bg-success rounded-full mr-2 animate-pulse"></span>
          {vehicles.length} Active Vehicles
        </Badge>
      </div>

      {/* Alert Banner */}
      <Card className="border-l-4 border-l-warning bg-warning/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">Checkpoint Alert - Mombasa Road</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Police checkpoint active near Mlolongo. Expected 2-hour delay reported. Drivers advised to carry all documents.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Kenya Fleet Map
          </CardTitle>
          <CardDescription>Interactive map showing all active vehicles in real-time</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <KenyaFleetMap vehicles={vehicles} />
        </CardContent>
      </Card>

      {/* Active Vehicles Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Vehicles ({vehicles.length})</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-success">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getVehicleIcon(vehicle.vehicle_type)}
                    <div>
                      <CardTitle className="text-base">{vehicle.license_plate}</CardTitle>
                      <CardDescription className="text-xs capitalize">
                        {vehicle.vehicle_type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(vehicle.status)}>
                    Moving
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Route:</span>
                  <span className="font-medium">{vehicle.route_assigned || "Not assigned"}</span>
                </div>
                
                {vehicle.current_latitude && vehicle.current_longitude && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-mono text-xs">
                      {vehicle.current_latitude.toFixed(4)}, {vehicle.current_longitude.toFixed(4)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">On Schedule</span>
                </div>

                <div className="pt-2 border-t">
                  <button className="w-full text-sm text-primary hover:text-primary/80 font-medium">
                    View Details →
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {vehicles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No active vehicles with GPS data</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveTracking;
