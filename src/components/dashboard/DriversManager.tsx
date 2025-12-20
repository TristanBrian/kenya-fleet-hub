import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, User, Pencil, Trash2, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { DriverDialog } from "./DriverDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Driver {
  id: string;
  user_id: string | null;
  license_number: string;
  performance_score: number;
  total_trips: number;
  vehicle_id: string | null;
  profiles: { full_name: string; mobile_phone: string | null } | null;
  vehicles: { license_plate: string; vehicle_type: string } | null;
}

export const DriversManager = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
    
    // Real-time subscription
    const channel = supabase
      .channel("drivers-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, () => {
        fetchDrivers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select(`
        *,
        profiles(full_name, mobile_phone),
        vehicles(license_plate, vehicle_type)
      `)
      .order("performance_score", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setDrivers(data || []);
    }
    setLoading(false);
  };

  const handleDeleteDriver = async () => {
    if (!driverToDelete) return;
    
    const { error } = await supabase
      .from("drivers")
      .delete()
      .eq("id", driverToDelete.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Driver removed from fleet" });
      fetchDrivers();
    }
    setDeleteDialogOpen(false);
    setDriverToDelete(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-yellow-500";
    return "text-destructive";
  };

  if (loading) {
    return <div className="text-center py-8"><User className="h-8 w-8 animate-pulse mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Drivers ({drivers.length})</h2>
        <Button onClick={() => { setSelectedDriver(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Assigned Vehicle</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Total Trips</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.profiles?.full_name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{driver.license_number}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {driver.profiles?.mobile_phone || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {driver.vehicles ? (
                      <Badge variant="secondary">
                        {driver.vehicles.license_plate} - {driver.vehicles.vehicle_type}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress value={driver.performance_score} className="w-20 h-2" />
                      <span className={`font-bold ${getScoreColor(driver.performance_score)}`}>
                        {driver.performance_score}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{driver.total_trips}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedDriver(driver); setDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => { setDriverToDelete(driver); setDeleteDialogOpen(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {drivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No drivers found. Click "Add Driver" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DriverDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        driver={selectedDriver}
        onSuccess={fetchDrivers}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Driver?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {driverToDelete?.profiles?.full_name || "this driver"} from the fleet. 
              The user account will remain but they will no longer be registered as a driver.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDriver} className="bg-destructive text-destructive-foreground">
              Remove Driver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};