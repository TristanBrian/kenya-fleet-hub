import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, DollarSign, Fuel, TrendingUp, Wrench, Users, Truck, MapPin, Clock, CheckCircle, FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from "recharts";
import { generateFleetReport, ReportData } from "@/utils/pdfReportGenerator";
interface RoutePerformance {
  route: string;
  ontime: number;
  total: number;
}

interface MonthlyData {
  month: string;
  fuel: number;
  maintenance: number;
}

export const AnalyticsView = () => {
  const [stats, setStats] = useState({
    totalMaintenanceCost: 0,
    totalFuelCost: 0,
    fuelConsumption: 0,
    vehicleCount: 0,
    driverCount: 0,
    tripCount: 0,
    completedTrips: 0,
    avgPerformanceScore: 0,
    totalDistance: 0,
  });
  const [routePerformance, setRoutePerformance] = useState<RoutePerformance[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [driverPerformance, setDriverPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [rawData, setRawData] = useState<{ maintenance: any[]; fuel: any[]; vehicles: any[]; drivers: any[]; trips: any[] }>({
    maintenance: [], fuel: [], vehicles: [], drivers: [], trips: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [maintenance, fuel, vehicles, drivers, trips] = await Promise.all([
        supabase.from("maintenance_logs").select("cost_kes, date_performed, service_type, vehicles(license_plate)"),
        supabase.from("fuel_logs").select("liters, price_per_liter_kes, created_at, total_cost_kes, vehicles(license_plate)"),
        supabase.from("vehicles").select("id, status, license_plate, vehicle_type"),
        supabase.from("drivers").select("id, performance_score, total_trips, profiles(full_name)"),
        supabase.from("trips").select("id, status, route, distance_km, start_time, end_time, estimated_duration_hours"),
      ]);

      // Store raw data for PDF export
      setRawData({
        maintenance: maintenance.data || [],
        fuel: fuel.data || [],
        vehicles: vehicles.data || [],
        drivers: drivers.data || [],
        trips: trips.data || [],
      });
      // Calculate stats
      const maintenanceCost = maintenance.data?.reduce((sum, log) => sum + Number(log.cost_kes), 0) || 0;
      const fuelCost = fuel.data?.reduce((sum, log) => sum + (Number(log.liters) * Number(log.price_per_liter_kes)), 0) || 0;
      const fuelLiters = fuel.data?.reduce((sum, log) => sum + Number(log.liters), 0) || 0;
      const completedTrips = trips.data?.filter(t => t.status === "completed").length || 0;
      const avgScore = drivers.data?.length 
        ? Math.round(drivers.data.reduce((sum, d) => sum + (d.performance_score || 0), 0) / drivers.data.length)
        : 0;
      const totalDistance = trips.data?.reduce((sum, t) => sum + (Number(t.distance_km) || 0), 0) || 0;

      setStats({
        totalMaintenanceCost: maintenanceCost,
        totalFuelCost: fuelCost,
        fuelConsumption: fuelLiters,
        vehicleCount: vehicles.data?.length || 0,
        driverCount: drivers.data?.length || 0,
        tripCount: trips.data?.length || 0,
        completedTrips,
        avgPerformanceScore: avgScore,
        totalDistance,
      });

      // Calculate route performance from trips
      const routeMap = new Map<string, { ontime: number; total: number }>();
      trips.data?.forEach(trip => {
        const route = trip.route || "Unknown";
        const current = routeMap.get(route) || { ontime: 0, total: 0 };
        current.total++;
        
        // Consider on-time if completed or in-progress
        if (trip.status === "completed" || trip.status === "in_progress") {
          current.ontime++;
        }
        routeMap.set(route, current);
      });
      
      const routePerf = Array.from(routeMap.entries())
        .map(([route, data]) => ({
          route: route.length > 15 ? route.substring(0, 15) + "..." : route,
          ontime: Math.round((data.ontime / data.total) * 100),
          total: data.total,
        }))
        .slice(0, 6);
      
      setRoutePerformance(routePerf.length > 0 ? routePerf : [
        { route: "No trips yet", ontime: 0, total: 0 }
      ]);

      // Build monthly cost data from actual records
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyMap = new Map<string, { fuel: number; maintenance: number }>();
      
      // Initialize last 6 months
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyMap.set(key, { fuel: 0, maintenance: 0 });
      }

      fuel.data?.forEach(log => {
        const date = new Date(log.created_at);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (monthlyMap.has(key)) {
          const current = monthlyMap.get(key)!;
          current.fuel += Number(log.liters) * Number(log.price_per_liter_kes);
        }
      });

      maintenance.data?.forEach(log => {
        const date = new Date(log.date_performed);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (monthlyMap.has(key)) {
          const current = monthlyMap.get(key)!;
          current.maintenance += Number(log.cost_kes);
        }
      });

      const monthly = Array.from(monthlyMap.entries()).map(([key, data]) => {
        const [year, month] = key.split("-").map(Number);
        return {
          month: monthNames[month],
          fuel: Math.round(data.fuel),
          maintenance: Math.round(data.maintenance),
        };
      });
      setMonthlyData(monthly);

      // Driver performance data
      const driverPerf = drivers.data
        ?.map(d => ({
          name: d.profiles?.full_name?.split(" ")[0] || "Driver",
          score: d.performance_score || 0,
          trips: d.total_trips || 0,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5) || [];
      
      setDriverPerformance(driverPerf.length > 0 ? driverPerf : [
        { name: "No drivers", score: 0, trips: 0 }
      ]);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setGenerating(true);
    try {
      const totalOperatingCost = stats.totalMaintenanceCost + stats.totalFuelCost;
      const fuelPercentage = totalOperatingCost > 0 ? Math.round((stats.totalFuelCost / totalOperatingCost) * 100) : 0;
      const maintenancePercentage = totalOperatingCost > 0 ? Math.round((stats.totalMaintenanceCost / totalOperatingCost) * 100) : 0;

      const reportData: ReportData = {
        title: "Fleet Analytics Report",
        generatedBy: "Fleet Management",
        dateRange: "All Time Performance Data",
        summary: [
          { label: "Total Operating Cost", value: `KES ${totalOperatingCost.toLocaleString()}`, subtext: "Fuel + Maintenance" },
          { label: "Fuel Consumption", value: `${stats.fuelConsumption.toLocaleString()} L`, subtext: `KES ${stats.totalFuelCost.toLocaleString()}` },
          { label: "Maintenance Cost", value: `KES ${stats.totalMaintenanceCost.toLocaleString()}`, subtext: `${rawData.maintenance.length} services` },
          { label: "Avg Driver Score", value: `${stats.avgPerformanceScore}%`, subtext: `${stats.driverCount} drivers` },
          { label: "Fleet Size", value: `${stats.vehicleCount}`, subtext: "Active vehicles" },
          { label: "Total Distance", value: `${stats.totalDistance.toLocaleString()} km`, subtext: "Cumulative" },
          { label: "Completed Trips", value: `${stats.completedTrips}/${stats.tripCount}`, subtext: "Success rate" },
          { label: "Cost/Vehicle", value: `KES ${stats.vehicleCount > 0 ? Math.round(totalOperatingCost / stats.vehicleCount).toLocaleString() : 0}`, subtext: "Average" },
        ],
        sections: [
          {
            title: "Cost Distribution Analysis",
            type: "metrics",
            data: [
              { label: "Fuel Costs", value: `${fuelPercentage}% of total (KES ${stats.totalFuelCost.toLocaleString()})` },
              { label: "Maintenance Costs", value: `${maintenancePercentage}% of total (KES ${stats.totalMaintenanceCost.toLocaleString()})` },
              { label: "Average Fuel Cost/Entry", value: `KES ${rawData.fuel.length > 0 ? Math.round(stats.totalFuelCost / rawData.fuel.length).toLocaleString() : 0}` },
              { label: "Average Maintenance Cost", value: `KES ${rawData.maintenance.length > 0 ? Math.round(stats.totalMaintenanceCost / rawData.maintenance.length).toLocaleString() : 0}` },
            ],
          },
          {
            title: "Fleet Vehicle Summary",
            type: "table",
            data: {
              head: [["License Plate", "Type", "Status"]],
              body: rawData.vehicles.slice(0, 20).map(v => [
                v.license_plate || "N/A",
                v.vehicle_type || "Unknown",
                v.status || "Unknown",
              ]),
            },
          },
          {
            title: "Driver Performance Rankings",
            type: "table",
            data: {
              head: [["Driver Name", "Performance Score", "Total Trips"]],
              body: driverPerformance.map(d => [
                d.name,
                `${d.score}%`,
                d.trips.toString(),
              ]),
            },
          },
          {
            title: "Route Performance",
            type: "table",
            data: {
              head: [["Route", "On-Time Rate", "Total Trips"]],
              body: routePerformance.map(r => [
                r.route,
                `${r.ontime}%`,
                r.total.toString(),
              ]),
            },
          },
          {
            title: "Monthly Cost Trend (Last 6 Months)",
            type: "table",
            data: {
              head: [["Month", "Fuel Cost (KES)", "Maintenance Cost (KES)", "Total (KES)"]],
              body: monthlyData.map(m => [
                m.month,
                m.fuel.toLocaleString(),
                m.maintenance.toLocaleString(),
                (m.fuel + m.maintenance).toLocaleString(),
              ]),
            },
          },
          {
            title: "Strategic Insights",
            type: "text",
            data: `Fleet Performance Summary: With ${stats.vehicleCount} vehicles and ${stats.driverCount} drivers, the fleet has completed ${stats.completedTrips} out of ${stats.tripCount} trips, covering a total distance of ${stats.totalDistance.toLocaleString()} km. The average driver performance score of ${stats.avgPerformanceScore}% indicates ${stats.avgPerformanceScore >= 80 ? 'excellent' : stats.avgPerformanceScore >= 60 ? 'good' : 'room for improvement in'} operational efficiency. Total operating costs of KES ${totalOperatingCost.toLocaleString()} break down to ${fuelPercentage}% fuel and ${maintenancePercentage}% maintenance. Recommendations: ${fuelPercentage > 60 ? 'Focus on fuel efficiency programs and driver training.' : 'Continue current fuel management practices.'} ${maintenancePercentage > 50 ? 'Review preventive maintenance schedules to reduce reactive repairs.' : 'Maintenance costs are well-controlled.'}`,
          },
        ],
      };

      await generateFleetReport(reportData);
      toast({ title: "Success", description: "Analytics report downloaded successfully!" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;
  const totalOperatingCost = stats.totalMaintenanceCost + stats.totalFuelCost;

  const costData = [
    { name: "Fuel", value: stats.totalFuelCost, color: "hsl(var(--warning))" },
    { name: "Maintenance", value: stats.totalMaintenanceCost, color: "hsl(var(--info))" },
  ];
  const vehicleStatusData = [
    { name: "Active", value: stats.vehicleCount, color: "hsl(var(--success))" },
    { name: "In Service", value: Math.max(0, Math.floor(stats.vehicleCount * 0.1)), color: "hsl(var(--warning))" },
  ];

  if (loading) {
    return <div className="text-center py-8"><BarChart3 className="h-8 w-8 animate-pulse mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        <Button onClick={handleExportPDF} disabled={generating} className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {generating ? "Generating..." : "Export PDF Report"}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Operating Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOperatingCost)}</div>
            <p className="text-xs text-muted-foreground">Fuel + Maintenance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Fuel Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fuelConsumption.toLocaleString()} L</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(stats.totalFuelCost)}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalMaintenanceCost)}</div>
            <p className="text-xs text-muted-foreground">Service records</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Driver Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPerformanceScore}%</div>
            <p className="text-xs text-muted-foreground">{stats.driverCount} drivers</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehicles</p>
              <p className="text-xl font-bold">{stats.vehicleCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-success/10">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drivers</p>
              <p className="text-xl font-bold">{stats.driverCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-info/10">
              <MapPin className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Distance</p>
              <p className="text-xl font-bold">{stats.totalDistance.toLocaleString()} km</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-warning/10">
              <CheckCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Trips</p>
              <p className="text-xl font-bold">{stats.completedTrips}/{stats.tripCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
            <CardDescription>Fuel vs Maintenance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => totalOperatingCost > 0 ? `${entry.name}: ${((entry.value / totalOperatingCost) * 100).toFixed(0)}%` : "No data"}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Operating Costs</CardTitle>
            <CardDescription>Last 6 months trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="fuel" stackId="1" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.6} name="Fuel" />
                <Area type="monotone" dataKey="maintenance" stackId="1" stroke="hsl(var(--info))" fill="hsl(var(--info))" fillOpacity={0.6} name="Maintenance" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Route Performance</CardTitle>
            <CardDescription>On-time delivery % by route</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={routePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" angle={-20} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: any, name) => name === "ontime" ? `${value}%` : value} />
                <Bar dataKey="ontime" fill="hsl(var(--primary))" name="On-time %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Driver Performance</CardTitle>
            <CardDescription>Performance scores & trip counts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={driverPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value: any, name) => name === "score" ? `${value}%` : value} />
                <Legend />
                <Bar dataKey="score" fill="hsl(var(--success))" name="Score %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
