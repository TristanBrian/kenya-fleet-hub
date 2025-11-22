import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, Pencil, Trash2 } from "lucide-react";
import { MaintenanceDialog } from "./MaintenanceDialog";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface MaintenanceLog {
  id: string;
  service_type: string;
  date_performed: string;
  cost_kes: number;
  next_due_date: string | null;
  vehicles: { license_plate: string } | null;
}

export const MaintenanceManager = () => {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("maintenance_logs")
      .select("*, vehicles(license_plate)")
      .order("date_performed", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this maintenance log?")) return;
    const { error } = await supabase.from("maintenance_logs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Log deleted" });
      fetchLogs();
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;
  const totalCost = logs.reduce((sum, log) => sum + Number(log.cost_kes), 0);

  if (loading) {
    return <div className="text-center py-8"><Wrench className="h-8 w-8 animate-pulse mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Maintenance</h2>
          <p className="text-muted-foreground">Total Cost: {formatCurrency(totalCost)}</p>
        </div>
        <Button onClick={() => { setSelectedLog(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Log
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.vehicles?.license_plate || "N/A"}</TableCell>
                  <TableCell>{log.service_type}</TableCell>
                  <TableCell>{format(new Date(log.date_performed), "dd MMM yyyy")}</TableCell>
                  <TableCell>{formatCurrency(Number(log.cost_kes))}</TableCell>
                  <TableCell>{log.next_due_date ? format(new Date(log.next_due_date), "dd MMM yyyy") : "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(log.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No maintenance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MaintenanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={selectedLog}
        onSuccess={fetchLogs}
      />
    </div>
  );
};
