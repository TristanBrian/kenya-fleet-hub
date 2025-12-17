import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Wrench, Clock, Bell, CheckCircle, X } from "lucide-react";
import { format, differenceInDays, isPast, addDays } from "date-fns";
import { toast } from "sonner";

interface Alert {
  id: string;
  type: "critical" | "maintenance" | "schedule";
  title: string;
  description: string;
  timestamp: Date;
  vehicleId?: string;
  licensePlate?: string;
  acknowledged: boolean;
}

export const AlertPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    const channel = supabase
      .channel('alerts-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, fetchAlerts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_logs' }, fetchAlerts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, fetchAlerts)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    const generatedAlerts: Alert[] = [];

    // Fetch maintenance alerts (vehicles overdue for service)
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("id, license_plate, last_service_date, insurance_expiry, maintenance_status");

    vehicles?.forEach(vehicle => {
      // Check maintenance status
      if (vehicle.maintenance_status === 'needs_service' || vehicle.maintenance_status === 'critical') {
        generatedAlerts.push({
          id: `maint-${vehicle.id}`,
          type: vehicle.maintenance_status === 'critical' ? 'critical' : 'maintenance',
          title: vehicle.maintenance_status === 'critical' ? 'Critical Maintenance Required' : 'Service Due',
          description: `${vehicle.license_plate} requires immediate attention`,
          timestamp: new Date(),
          vehicleId: vehicle.id,
          licensePlate: vehicle.license_plate,
          acknowledged: false,
        });
      }

      // Check last service date (if more than 30 days ago)
      if (vehicle.last_service_date) {
        const daysSinceService = differenceInDays(new Date(), new Date(vehicle.last_service_date));
        if (daysSinceService > 30) {
          generatedAlerts.push({
            id: `service-${vehicle.id}`,
            type: 'maintenance',
            title: 'Service Overdue',
            description: `${vehicle.license_plate} last serviced ${daysSinceService} days ago`,
            timestamp: new Date(vehicle.last_service_date),
            vehicleId: vehicle.id,
            licensePlate: vehicle.license_plate,
            acknowledged: false,
          });
        }
      }

      // Check insurance expiry
      if (vehicle.insurance_expiry) {
        const daysUntilExpiry = differenceInDays(new Date(vehicle.insurance_expiry), new Date());
        if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
          generatedAlerts.push({
            id: `insurance-${vehicle.id}`,
            type: 'maintenance',
            title: 'Insurance Expiring Soon',
            description: `${vehicle.license_plate} insurance expires in ${daysUntilExpiry} days`,
            timestamp: new Date(vehicle.insurance_expiry),
            vehicleId: vehicle.id,
            licensePlate: vehicle.license_plate,
            acknowledged: false,
          });
        } else if (isPast(new Date(vehicle.insurance_expiry))) {
          generatedAlerts.push({
            id: `insurance-expired-${vehicle.id}`,
            type: 'critical',
            title: 'Insurance Expired',
            description: `${vehicle.license_plate} insurance has expired!`,
            timestamp: new Date(vehicle.insurance_expiry),
            vehicleId: vehicle.id,
            licensePlate: vehicle.license_plate,
            acknowledged: false,
          });
        }
      }
    });

    // Fetch schedule deviation alerts (trips that are delayed)
    const { data: trips } = await supabase
      .from("trips")
      .select("id, route, vehicle_id, start_time, estimated_duration_hours, progress_percent, status")
      .eq("status", "in_progress");

    trips?.forEach(trip => {
      if (trip.estimated_duration_hours && trip.start_time) {
        const startTime = new Date(trip.start_time);
        const expectedEndTime = addDays(startTime, trip.estimated_duration_hours / 24);
        const progress = trip.progress_percent || 0;
        
        // If trip should be more than 80% complete but isn't
        const hoursElapsed = differenceInDays(new Date(), startTime) * 24;
        const expectedProgress = Math.min((hoursElapsed / trip.estimated_duration_hours) * 100, 100);
        
        if (expectedProgress > 80 && progress < expectedProgress - 20) {
          const vehicle = vehicles?.find(v => v.id === trip.vehicle_id);
          generatedAlerts.push({
            id: `delay-${trip.id}`,
            type: 'schedule',
            title: 'Schedule Deviation',
            description: `${vehicle?.license_plate || 'Vehicle'} on ${trip.route} is behind schedule`,
            timestamp: new Date(),
            vehicleId: trip.vehicle_id,
            licensePlate: vehicle?.license_plate,
            acknowledged: false,
          });
        }
      }
    });

    // Sort by type priority (critical > maintenance > schedule) then by timestamp
    generatedAlerts.sort((a, b) => {
      const priority = { critical: 0, maintenance: 1, schedule: 2 };
      if (priority[a.type] !== priority[b.type]) {
        return priority[a.type] - priority[b.type];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setAlerts(generatedAlerts);
    setLoading(false);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
    toast.success("Alert acknowledged");
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.info("Alert dismissed");
  };

  const getAlertStyle = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return {
          bg: "bg-destructive/10 border-destructive/30",
          icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
          badge: <Badge variant="destructive">Critical</Badge>
        };
      case "maintenance":
        return {
          bg: "bg-warning/10 border-warning/30",
          icon: <Wrench className="h-4 w-4 text-warning" />,
          badge: <Badge className="bg-warning text-warning-foreground">Maintenance</Badge>
        };
      case "schedule":
        return {
          bg: "bg-yellow-500/10 border-yellow-500/30",
          icon: <Clock className="h-4 w-4 text-yellow-600" />,
          badge: <Badge variant="outline" className="border-yellow-500 text-yellow-600">Schedule</Badge>
        };
    }
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Alert Panel
          {unacknowledgedAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unacknowledgedAlerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-success" />
              <span>All clear! No active alerts.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const style = getAlertStyle(alert.type);
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${style.bg} ${alert.acknowledged ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        {style.icon}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{alert.title}</span>
                            {style.badge}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!alert.acknowledged && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="h-7 px-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissAlert(alert.id)}
                          className="h-7 px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
