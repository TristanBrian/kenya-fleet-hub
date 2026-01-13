import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface TripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: any;
  onSuccess: () => void;
}

interface Vehicle {
  id: string;
  license_plate: string;
}

interface Driver {
  id: string;
  profiles: { full_name: string } | null;
}

interface Route {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  distance_km: number | null;
}

export const TripDialog = ({ open, onOpenChange, trip, onSuccess }: TripDialogProps) => {
  const [formData, setFormData] = useState({
    vehicle_id: "",
    driver_id: "",
    route: "",
    start_location: "",
    end_location: "",
    start_time: new Date().toISOString().slice(0, 16),
    estimated_duration_hours: "",
    distance_km: "",
    status: "scheduled",
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (trip) {
      setFormData({
        vehicle_id: trip.vehicle_id || "",
        driver_id: trip.driver_id || "",
        route: trip.route || "",
        start_location: trip.start_location || "",
        end_location: trip.end_location || "",
        start_time: trip.start_time ? new Date(trip.start_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
        estimated_duration_hours: trip.estimated_duration_hours?.toString() || "",
        distance_km: trip.distance_km?.toString() || "",
        status: trip.status || "scheduled",
      });
    } else {
      setFormData({
        vehicle_id: "",
        driver_id: "",
        route: "",
        start_location: "",
        end_location: "",
        start_time: new Date().toISOString().slice(0, 16),
        estimated_duration_hours: "",
        distance_km: "",
        status: "scheduled",
      });
    }
  }, [trip, open]);

  const fetchData = async () => {
    const [vehiclesRes, driversRes, routesRes] = await Promise.all([
      supabase.from("vehicles").select("id, license_plate").eq("status", "active").order("license_plate"),
      supabase.from("drivers").select("id, profiles(full_name)").order("created_at"),
      supabase.from("routes_master").select("*").order("name"),
    ]);
    setVehicles(vehiclesRes.data || []);
    setDrivers(driversRes.data || []);
    setRoutes(routesRes.data || []);
  };

  const handleRouteSelect = (routeName: string) => {
    const selectedRoute = routes.find(r => r.name === routeName);
    if (selectedRoute) {
      setFormData({
        ...formData,
        route: routeName,
        start_location: selectedRoute.start_location,
        end_location: selectedRoute.end_location,
        distance_km: selectedRoute.distance_km?.toString() || "",
      });
    } else {
      setFormData({ ...formData, route: routeName });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.vehicle_id) {
      toast({ title: "Error", description: "Please select a vehicle", variant: "destructive" });
      return;
    }
    
    if (!formData.route.trim()) {
      toast({ title: "Error", description: "Please select or enter a route", variant: "destructive" });
      return;
    }
    
    if (!formData.start_location.trim() || !formData.end_location.trim()) {
      toast({ title: "Error", description: "Start and end locations are required", variant: "destructive" });
      return;
    }
    
    setLoading(true);

    const payload = {
      vehicle_id: formData.vehicle_id,
      driver_id: formData.driver_id || null,
      route: formData.route.trim(),
      start_location: formData.start_location.trim(),
      end_location: formData.end_location.trim(),
      start_time: formData.start_time,
      estimated_duration_hours: formData.estimated_duration_hours ? parseFloat(formData.estimated_duration_hours) : null,
      distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
      status: formData.status,
      progress_percent: trip?.progress_percent || 0,
    };

    const { error } = trip
      ? await supabase.from("trips").update(payload).eq("id", trip.id)
      : await supabase.from("trips").insert([payload]);

    if (error) {
      console.error("Trip save error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mafanikio!", description: `Trip ${trip ? "updated" : "created"} successfully` });
      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{trip ? "Edit Trip" : "Create New Trip"}</DialogTitle>
          <DialogDescription>
            {trip ? "Update trip details" : "Schedule a new trip for your fleet"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trip-vehicle">Vehicle *</Label>
              <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({ ...formData, vehicle_id: v })} required>
                <SelectTrigger id="trip-vehicle">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.license_plate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="trip-driver">Driver</Label>
              <Select value={formData.driver_id || "none"} onValueChange={(v) => setFormData({ ...formData, driver_id: v === "none" ? "" : v })}>
                <SelectTrigger id="trip-driver">
                  <SelectValue placeholder="Assign driver (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No driver assigned</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.profiles?.full_name || "Unknown"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="trip-route">Route *</Label>
            <Select value={formData.route} onValueChange={handleRouteSelect} required>
              <SelectTrigger id="trip-route">
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((r) => (
                  <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trip-start-location">Start Location *</Label>
              <Input
                id="trip-start-location"
                value={formData.start_location}
                onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                placeholder="e.g., Nairobi"
                required
              />
            </div>
            <div>
              <Label htmlFor="trip-end-location">End Location *</Label>
              <Input
                id="trip-end-location"
                value={formData.end_location}
                onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                placeholder="e.g., Mombasa"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trip-start-time">Start Time *</Label>
              <Input
                id="trip-start-time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="trip-status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger id="trip-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trip-duration">Estimated Duration (hours)</Label>
              <Input
                id="trip-duration"
                type="number"
                step="0.5"
                value={formData.estimated_duration_hours}
                onChange={(e) => setFormData({ ...formData, estimated_duration_hours: e.target.value })}
                placeholder="e.g., 8"
              />
            </div>
            <div>
              <Label htmlFor="trip-distance">Distance (km)</Label>
              <Input
                id="trip-distance"
                type="number"
                value={formData.distance_km}
                onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                placeholder="e.g., 480"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : trip ? "Update Trip" : "Create Trip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
