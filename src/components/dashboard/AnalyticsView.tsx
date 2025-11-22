import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, Fuel, TrendingUp, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export const AnalyticsView = () => {
  const [stats, setStats] = useState({
    totalMaintenanceCost: 0,
    totalFuelCost: 0,
    fuelConsumption: 0,
    vehicleCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [maintenance, fuel, vehicles] = await Promise.all([
        supabase.from("maintenance_logs").select("cost_kes"),
        supabase.from("fuel_logs").select("liters, price_per_liter_kes"),
        supabase.from("vehicles").select("id"),
      ]);

      const maintenanceCost = maintenance.data?.reduce((sum, log) => sum + Number(log.cost_kes), 0) || 0;
      const fuelCost = fuel.data?.reduce((sum, log) => sum + (Number(log.liters) * Number(log.price_per_liter_kes)), 0) || 0;
      const fuelLiters = fuel.data?.reduce((sum, log) => sum + Number(log.liters), 0) || 0;

      setStats({
        totalMaintenanceCost: maintenanceCost,
        totalFuelCost: fuelCost,
        fuelConsumption: fuelLiters,
        vehicleCount: vehicles.data?.length || 0,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;
  const totalOperatingCost = stats.totalMaintenanceCost + stats.totalFuelCost;

  const costData = [
    { name: "Fuel", value: stats.totalFuelCost, color: "hsl(var(--warning))" },
    { name: "Maintenance", value: stats.totalMaintenanceCost, color: "hsl(var(--info))" },
  ];

  const performanceData = [
    { route: "Nairobi-Mombasa", ontime: 85 },
    { route: "Thika Highway", ontime: 92 },
    { route: "Western Kenya", ontime: 72 },
    { route: "Northern Route", ontime: 68 },
  ];

  if (loading) {
    return <div className="text-center py-8"><BarChart3 className="h-8 w-8 animate-pulse mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics & Reports</h2>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOperatingCost)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Fuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalFuelCost)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalMaintenanceCost)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vehicleCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
            <CardDescription>Fuel vs Maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${((entry.value / totalOperatingCost) * 100).toFixed(1)}%`}
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
            <CardTitle>Route Performance</CardTitle>
            <CardDescription>On-time delivery %</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ontime" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
