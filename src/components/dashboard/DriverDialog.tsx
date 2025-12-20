import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, User, Key, Mail, Phone, CreditCard, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: any;
  onSuccess: () => void;
}

interface Vehicle {
  id: string;
  license_plate: string;
  vehicle_type: string;
}

export const DriverDialog = ({ open, onOpenChange, driver, onSuccess }: DriverDialogProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    mobile_phone: "",
    license_number: "",
    vehicle_id: "",
    performance_score: "100",
    total_trips: "0",
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (driver) {
      setFormData({
        full_name: driver.profiles?.full_name || "",
        email: "",
        mobile_phone: driver.profiles?.mobile_phone || "",
        license_number: driver.license_number || "",
        vehicle_id: driver.vehicle_id || "",
        performance_score: driver.performance_score?.toString() || "100",
        total_trips: driver.total_trips?.toString() || "0",
      });
      setCredentials(null);
    } else {
      setFormData({
        full_name: "",
        email: "",
        mobile_phone: "",
        license_number: "",
        vehicle_id: "",
        performance_score: "100",
        total_trips: "0",
      });
      setCredentials(null);
    }
  }, [driver, open]);

  const fetchVehicles = async () => {
    const { data } = await supabase.from("vehicles").select("id, license_plate, vehicle_type").order("license_plate");
    setVehicles(data || []);
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-driver", {
        body: {
          email: formData.email,
          full_name: formData.full_name,
          mobile_phone: formData.mobile_phone,
          license_number: formData.license_number,
          vehicle_id: formData.vehicle_id || null,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setCredentials(data.credentials);
      toast({ title: "Mafanikio!", description: "Driver account created. Share the credentials below." });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      license_number: formData.license_number,
      performance_score: parseInt(formData.performance_score),
      total_trips: parseInt(formData.total_trips),
      vehicle_id: formData.vehicle_id || null,
    };

    const { error } = await supabase.from("drivers").update(payload).eq("id", driver.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mafanikio!", description: "Driver updated" });
      onSuccess();
      onOpenChange(false);
    }
    setLoading(false);
  };

  const copyCredentials = () => {
    if (credentials) {
      navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Credentials copied to clipboard" });
    }
  };

  const handleClose = () => {
    setCredentials(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {driver ? "Edit Driver" : "Create New Driver"}
          </DialogTitle>
          <DialogDescription>
            {driver ? "Update driver information" : "Create a driver account with login credentials"}
          </DialogDescription>
        </DialogHeader>

        {credentials ? (
          <div className="space-y-4">
            <Card className="bg-success/10 border-success">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-success mb-3">Driver Login Credentials</h4>
                <p className="text-sm text-muted-foreground mb-4">Share these credentials with the driver securely:</p>
                <div className="space-y-2 bg-background p-3 rounded-md font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Email:</span> {credentials.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Password:</span> {credentials.password}
                  </div>
                </div>
                <Button onClick={copyCredentials} className="w-full mt-4" variant="outline">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Credentials"}
                </Button>
              </CardContent>
            </Card>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        ) : (
          <form onSubmit={driver ? handleUpdateDriver : handleCreateDriver} className="space-y-4">
            {!driver && (
              <>
                <div>
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Full Name *
                  </Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Kamau"
                    required
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email *
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="driver@safirismart.co.ke"
                    required
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Mobile Phone
                  </Label>
                  <Input
                    value={formData.mobile_phone}
                    onChange={(e) => setFormData({ ...formData, mobile_phone: e.target.value })}
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
              </>
            )}
            <div>
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> License Number *
              </Label>
              <Input
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                placeholder="DL-12345"
                required
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Car className="h-4 w-4" /> Assign Vehicle
              </Label>
              <Select value={formData.vehicle_id || "none"} onValueChange={(v) => setFormData({ ...formData, vehicle_id: v === "none" ? "" : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No vehicle assigned</SelectItem>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.license_plate} - {v.vehicle_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {driver && (
              <>
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
              </>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : driver ? "Update Driver" : "Create Driver"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
