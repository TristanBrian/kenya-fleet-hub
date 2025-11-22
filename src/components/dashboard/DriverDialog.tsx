import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface DriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: any;
  onSuccess: () => void;
}

export const DriverDialog = ({ open, onOpenChange, driver, onSuccess }: DriverDialogProps) => {
  const [formData, setFormData] = useState({
    license_number: "",
    performance_score: "100",
    total_trips: "0",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (driver) {
      setFormData({
        license_number: driver.license_number || "",
        performance_score: driver.performance_score?.toString() || "100",
        total_trips: driver.total_trips?.toString() || "0",
      });
    } else {
      setFormData({
        license_number: "",
        performance_score: "100",
        total_trips: "0",
      });
    }
  }, [driver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For new drivers, we need a user account first
    if (!driver) {
      toast({ 
        title: "Note", 
        description: "Driver creation requires user account setup. This is a simplified demo.",
        variant: "default"
      });
      return;
    }

    const payload = {
      license_number: formData.license_number,
      performance_score: parseInt(formData.performance_score),
      total_trips: parseInt(formData.total_trips),
    };

    const { error } = await supabase
      .from("drivers")
      .update(payload)
      .eq("id", driver.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Driver updated" });
      onSuccess();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{driver ? "Edit" : "Add"} Driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>License Number</Label>
            <Input
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              placeholder="DL-12345"
              required
            />
          </div>
          <div>
            <Label>Performance Score (0-100)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.performance_score}
              onChange={(e) => setFormData({ ...formData, performance_score: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Total Trips</Label>
            <Input
              type="number"
              min="0"
              value={formData.total_trips}
              onChange={(e) => setFormData({ ...formData, total_trips: e.target.value })}
              required
            />
          </div>
          {!driver && (
            <p className="text-sm text-muted-foreground">
              Note: New driver creation requires proper user account setup with authentication.
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            {driver && <Button type="submit">Update</Button>}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
