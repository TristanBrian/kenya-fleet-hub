import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface MaintenanceLog {
  id: string;
  service_type: string;
  description: string | null;
  date_performed: string;
  cost_kes: number;
  next_due_date: string | null;
  performed_by: string | null;
  vehicles: {
    license_plate: string;
    vehicle_type: string;
  };
}

const Maintenance = () => {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceLogs();
  }, []);

  const fetchMaintenanceLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("maintenance_logs")
        .select(`
          *,
          vehicles (
            license_plate,
            vehicle_type
          )
        `)
        .order("date_performed", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching maintenance logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalCost = logs.reduce((sum, log) => sum + Number(log.cost_kes), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wrench className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading maintenance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Maintenance & Service</h1>
        <p className="text-muted-foreground">
          Track vehicle maintenance costs and schedules
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle>Maintenance Overview</CardTitle>
          <CardDescription>Total service costs in KES</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(totalCost)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Across {logs.length} service records
          </p>
        </CardContent>
      </Card>

      {/* Maintenance Logs */}
      {logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No maintenance records</p>
            <p className="text-sm text-muted-foreground">
              Service records will appear here once logged
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Wrench className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{log.service_type}</CardTitle>
                      <CardDescription className="mt-1">
                        {log.vehicles?.license_plate} - {log.vehicles?.vehicle_type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg font-bold">
                    {formatCurrency(Number(log.cost_kes))}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {log.description && (
                  <p className="text-sm text-muted-foreground">{log.description}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Performed:</span>
                    <span className="font-medium">
                      {format(new Date(log.date_performed), "dd MMM yyyy")}
                    </span>
                  </div>
                  
                  {log.next_due_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-warning" />
                      <span className="text-muted-foreground">Next Due:</span>
                      <span className="font-medium">
                        {format(new Date(log.next_due_date), "dd MMM yyyy")}
                      </span>
                    </div>
                  )}
                </div>

                {log.performed_by && (
                  <p className="text-sm text-muted-foreground border-t pt-2">
                    Performed by: <span className="font-medium">{log.performed_by}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Maintenance;
