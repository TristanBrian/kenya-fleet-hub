import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Users, Wrench, MapPin, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    totalDrivers: 0,
    activeTrips: 0,
    completedTrips: 0,
  });

  useEffect(() => {
    fetchStats();
    const channel = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, fetchStats)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchStats = async () => {
    const [vehicles, drivers, trips] = await Promise.all([
      supabase.from("vehicles").select("status"),
      supabase.from("drivers").select("id"),
      supabase.from("trips").select("status"),
    ]);

    setStats({
      totalVehicles: vehicles.data?.length || 0,
      activeVehicles: vehicles.data?.filter(v => v.status === 'active').length || 0,
      maintenanceVehicles: vehicles.data?.filter(v => v.status === 'maintenance').length || 0,
      totalDrivers: drivers.data?.length || 0,
      activeTrips: trips.data?.filter(t => t.status === 'in_progress').length || 0,
      completedTrips: trips.data?.filter(t => t.status === 'completed').length || 0,
    });
  };

  const statCards = [
    { title: "Total Vehicles", value: stats.totalVehicles, icon: Truck, color: "text-primary" },
    { title: "Active", value: stats.activeVehicles, icon: MapPin, color: "text-success" },
    { title: "In Maintenance", value: stats.maintenanceVehicles, icon: Wrench, color: "text-warning" },
    { title: "Total Drivers", value: stats.totalDrivers, icon: Users, color: "text-info" },
    { title: "Active Trips", value: stats.activeTrips, icon: TrendingUp, color: "text-primary" },
    { title: "Completed", value: stats.completedTrips, icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the tabs above to manage vehicles, drivers, trips, maintenance records, and view detailed analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
