import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { generateFleetReport, ReportData } from "@/utils/pdfReportGenerator";
import { ReportFilterDialog, ReportFilters } from "./ReportFilterDialog";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  DollarSign, Fuel, Wrench, TrendingUp, TrendingDown,
  BarChart3, FileDown, Loader2, Truck, AlertCircle,
  ArrowUpRight, ArrowDownRight, Calendar, PieChart,
  Receipt, Wallet, Target, Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend, Area, AreaChart
} from "recharts";

interface MonthlyExpense {
  month: string;
  fuel: number;
  maintenance: number;
  total: number;
}

const CHART_COLORS = [
  "hsl(142, 76%, 36%)",  // success green
  "hsl(43, 96%, 56%)",   // warning gold
  "hsl(199, 89%, 48%)",  // info blue
  "hsl(0, 84%, 45%)",    // destructive red
  "hsl(142, 76%, 20%)",  // primary
];

export const FinanceDashboard = () => {
  const [fuelData, setFuelData] = useState<{ total: number; count: number; logs: any[] }>({ total: 0, count: 0, logs: [] });
  const [maintenanceData, setMaintenanceData] = useState<{ total: number; count: number; logs: any[] }>({ total: 0, count: 0, logs: [] });
  const [vehicleCount, setVehicleCount] = useState(0);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyExpense[]>([]);
  const [maintenanceByType, setMaintenanceByType] = useState<{ name: string; value: number }[]>([]);
  const [topVehicleCosts, setTopVehicleCosts] = useState<{ plate: string; fuel: number; maintenance: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const [fuelRes, maintenanceRes, vehiclesRes] = await Promise.all([
        supabase
          .from("fuel_logs")
          .select("total_cost_kes, created_at, liters, price_per_liter_kes, vehicle_id, vehicles(license_plate, vehicle_type)"),
        supabase
          .from("maintenance_logs")
          .select("cost_kes, date_performed, service_type, vehicle_id, vehicles(license_plate, vehicle_type)"),
        supabase
          .from("vehicles")
          .select("id, vehicle_type, license_plate", { count: 'exact' })
      ]);

      const fuelLogs = fuelRes.data || [];
      const maintenanceLogs = maintenanceRes.data || [];

      const fuelTotal = fuelLogs.reduce((sum, log) => sum + (log.total_cost_kes || 0), 0);
      const maintenanceTotal = maintenanceLogs.reduce((sum, log) => sum + (log.cost_kes || 0), 0);

      setFuelData({ total: fuelTotal, count: fuelLogs.length, logs: fuelLogs });
      setMaintenanceData({ total: maintenanceTotal, count: maintenanceLogs.length, logs: maintenanceLogs });
      setVehicleCount(vehiclesRes.count || 0);

      const types = [...new Set((vehiclesRes.data || []).map((v: any) => v.vehicle_type).filter(Boolean))];
      setVehicleTypes(types as string[]);

      // Build monthly trend data (last 6 months)
      const monthly: Record<string, { fuel: number; maintenance: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const key = format(d, "MMM yyyy");
        monthly[key] = { fuel: 0, maintenance: 0 };
      }
      fuelLogs.forEach((log) => {
        const key = format(new Date(log.created_at), "MMM yyyy");
        if (monthly[key]) monthly[key].fuel += log.total_cost_kes || 0;
      });
      maintenanceLogs.forEach((log) => {
        const key = format(new Date(log.date_performed), "MMM yyyy");
        if (monthly[key]) monthly[key].maintenance += log.cost_kes || 0;
      });
      setMonthlyData(Object.entries(monthly).map(([month, vals]) => ({
        month: month.split(" ")[0],
        fuel: Math.round(vals.fuel),
        maintenance: Math.round(vals.maintenance),
        total: Math.round(vals.fuel + vals.maintenance),
      })));

      // Maintenance by service type
      const byType: Record<string, number> = {};
      maintenanceLogs.forEach((log) => {
        const t = log.service_type || "Other";
        byType[t] = (byType[t] || 0) + (log.cost_kes || 0);
      });
      setMaintenanceByType(Object.entries(byType).map(([name, value]) => ({ name, value: Math.round(value) })));

      // Top vehicle costs
      const vehicleCosts: Record<string, { plate: string; fuel: number; maintenance: number }> = {};
      fuelLogs.forEach((log) => {
        const vid = log.vehicle_id;
        if (!vehicleCosts[vid]) vehicleCosts[vid] = { plate: (log.vehicles as any)?.license_plate || "Unknown", fuel: 0, maintenance: 0 };
        vehicleCosts[vid].fuel += log.total_cost_kes || 0;
      });
      maintenanceLogs.forEach((log) => {
        const vid = log.vehicle_id;
        if (!vehicleCosts[vid]) vehicleCosts[vid] = { plate: (log.vehicles as any)?.license_plate || "Unknown", fuel: 0, maintenance: 0 };
        vehicleCosts[vid].maintenance += log.cost_kes || 0;
      });
      const sorted = Object.values(vehicleCosts)
        .sort((a, b) => (b.fuel + b.maintenance) - (a.fuel + a.maintenance))
        .slice(0, 5);
      setTopVehicleCosts(sorted);

    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (filters: ReportFilters) => {
    setGenerating(true);
    setShowFilterDialog(false);

    try {
      let filteredFuel = [...fuelData.logs];
      let filteredMaintenance = [...maintenanceData.logs];

      if (filters.dateFrom) {
        filteredFuel = filteredFuel.filter(f => new Date(f.created_at) >= filters.dateFrom!);
        filteredMaintenance = filteredMaintenance.filter(m => new Date(m.date_performed) >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredFuel = filteredFuel.filter(f => new Date(f.created_at) <= filters.dateTo!);
        filteredMaintenance = filteredMaintenance.filter(m => new Date(m.date_performed) <= filters.dateTo!);
      }
      if (filters.vehicleTypes.length > 0) {
        filteredFuel = filteredFuel.filter(f => filters.vehicleTypes.includes((f.vehicles as any)?.vehicle_type));
        filteredMaintenance = filteredMaintenance.filter(m => filters.vehicleTypes.includes((m.vehicles as any)?.vehicle_type));
      }

      const filteredFuelTotal = filteredFuel.reduce((sum, log) => sum + (log.total_cost_kes || 0), 0);
      const filteredMaintenanceTotal = filteredMaintenance.reduce((sum, log) => sum + (log.cost_kes || 0), 0);
      const totalExpenses = filteredFuelTotal + filteredMaintenanceTotal;
      const costPerVehicle = vehicleCount > 0 ? Math.round(totalExpenses / vehicleCount) : 0;
      const fuelPct = totalExpenses > 0 ? Math.round((filteredFuelTotal / totalExpenses) * 100) : 0;
      const maintPct = totalExpenses > 0 ? Math.round((filteredMaintenanceTotal / totalExpenses) * 100) : 0;

      let dateRange = "All Time";
      if (filters.dateFrom && filters.dateTo) dateRange = `${format(filters.dateFrom, "MMM d, yyyy")} - ${format(filters.dateTo, "MMM d, yyyy")}`;
      else if (filters.dateFrom) dateRange = `From ${format(filters.dateFrom, "MMM d, yyyy")}`;
      else if (filters.dateTo) dateRange = `Until ${format(filters.dateTo, "MMM d, yyyy")}`;

      const sections: ReportData["sections"] = [];

      if (filters.includeSections.summary) {
        sections.push({
          title: "Cost Breakdown Analysis",
          type: "metrics",
          data: [
            { label: "Fuel Percentage", value: `${fuelPct}% of total expenses` },
            { label: "Maintenance Percentage", value: `${maintPct}% of total expenses` },
            { label: "Fleet Size", value: `${vehicleCount} vehicles` },
            { label: "Avg Fuel Cost/Entry", value: `KES ${filteredFuel.length > 0 ? Math.round(filteredFuelTotal / filteredFuel.length).toLocaleString() : 0}` },
            { label: "Avg Maintenance Cost", value: `KES ${filteredMaintenance.length > 0 ? Math.round(filteredMaintenanceTotal / filteredMaintenance.length).toLocaleString() : 0}` },
          ],
        });
      }

      if (filters.includeSections.fuelLogs && filteredFuel.length > 0) {
        sections.push({
          title: "Fuel Transactions",
          type: "table",
          data: {
            head: [["Date", "Vehicle", "Liters", "Rate (KES)", "Total (KES)"]],
            body: filteredFuel.slice(0, 25).map(log => [
              new Date(log.created_at).toLocaleDateString("en-KE"),
              (log.vehicles as any)?.license_plate || "N/A",
              `${Number(log.liters || 0).toFixed(1)} L`,
              Number(log.price_per_liter_kes || 0).toLocaleString(),
              Number(log.total_cost_kes || 0).toLocaleString(),
            ]),
          },
        });
      }

      if (filters.includeSections.maintenanceLogs && filteredMaintenance.length > 0) {
        sections.push({
          title: "Maintenance Records",
          type: "table",
          data: {
            head: [["Date", "Vehicle", "Service Type", "Cost (KES)"]],
            body: filteredMaintenance.slice(0, 25).map(log => [
              new Date(log.date_performed).toLocaleDateString("en-KE"),
              (log.vehicles as any)?.license_plate || "N/A",
              log.service_type || "General",
              Number(log.cost_kes || 0).toLocaleString(),
            ]),
          },
        });
      }

      if (filters.includeSections.insights) {
        sections.push({
          title: "Budget Recommendations",
          type: "text",
          data: totalExpenses > 0
            ? `Report Period: ${dateRange}. Fuel costs account for ${fuelPct}% of total operating expenses while maintenance accounts for ${maintPct}%. With ${vehicleCount} vehicles, the average operational cost per vehicle is KES ${costPerVehicle.toLocaleString()}. ${filteredFuel.length} fuel transactions and ${filteredMaintenance.length} maintenance records analyzed.`
            : "No expense data available for the selected period.",
        });
      }

      const reportData: ReportData = {
        title: "Financial Report",
        generatedBy: "Finance Department",
        dateRange,
        summary: filters.includeSections.summary ? [
          { label: "Total Fuel Cost", value: `KES ${filteredFuelTotal.toLocaleString()}`, subtext: `${filteredFuel.length} entries` },
          { label: "Maintenance Cost", value: `KES ${filteredMaintenanceTotal.toLocaleString()}`, subtext: `${filteredMaintenance.length} records` },
          { label: "Total Expenses", value: `KES ${totalExpenses.toLocaleString()}`, subtext: "Combined costs" },
          { label: "Cost per Vehicle", value: `KES ${costPerVehicle.toLocaleString()}`, subtext: `${vehicleCount} vehicles` },
        ] : [],
        sections,
      };

      await generateFleetReport(reportData);
      toast({ title: "Success", description: "Financial report downloaded!" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const totalExpenses = fuelData.total + maintenanceData.total;
  const costPerVehicle = vehicleCount > 0 ? Math.round(totalExpenses / vehicleCount) : 0;
  const fuelPercentage = totalExpenses > 0 ? Math.round((fuelData.total / totalExpenses) * 100) : 0;
  const maintenancePercentage = totalExpenses > 0 ? Math.round((maintenanceData.total / totalExpenses) * 100) : 0;

  // Current month vs previous month comparison
  const currentMonthData = monthlyData[monthlyData.length - 1];
  const prevMonthData = monthlyData[monthlyData.length - 2];
  const monthChange = currentMonthData && prevMonthData && prevMonthData.total > 0
    ? Math.round(((currentMonthData.total - prevMonthData.total) / prevMonthData.total) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Wallet className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Fuel", value: fuelData.total },
    { name: "Maintenance", value: maintenanceData.total },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Expenses</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalExpenses.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              {monthChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-destructive" />
              ) : monthChange < 0 ? (
                <ArrowDownRight className="h-3 w-3 text-success" />
              ) : null}
              <span className={`text-xs ${monthChange > 0 ? "text-destructive" : monthChange < 0 ? "text-success" : "text-muted-foreground"}`}>
                {monthChange !== 0 ? `${Math.abs(monthChange)}% vs last month` : "No prior data"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Fuel Costs</CardTitle>
            <Fuel className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {fuelData.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{fuelPercentage}% of expenses · {fuelData.count} entries</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {maintenanceData.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{maintenancePercentage}% of expenses · {maintenanceData.count} records</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Cost / Vehicle</CardTitle>
            <Truck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {costPerVehicle.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{vehicleCount} vehicles in fleet</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowFilterDialog(true)} disabled={generating} size="sm" className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {generating ? "Generating..." : "Export PDF Report"}
        </Button>
      </div>

      <ReportFilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        onGenerate={handleExportPDF}
        generating={generating}
        vehicleTypes={vehicleTypes}
        reportType="finance"
      />

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="fuel" className="gap-1.5 text-xs">
            <Fuel className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Fuel</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-1.5 text-xs">
            <Wrench className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Maintenance</span>
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-1.5 text-xs">
            <Truck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">By Vehicle</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Monthly Expense Trend
                </CardTitle>
                <CardDescription>Last 6 months breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.some(d => d.total > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="fuel" stackId="1" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.4} name="Fuel" />
                      <Area type="monotone" dataKey="maintenance" stackId="1" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.4} name="Maintenance" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                    No expense data for the last 6 months
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Split Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  Expense Distribution
                </CardTitle>
                <CardDescription>Fuel vs Maintenance split</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width="50%" height={200}>
                      <RechartsPie>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                      </RechartsPie>
                    </ResponsiveContainer>
                    <div className="space-y-4 flex-1">
                      {pieData.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{entry.name}</p>
                            <p className="text-xs text-muted-foreground">KES {entry.value.toLocaleString()}</p>
                          </div>
                          <span className="text-sm font-semibold">
                            {totalExpenses > 0 ? Math.round((entry.value / totalExpenses) * 100) : 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                    No expenses recorded yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Budget Summary Card */}
          <Card className="border-l-4 border-l-primary bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-3 rounded-lg bg-background border">
                  <p className="text-xs text-muted-foreground">Avg Fuel per Entry</p>
                  <p className="text-lg font-bold">
                    KES {fuelData.count > 0 ? Math.round(fuelData.total / fuelData.count).toLocaleString() : 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background border">
                  <p className="text-xs text-muted-foreground">Avg Maintenance Cost</p>
                  <p className="text-lg font-bold">
                    KES {maintenanceData.count > 0 ? Math.round(maintenanceData.total / maintenanceData.count).toLocaleString() : 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background border">
                  <p className="text-xs text-muted-foreground">Monthly Average</p>
                  <p className="text-lg font-bold">
                    KES {monthlyData.filter(d => d.total > 0).length > 0
                      ? Math.round(monthlyData.reduce((s, d) => s + d.total, 0) / monthlyData.filter(d => d.total > 0).length).toLocaleString()
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fuel Tab */}
        <TabsContent value="fuel" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Fuel className="h-4 w-4 text-warning" />
                Fuel Transaction History
              </CardTitle>
              <CardDescription>{fuelData.count} records · KES {fuelData.total.toLocaleString()} total</CardDescription>
            </CardHeader>
            <CardContent>
              {fuelData.logs.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {fuelData.logs
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-warning/10">
                            <Fuel className="h-4 w-4 text-warning" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{(log.vehicles as any)?.license_plate || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">
                              {Number(log.liters || 0).toFixed(1)}L @ KES {Number(log.price_per_liter_kes || 0).toFixed(0)}/L
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">KES {Number(log.total_cost_kes || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(log.created_at), "dd MMM yyyy")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Fuel className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">No fuel records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4 mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Maintenance by Type Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-info" />
                  Cost by Service Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={maintenanceByType} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
                      <Bar dataKey="value" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                    No maintenance data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Maintenance Records List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-info" />
                  Recent Maintenance
                </CardTitle>
                <CardDescription>{maintenanceData.count} records</CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceData.logs.length > 0 ? (
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-2">
                      {maintenanceData.logs
                        .sort((a, b) => new Date(b.date_performed).getTime() - new Date(a.date_performed).getTime())
                        .slice(0, 15)
                        .map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-info/10">
                              <Wrench className="h-4 w-4 text-info" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{log.service_type || "General"}</p>
                              <p className="text-xs text-muted-foreground">{(log.vehicles as any)?.license_plate || "Unknown"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">KES {Number(log.cost_kes || 0).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(log.date_performed), "dd MMM yyyy")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Wrench className="h-10 w-10 mb-3 opacity-40" />
                    <p className="text-sm">No maintenance records</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* By Vehicle Tab */}
        <TabsContent value="vehicles" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Top 5 Vehicles by Cost
              </CardTitle>
              <CardDescription>Highest operational expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {topVehicleCosts.length > 0 ? (
                <div className="space-y-4">
                  {topVehicleCosts.map((vehicle, i) => {
                    const total = vehicle.fuel + vehicle.maintenance;
                    const maxTotal = topVehicleCosts[0].fuel + topVehicleCosts[0].maintenance;
                    const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              {vehicle.plate}
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold">KES {total.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
                          {vehicle.fuel > 0 && (
                            <div
                              className="h-full rounded-l-full"
                              style={{
                                width: `${total > 0 ? (vehicle.fuel / maxTotal) * 100 : 0}%`,
                                backgroundColor: CHART_COLORS[1],
                              }}
                            />
                          )}
                          {vehicle.maintenance > 0 && (
                            <div
                              className="h-full rounded-r-full"
                              style={{
                                width: `${total > 0 ? (vehicle.maintenance / maxTotal) * 100 : 0}%`,
                                backgroundColor: CHART_COLORS[2],
                              }}
                            />
                          )}
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Fuel: KES {vehicle.fuel.toLocaleString()}</span>
                          <span>Maintenance: KES {vehicle.maintenance.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex gap-4 pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[1] }} />
                      Fuel
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[2] }} />
                      Maintenance
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Truck className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">No vehicle cost data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
