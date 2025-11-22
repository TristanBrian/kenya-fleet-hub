import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: any;
  onSuccess: () => void;
}

export const VehicleDialog = ({ open, onOpenChange, vehicle, onSuccess }: VehicleDialogProps) => {
  const [formData, setFormData] = useState({
    license_plate: "",
    vehicle_type: "",
    route_assigned: "",
    status: "active",
    fuel_efficiency_kml: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (vehicle) {
      setFormData({
        license_plate: vehicle.license_plate || "",
        vehicle_type: vehicle.vehicle_type || "",
        route_assigned: vehicle.route_assigned || "",
        status: vehicle.status || "active",
        fuel_efficiency_kml: vehicle.fuel_efficiency_kml?.toString() || "",
      });
    } else {
      setFormData({
        license_plate: "",
        vehicle_type: "",
        route_assigned: "",
        status: "active",
        fuel_efficiency_kml: "",
      });
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      fuel_efficiency_kml: formData.fuel_efficiency_kml ? parseFloat(formData.fuel_efficiency_kml) : null,
    };

    const { error } = vehicle
      ? await supabase.from("vehicles").update(payload).eq("id", vehicle.id)
      : await supabase.from("vehicles").insert([payload]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Vehicle ${vehicle ? "updated" : "created"}` });
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vehicle ? "Edit" : "Add"} Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>License Plate</Label>
            <Input
              value={formData.license_plate}
              onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Vehicle Type</Label>
            <Input
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Route Assigned</Label>
            <Input
              value={formData.route_assigned}
              onChange={(e) => setFormData({ ...formData, route_assigned: e.target.value })}
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Fuel Efficiency (km/L)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.fuel_efficiency_kml}
              onChange={(e) => setFormData({ ...formData, fuel_efficiency_kml: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
