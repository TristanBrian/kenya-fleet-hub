import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: any;
  onSuccess: () => void;
}

export const MaintenanceDialog = ({ open, onOpenChange, log, onSuccess }: MaintenanceDialogProps) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    service_type: "",
    description: "",
    date_performed: new Date().toISOString().split('T')[0],
    cost_kes: "",
    next_due_date: "",
    performed_by: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (log) {
      setFormData({
        vehicle_id: log.vehicle_id || "",
        service_type: log.service_type || "",
        description: log.description || "",
        date_performed: log.date_performed || new Date().toISOString().split('T')[0],
        cost_kes: log.cost_kes?.toString() || "",
        next_due_date: log.next_due_date || "",
        performed_by: log.performed_by || "",
      });
    }
  }, [log]);

  const fetchVehicles = async () => {
    const { data } = await supabase.from("vehicles").select("id, license_plate");
    setVehicles(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.vehicle_id) {
      toast({ title: "Error", description: "Please select a vehicle", variant: "destructive" });
      return;
    }
    
    if (!formData.service_type.trim()) {
      toast({ title: "Error", description: "Service type is required", variant: "destructive" });
      return;
    }
    
    if (!formData.cost_kes || parseFloat(formData.cost_kes) <= 0) {
      toast({ title: "Error", description: "Please enter a valid cost", variant: "destructive" });
      return;
    }
    
    const payload = {
      vehicle_id: formData.vehicle_id,
      service_type: formData.service_type.trim(),
      description: formData.description?.trim() || null,
      date_performed: formData.date_performed,
      cost_kes: parseFloat(formData.cost_kes),
      next_due_date: formData.next_due_date || null,
      performed_by: formData.performed_by?.trim() || null,
    };

    const { error } = log
      ? await supabase.from("maintenance_logs").update(payload).eq("id", log.id)
      : await supabase.from("maintenance_logs").insert([payload]);

    if (error) {
      console.error("Maintenance log save error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Maintenance log ${log ? "updated" : "created"} successfully` });
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{log ? "Edit" : "Add"} Maintenance Log</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="maintenance-vehicle">Vehicle</Label>
            <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({ ...formData, vehicle_id: v })} required>
              <SelectTrigger id="maintenance-vehicle">
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
            <Label htmlFor="maintenance-service-type">Service Type</Label>
            <Input
              id="maintenance-service-type"
              name="service_type"
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="maintenance-description">Description</Label>
            <Textarea
              id="maintenance-description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maintenance-date">Date Performed</Label>
              <Input
                id="maintenance-date"
                name="date_performed"
                type="date"
                value={formData.date_performed}
                onChange={(e) => setFormData({ ...formData, date_performed: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="maintenance-cost">Cost (KES)</Label>
              <Input
                id="maintenance-cost"
                name="cost_kes"
                type="number"
                value={formData.cost_kes}
                onChange={(e) => setFormData({ ...formData, cost_kes: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maintenance-next-due">Next Due Date</Label>
              <Input
                id="maintenance-next-due"
                name="next_due_date"
                type="date"
                value={formData.next_due_date}
                onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="maintenance-performed-by">Performed By</Label>
              <Input
                id="maintenance-performed-by"
                name="performed_by"
                value={formData.performed_by}
                onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
              />
            </div>
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
