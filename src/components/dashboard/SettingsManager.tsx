import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const SettingsManager = () => {
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [newVehicleType, setNewVehicleType] = useState({ name: "", description: "" });
  const [newRoute, setNewRoute] = useState({ name: "", start_location: "", end_location: "", distance_km: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [typesRes, routesRes] = await Promise.all([
      supabase.from("vehicle_types").select("*").order("name"),
      supabase.from("routes_master").select("*").order("name"),
    ]);
    setVehicleTypes(typesRes.data || []);
    setRoutes(routesRes.data || []);
  };

  const addVehicleType = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("vehicle_types").insert([newVehicleType]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Vehicle type added" });
      setNewVehicleType({ name: "", description: "" });
      fetchData();
    }
  };

  const deleteVehicleType = async (id: string) => {
    if (!confirm("Delete this vehicle type?")) return;
    const { error } = await supabase.from("vehicle_types").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Vehicle type deleted" });
      fetchData();
    }
  };

  const addRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...newRoute,
      distance_km: newRoute.distance_km ? parseFloat(newRoute.distance_km) : null,
    };
    const { error } = await supabase.from("routes_master").insert([payload]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Route added" });
      setNewRoute({ name: "", start_location: "", end_location: "", distance_km: "" });
      fetchData();
    }
  };

  const deleteRoute = async (id: string) => {
    if (!confirm("Delete this route?")) return;
    const { error } = await supabase.from("routes_master").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Route deleted" });
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Fleet Settings</h2>
      </div>

      {/* Vehicle Types Management */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addVehicleType} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>Type Name *</Label>
              <Input
                value={newVehicleType.name}
                onChange={(e) => setNewVehicleType({ ...newVehicleType, name: e.target.value })}
                placeholder="e.g., Truck - 15 Ton"
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newVehicleType.description}
                onChange={(e) => setNewVehicleType({ ...newVehicleType, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </div>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicleTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell>{type.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => deleteVehicleType(type.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Routes Management */}
      <Card>
        <CardHeader>
          <CardTitle>Routes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addRoute} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>Route Name *</Label>
              <Input
                value={newRoute.name}
                onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                placeholder="e.g., Nairobi-Mombasa"
                required
              />
            </div>
            <div>
              <Label>Start Location *</Label>
              <Input
                value={newRoute.start_location}
                onChange={(e) => setNewRoute({ ...newRoute, start_location: e.target.value })}
                placeholder="e.g., Nairobi"
                required
              />
            </div>
            <div>
              <Label>End Location *</Label>
              <Input
                value={newRoute.end_location}
                onChange={(e) => setNewRoute({ ...newRoute, end_location: e.target.value })}
                placeholder="e.g., Mombasa"
                required
              />
            </div>
            <div>
              <Label>Distance (km)</Label>
              <Input
                type="number"
                value={newRoute.distance_km}
                onChange={(e) => setNewRoute({ ...newRoute, distance_km: e.target.value })}
                placeholder="480"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Route
              </Button>
            </div>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>{route.start_location}</TableCell>
                  <TableCell>{route.end_location}</TableCell>
                  <TableCell>{route.distance_km ? `${route.distance_km} km` : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => deleteRoute(route.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
