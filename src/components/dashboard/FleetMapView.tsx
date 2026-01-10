import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export const FleetMapView = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
    
    const channel = supabase
      .channel('map-vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, fetchVehicles)
      .subscribe();

    // Refresh every 60 seconds
    const interval = setInterval(fetchVehicles, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("vehicles")
      .select("id, license_plate, vehicle_type, route_assigned, status, current_latitude, current_longitude")
      .not("current_latitude", "is", null)
      .not("current_longitude", "is", null);

    setVehicles(data || []);
    setLoading(false);
  };

  const vehiclesWithGPS = vehicles.filter(v => v.current_latitude && v.current_longitude);
  const activeVehicles = vehiclesWithGPS.filter(v => v.status === 'active');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Fleet Map View
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            {activeVehicles.length} active
          </Badge>
          <Badge variant="secondary">
            {vehiclesWithGPS.length} tracked
          </Badge>
          <Button variant="ghost" size="sm" onClick={fetchVehicles} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="h-[350px]">
          <KenyaFleetMap vehicles={vehicles} />
        </div>
      </CardContent>
    </Card>
  );
};
