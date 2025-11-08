import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Vehicle {
  id: string;
  license_plate: string;
  vehicle_type: string;
  route_assigned: string | null;
  status: string;
  last_service_date: string | null;
  insurance_expiry: string | null;
}

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "maintenance":
        return "warning";
      case "inactive":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getVehicleIcon = (type: string) => {
    return <Truck className="h-10 w-10 text-primary" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Truck className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Vehicle Fleet</h1>
        <p className="text-muted-foreground">
          Track and manage your fleet across Kenyan routes
        </p>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No vehicles registered</p>
            <p className="text-sm text-muted-foreground">
              Add vehicles to your fleet to start tracking
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getVehicleIcon(vehicle.vehicle_type)}
                    <div>
                      <CardTitle className="text-lg">{vehicle.license_plate}</CardTitle>
                      <CardDescription className="capitalize">
                        {vehicle.vehicle_type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(vehicle.status) as any} className="capitalize">
                    {vehicle.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {vehicle.route_assigned && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Route:</span>
                    <span className="font-medium">{vehicle.route_assigned}</span>
                  </div>
                )}
                {vehicle.last_service_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Service:</span>
                    <span className="font-medium">
                      {format(new Date(vehicle.last_service_date), "dd MMM yyyy")}
                    </span>
                  </div>
                )}
                {vehicle.insurance_expiry && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Insurance:</span>
                    <span className="font-medium">
                      {format(new Date(vehicle.insurance_expiry), "dd MMM yyyy")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vehicles;
