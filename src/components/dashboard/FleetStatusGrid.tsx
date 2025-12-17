import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, MapPin, Clock, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";

interface VehicleWithDriver {
  id: string;
  license_plate: string;
  vehicle_type: string;
  status: string;
  route_assigned: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  last_location_update: string | null;
  driver_name?: string;
  next_stop?: string;
  eta?: string;
}

export const FleetStatusGrid = () => {
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
    
    const channel = supabase
      .channel('fleet-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, fetchVehicles)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, fetchVehicles)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, fetchVehicles)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    
    // Fetch vehicles with their assigned drivers and active trips
    const { data: vehiclesData } = await supabase
      .from("vehicles")
      .select("*")
      .order("license_plate");

    const { data: driversData } = await supabase
      .from("drivers")
      .select("vehicle_id, user_id");

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name");

    const { data: tripsData } = await supabase
      .from("trips")
      .select("*")
      .eq("status", "in_progress");

    // Map drivers to vehicles
    const vehiclesWithDrivers = vehiclesData?.map(vehicle => {
      const driver = driversData?.find(d => d.vehicle_id === vehicle.id);
      const profile = driver ? profilesData?.find(p => p.id === driver.user_id) : null;
      const activeTrip = tripsData?.find(t => t.vehicle_id === vehicle.id);

      return {
        ...vehicle,
        driver_name: profile?.full_name || "Unassigned",
        next_stop: activeTrip?.end_location || "-",
        eta: activeTrip?.estimated_duration_hours 
          ? `${activeTrip.estimated_duration_hours}h remaining`
          : "-"
      };
    }) || [];

    setVehicles(vehiclesWithDrivers);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "On Route", variant: "default" },
      idle: { label: "At Station", variant: "secondary" },
      maintenance: { label: "Maintenance", variant: "destructive" },
      inactive: { label: "Idle", variant: "outline" },
    };
    
    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getLocationDisplay = (vehicle: VehicleWithDriver) => {
    if (vehicle.current_latitude && vehicle.current_longitude) {
      const timeAgo = vehicle.last_location_update 
        ? formatDistanceToNow(new Date(vehicle.last_location_update), { addSuffix: true })
        : "Unknown";
      return (
        <div className="text-xs">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{vehicle.route_assigned || "No route"}</span>
          </div>
          <span className="text-muted-foreground">{timeAgo}</span>
        </div>
      );
    }
    return <span className="text-muted-foreground text-xs">No GPS data</span>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Live Fleet Status
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchVehicles} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Next Stop / ETA</TableHead>
                <TableHead>Driver</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {loading ? "Loading fleet data..." : "No vehicles found"}
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="font-medium">{vehicle.license_plate}</div>
                      <div className="text-xs text-muted-foreground">{vehicle.vehicle_type}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>{getLocationDisplay(vehicle)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{vehicle.next_stop}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {vehicle.eta}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{vehicle.driver_name}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
