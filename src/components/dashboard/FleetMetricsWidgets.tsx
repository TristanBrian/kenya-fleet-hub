import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Truck, TrendingUp, Clock, Fuel, CheckCircle, XCircle } from "lucide-react";

interface FleetMetrics {
  vehiclesOperational: number;
  vehiclesOutOfService: number;
  totalVehicles: number;
  onTimePercentage: number;
  tripsCompletedToday: number;
  tripsScheduledToday: number;
  totalFuelConsumption: number;
  avgFuelEfficiency: number;
}

export const FleetMetricsWidgets = () => {
  const [metrics, setMetrics] = useState<FleetMetrics>({
    vehiclesOperational: 0,
    vehiclesOutOfService: 0,
    totalVehicles: 0,
    onTimePercentage: 0,
    tripsCompletedToday: 0,
    tripsScheduledToday: 0,
    totalFuelConsumption: 0,
    avgFuelEfficiency: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    
    const channel = supabase
      .channel('metrics-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_logs' }, fetchMetrics)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);

    // Fetch vehicles
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("status, fuel_efficiency_kml, monthly_fuel_consumption_liters");

    const totalVehicles = vehicles?.length || 0;
    const vehiclesOperational = vehicles?.filter(v => v.status === 'active' || v.status === 'idle').length || 0;
    const vehiclesOutOfService = vehicles?.filter(v => v.status === 'maintenance' || v.status === 'inactive').length || 0;

    // Calculate average fuel efficiency
    const avgFuelEfficiency = vehicles?.reduce((acc, v) => acc + (v.fuel_efficiency_kml || 0), 0) / (totalVehicles || 1);
    const totalFuelConsumption = vehicles?.reduce((acc, v) => acc + (v.monthly_fuel_consumption_liters || 0), 0) || 0;

    // Fetch today's trips
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: trips } = await supabase
      .from("trips")
      .select("status, start_time, end_time, estimated_duration_hours")
      .gte("start_time", today.toISOString())
      .lt("start_time", tomorrow.toISOString());

    const tripsScheduledToday = trips?.length || 0;
    const tripsCompletedToday = trips?.filter(t => t.status === 'completed').length || 0;

    // Calculate on-time percentage (trips completed within estimated duration)
    const completedTrips = trips?.filter(t => t.status === 'completed' && t.end_time && t.start_time);
    let onTimeCount = 0;
    completedTrips?.forEach(trip => {
      if (trip.estimated_duration_hours) {
        const actualDuration = (new Date(trip.end_time!).getTime() - new Date(trip.start_time).getTime()) / (1000 * 60 * 60);
        if (actualDuration <= trip.estimated_duration_hours * 1.1) { // 10% buffer
          onTimeCount++;
        }
      }
    });
    const onTimePercentage = completedTrips?.length ? (onTimeCount / completedTrips.length) * 100 : 100;

    setMetrics({
      vehiclesOperational,
      vehiclesOutOfService,
      totalVehicles,
      onTimePercentage,
      tripsCompletedToday,
      tripsScheduledToday,
      totalFuelConsumption,
      avgFuelEfficiency,
    });
    setLoading(false);
  };

  const operationalPercentage = metrics.totalVehicles > 0 
    ? (metrics.vehiclesOperational / metrics.totalVehicles) * 100 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Vehicles Operational */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Fleet Status</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-success">{metrics.vehiclesOperational}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-lg text-muted-foreground">{metrics.totalVehicles}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Operational vehicles</p>
          <Progress value={operationalPercentage} className="mt-2 h-2" />
          <div className="flex justify-between mt-2 text-xs">
            <span className="flex items-center gap-1 text-success">
              <CheckCircle className="h-3 w-3" />
              {metrics.vehiclesOperational} active
            </span>
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="h-3 w-3" />
              {metrics.vehiclesOutOfService} down
            </span>
          </div>
        </CardContent>
      </Card>

      {/* On-Time Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.onTimePercentage.toFixed(0)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Trips completed on schedule</p>
          <Progress 
            value={metrics.onTimePercentage} 
            className={`mt-2 h-2 ${metrics.onTimePercentage >= 80 ? '[&>div]:bg-success' : metrics.onTimePercentage >= 60 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'}`}
          />
        </CardContent>
      </Card>

      {/* Today's Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Today's Trips</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{metrics.tripsCompletedToday}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-lg text-muted-foreground">{metrics.tripsScheduledToday}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Completed vs scheduled</p>
          <Progress 
            value={metrics.tripsScheduledToday > 0 ? (metrics.tripsCompletedToday / metrics.tripsScheduledToday) * 100 : 0} 
            className="mt-2 h-2"
          />
        </CardContent>
      </Card>

      {/* Fuel Consumption */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Fuel Metrics</CardTitle>
          <Fuel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalFuelConsumption.toLocaleString()}L
          </div>
          <p className="text-xs text-muted-foreground mt-1">Monthly consumption</p>
          <div className="mt-2 pt-2 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg efficiency</span>
              <span className="font-medium">{metrics.avgFuelEfficiency.toFixed(1)} km/L</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
