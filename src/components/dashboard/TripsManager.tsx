import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { TripDialog } from "./TripDialog";
import { Progress } from "@/components/ui/progress";

interface Trip {
  id: string;
  route: string;
  start_location: string;
  end_location: string;
  status: string;
  start_time: string;
  progress_percent: number;
  distance_km: number | null;
  vehicle_id: string;
  driver_id: string | null;
  vehicles: { license_plate: string } | null;
  drivers: { profiles: { full_name: string } | null } | null;
}

export const TripsManager = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrips();
    
    // Real-time subscription
    const channel = supabase
      .channel("trips-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, () => {
        fetchTrips();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trips")
      .select(`
        *,
        vehicles(license_plate),
        drivers(profiles(full_name))
      `)
      .order("start_time", { ascending: false })
      .limit(50);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTrips(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip?")) return;
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Trip deleted" });
      fetchTrips();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className?: string }> = {
      scheduled: { variant: "outline" },
      in_progress: { variant: "default", className: "bg-primary" },
      completed: { variant: "secondary", className: "bg-success text-success-foreground" },
      cancelled: { variant: "destructive" }
    };
    const config = variants[status] || { variant: "outline" };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-8 w-8 animate-pulse mx-auto text-primary" />
        <p className="text-muted-foreground mt-2">Loading trips...</p>
      </div>
    );
  }

  const activeTrips = trips.filter(t => t.status === 'in_progress').length;
  const scheduledTrips = trips.filter(t => t.status === 'scheduled').length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Trips</h2>
          <div className="flex gap-4 mt-1">
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">{activeTrips}</span> in progress
            </span>
            <span className="text-sm text-muted-foreground">
              <span className="font-medium">{scheduledTrips}</span> scheduled
            </span>
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-success">{completedTrips}</span> completed
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTrips}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setSelectedTrip(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{trip.route}</span>
                      <p className="text-xs text-muted-foreground">
                        {trip.start_location} → {trip.end_location}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{trip.vehicles?.license_plate || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>{trip.drivers?.profiles?.full_name || "-"}</TableCell>
                  <TableCell>{format(new Date(trip.start_time), "dd MMM, HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={trip.progress_percent} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-10">{trip.progress_percent}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(trip.status)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedTrip(trip); setDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(trip.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {trips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No trips found. Click "New Trip" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TripDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trip={selectedTrip}
        onSuccess={fetchTrips}
      />
    </div>
  );
};
