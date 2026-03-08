import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardCheck, Truck, AlertTriangle, CheckCircle2, ShieldAlert, FileDown, Loader2 } from "lucide-react";
import { format, isPast, addDays } from "date-fns";

interface VehicleInventory {
  id: string;
  license_plate: string;
  vehicle_type: string;
  status: string;
  maintenance_status: string | null;
  insurance_expiry: string | null;
  last_service_date: string | null;
  route_assigned: string | null;
  fuel_efficiency_kml: number | null;
}

export const InventoryCheck = () => {
  const [vehicles, setVehicles] = useState<VehicleInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from("vehicles")
      .select("id, license_plate, vehicle_type, status, maintenance_status, insurance_expiry, last_service_date, route_assigned, fuel_efficiency_kml")
      .order("license_plate");
    setVehicles(data || []);
    setLoading(false);
  };

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === "active").length;
  const inMaintenance = vehicles.filter(v => v.status === "maintenance").length;
  const expiredInsurance = vehicles.filter(v => v.insurance_expiry && isPast(new Date(v.insurance_expiry))).length;
  const expiringInsurance = vehicles.filter(v => v.insurance_expiry && !isPast(new Date(v.insurance_expiry)) && isPast(addDays(new Date(), -30))).length;
  const needsAttention = vehicles.filter(v => v.maintenance_status === "needs_attention" || v.maintenance_status === "critical").length;

  const getStatusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default", maintenance: "secondary", inactive: "outline",
    };
    return <Badge variant={map[status] || "outline"}>{status}</Badge>;
  };

  const getMaintenanceBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      good: "default", needs_attention: "secondary", critical: "destructive",
    };
    return <Badge variant={map[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  const getInsuranceStatus = (expiry: string | null) => {
    if (!expiry) return <span className="text-xs text-muted-foreground">Not set</span>;
    const date = new Date(expiry);
    if (isPast(date)) return <Badge variant="destructive">Expired</Badge>;
    const daysLeft = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) return <Badge variant="secondary">{daysLeft}d left</Badge>;
    return <span className="text-xs text-muted-foreground">{format(date, "dd MMM yyyy")}</span>;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <ClipboardCheck className="h-8 w-8 animate-pulse mx-auto text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          Fleet Inventory Check
        </h2>
        <p className="text-muted-foreground">Vehicle count verification and asset status overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Registered vehicles</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{activeVehicles}</div>
            <p className="text-xs text-muted-foreground">{totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0}% operational</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">In Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{inMaintenance}</div>
            <p className="text-xs text-muted-foreground">{needsAttention} needs attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Insurance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{expiredInsurance}</div>
            <p className="text-xs text-muted-foreground">{expiredInsurance} expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehicle Register</CardTitle>
          <CardDescription>Read-only inventory verification — {totalVehicles} vehicles on record</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Efficiency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono font-medium">{v.license_plate}</TableCell>
                    <TableCell className="capitalize">{v.vehicle_type}</TableCell>
                    <TableCell>{getStatusBadge(v.status)}</TableCell>
                    <TableCell>{getMaintenanceBadge(v.maintenance_status)}</TableCell>
                    <TableCell>{getInsuranceStatus(v.insurance_expiry)}</TableCell>
                    <TableCell className="text-sm">{v.route_assigned || "—"}</TableCell>
                    <TableCell className="text-sm">{v.fuel_efficiency_kml ? `${v.fuel_efficiency_kml} km/L` : "—"}</TableCell>
                  </TableRow>
                ))}
                {vehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No vehicles found in fleet registry.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(expiredInsurance > 0 || needsAttention > 0) && (
        <Card className="border-l-4 border-l-destructive bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Inventory Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {expiredInsurance > 0 && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{expiredInsurance} vehicle(s) with expired insurance</span>
                </div>
              )}
              {needsAttention > 0 && (
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{needsAttention} vehicle(s) flagged for maintenance attention</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
