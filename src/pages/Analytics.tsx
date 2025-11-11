import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Fuel, Wrench, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Analytics = () => {
  const [stats, setStats] = useState({
    totalMaintenanceCost: 0,
    totalFuelCost: 0,
    fuelConsumption: 0,
    vehicleCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch maintenance costs
      const { data: maintenance } = await supabase
        .from("maintenance_logs")
        .select("cost_kes");

      // Fetch fuel costs
      const { data: fuel } = await supabase
        .from("fuel_logs")
        .select("liters, price_per_liter_kes");

      // Fetch vehicle count
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("id");

      const maintenanceCost = maintenance?.reduce((sum, log) => sum + Number(log.cost_kes), 0) || 0;
      const fuelCost = fuel?.reduce((sum, log) => sum + (Number(log.liters) * Number(log.price_per_liter_kes)), 0) || 0;
      const fuelLiters = fuel?.reduce((sum, log) => sum + Number(log.liters), 0) || 0;

      setStats({
        totalMaintenanceCost: maintenanceCost,
        totalFuelCost: fuelCost,
        fuelConsumption: fuelLiters,
        vehicleCount: vehicles?.length || 0,
      });

      // Set up real-time subscriptions
      const channel = supabase
        .channel('analytics-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'maintenance_logs'
          },
          () => fetchAnalytics()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'fuel_logs'
          },
          () => fetchAnalytics()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
  };

  const totalOperatingCost = stats.totalMaintenanceCost + stats.totalFuelCost;
  const fuelPercentage = totalOperatingCost > 0 ? (stats.totalFuelCost / totalOperatingCost * 100).toFixed(1) : 0;
  const maintenancePercentage = totalOperatingCost > 0 ? (stats.totalMaintenanceCost / totalOperatingCost * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Analytics & Reports 📊
        </h1>
        <p className="text-muted-foreground">
          Financial insights and performance metrics
        </p>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Total Operating Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOperatingCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly expenses
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Fuel className="h-4 w-4 text-warning" />
              Fuel Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalFuelCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {fuelPercentage}% of total costs
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4 text-info" />
              Maintenance Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalMaintenanceCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {maintenancePercentage}% of total costs
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-success" />
              Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">KES 620,000</div>
            <p className="text-xs text-muted-foreground mt-1">
              Through optimization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-warning" />
                  Fuel
                </span>
                <span className="font-semibold">{fuelPercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-warning h-2 rounded-full" 
                  style={{ width: `${fuelPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-info" />
                  Maintenance
                </span>
                <span className="font-semibold">{maintenancePercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-info h-2 rounded-full" 
                  style={{ width: `${maintenancePercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Performance</CardTitle>
            <CardDescription>On-time delivery rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Nairobi-Mombasa</span>
              <Badge variant="outline" className="bg-success/10 text-success">85%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Thika Highway</span>
              <Badge variant="outline" className="bg-success/10 text-success">92%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Western Kenya</span>
              <Badge variant="outline" className="bg-warning/10 text-warning">72%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Northern Route</span>
              <Badge variant="outline" className="bg-warning/10 text-warning">68%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fuel Efficiency Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Performance Trends
          </CardTitle>
          <CardDescription>Monthly improvements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="text-2xl font-bold text-success">+12%</div>
              <p className="text-sm text-muted-foreground mt-1">Fuel Efficiency</p>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="text-2xl font-bold text-success">-KES 120K</div>
              <p className="text-sm text-muted-foreground mt-1">Maintenance Reduction</p>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="text-2xl font-bold text-success">+18%</div>
              <p className="text-sm text-muted-foreground mt-1">Driver Compliance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Overview</CardTitle>
          <CardDescription>Current fleet statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold">{stats.vehicleCount}</div>
              <p className="text-sm text-muted-foreground">Total Vehicles</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.fuelConsumption.toFixed(0)}L</div>
              <p className="text-sm text-muted-foreground">Fuel Consumed</p>
            </div>
            <div>
              <div className="text-2xl font-bold">6.2 km/L</div>
              <p className="text-sm text-muted-foreground">Avg Efficiency</p>
            </div>
            <div>
              <div className="text-2xl font-bold">KES 185</div>
              <p className="text-sm text-muted-foreground">Current Diesel Price</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
