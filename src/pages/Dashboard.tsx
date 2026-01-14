import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, AlertCircle, DollarSign, Wrench, BarChart3, Users, TrendingDown, TrendingUp, Fuel, FileDown, Loader2 } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DriverDashboard } from "@/components/dashboard/DriverDashboard";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { generateFleetReport, ReportData } from "@/utils/pdfReportGenerator";
import { ReportFilterDialog, ReportFilters } from "@/components/dashboard/ReportFilterDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
const Dashboard = () => {
  const navigate = useNavigate();
  const { role, profile, loading, isDriver, isFinance, isOperations, isFleetManager } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Truck className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    navigate("/auth");
    return null;
  }

  // Role-specific dashboard titles and descriptions
  const getDashboardInfo = () => {
    switch (role) {
      case "fleet_manager":
        return {
          title: "Fleet Manager Dashboard",
          description: "Complete overview of your fleet operations, performance, and analytics",
        };
      case "operations":
        return {
          title: "Operations Dashboard",
          description: "Monitor vehicles, drivers, and daily operations",
        };
      case "driver":
        return {
          title: `Karibu, ${profile?.full_name || "Driver"}!`,
          description: "Your trips, vehicle, and performance overview",
        };
      case "finance":
        return {
          title: "Finance Dashboard",
          description: "Financial overview, costs, and budget analysis",
        };
      default:
        return {
          title: "Dashboard",
          description: "Overview of your fleet",
        };
    }
  };

  const dashboardInfo = getDashboardInfo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">{dashboardInfo.title}</h1>
        <p className="text-muted-foreground">{dashboardInfo.description}</p>
      </div>

      {/* Role-specific dashboard content */}
      {isDriver ? (
        <DriverDashboard profile={profile} />
      ) : isFinance ? (
        <FinanceDashboard />
      ) : (
        <DashboardOverview />
      )}
    </div>
  );
};

// Finance-specific dashboard component with real data
const FinanceDashboard = () => {
  const [fuelData, setFuelData] = useState<{ total: number; count: number; logs: any[] }>({ total: 0, count: 0, logs: [] });
  const [maintenanceData, setMaintenanceData] = useState<{ total: number; count: number; logs: any[] }>({ total: 0, count: 0, logs: [] });
  const [vehicleCount, setVehicleCount] = useState(0);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const [fuelRes, maintenanceRes, vehiclesRes] = await Promise.all([
        supabase
          .from("fuel_logs")
          .select("total_cost_kes, created_at, liters, price_per_liter_kes, vehicles(license_plate, vehicle_type)"),
        supabase
          .from("maintenance_logs")
          .select("cost_kes, date_performed, service_type, vehicles(license_plate, vehicle_type)"),
        supabase
          .from("vehicles")
          .select("id, vehicle_type", { count: 'exact' })
      ]);

      const fuelTotal = fuelRes.data?.reduce((sum, log) => sum + (log.total_cost_kes || 0), 0) || 0;
      const maintenanceTotal = maintenanceRes.data?.reduce((sum, log) => sum + (log.cost_kes || 0), 0) || 0;

      setFuelData({ total: fuelTotal, count: fuelRes.data?.length || 0, logs: fuelRes.data || [] });
      setMaintenanceData({ total: maintenanceTotal, count: maintenanceRes.data?.length || 0, logs: maintenanceRes.data || [] });
      setVehicleCount(vehiclesRes.count || 0);
      
      // Extract unique vehicle types
      const types = [...new Set((vehiclesRes.data || []).map((v: any) => v.vehicle_type).filter(Boolean))];
      setVehicleTypes(types as string[]);
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
      // Apply filters to data
      let filteredFuel = [...fuelData.logs];
      let filteredMaintenance = [...maintenanceData.logs];

      // Date filtering
      if (filters.dateFrom) {
        filteredFuel = filteredFuel.filter(f => new Date(f.created_at) >= filters.dateFrom!);
        filteredMaintenance = filteredMaintenance.filter(m => new Date(m.date_performed) >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredFuel = filteredFuel.filter(f => new Date(f.created_at) <= filters.dateTo!);
        filteredMaintenance = filteredMaintenance.filter(m => new Date(m.date_performed) <= filters.dateTo!);
      }

      // Vehicle type filtering
      if (filters.vehicleTypes.length > 0) {
        filteredFuel = filteredFuel.filter(f => filters.vehicleTypes.includes((f.vehicles as any)?.vehicle_type));
        filteredMaintenance = filteredMaintenance.filter(m => filters.vehicleTypes.includes((m.vehicles as any)?.vehicle_type));
      }

      const filteredFuelTotal = filteredFuel.reduce((sum, log) => sum + (log.total_cost_kes || 0), 0);
      const filteredMaintenanceTotal = filteredMaintenance.reduce((sum, log) => sum + (log.cost_kes || 0), 0);
      const totalExpenses = filteredFuelTotal + filteredMaintenanceTotal;
      const costPerVehicle = vehicleCount > 0 ? Math.round(totalExpenses / vehicleCount) : 0;
      const fuelPercentage = totalExpenses > 0 ? Math.round((filteredFuelTotal / totalExpenses) * 100) : 0;
      const maintenancePercentage = totalExpenses > 0 ? Math.round((filteredMaintenanceTotal / totalExpenses) * 100) : 0;

      // Build date range string
      let dateRange = "All Time";
      if (filters.dateFrom && filters.dateTo) {
        dateRange = `${format(filters.dateFrom, "MMM d, yyyy")} - ${format(filters.dateTo, "MMM d, yyyy")}`;
      } else if (filters.dateFrom) {
        dateRange = `From ${format(filters.dateFrom, "MMM d, yyyy")}`;
      } else if (filters.dateTo) {
        dateRange = `Until ${format(filters.dateTo, "MMM d, yyyy")}`;
      }

      const sections: ReportData["sections"] = [];

      if (filters.includeSections.summary) {
        sections.push({
          title: "Cost Breakdown Analysis",
          type: "metrics",
          data: [
            { label: "Fuel Percentage", value: `${fuelPercentage}% of total expenses` },
            { label: "Maintenance Percentage", value: `${maintenancePercentage}% of total expenses` },
            { label: "Fleet Size", value: `${vehicleCount} vehicles` },
            { label: "Average Fuel Cost/Entry", value: `KES ${filteredFuel.length > 0 ? Math.round(filteredFuelTotal / filteredFuel.length).toLocaleString() : 0}` },
            { label: "Average Maintenance Cost", value: `KES ${filteredMaintenance.length > 0 ? Math.round(filteredMaintenanceTotal / filteredMaintenance.length).toLocaleString() : 0}` },
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
            ? `Report Period: ${dateRange}. Based on expenditure patterns, fuel costs account for ${fuelPercentage}% of total operating expenses while maintenance accounts for ${maintenancePercentage}%. ${filters.vehicleTypes.length > 0 ? `Filtered by vehicle types: ${filters.vehicleTypes.join(", ")}. ` : ""}With ${vehicleCount} vehicles in the fleet, the average operational cost per vehicle is KES ${costPerVehicle.toLocaleString()}. ${filteredFuel.length} fuel transactions and ${filteredMaintenance.length} maintenance records analyzed. Recommendations: Regular maintenance scheduling and fuel efficiency monitoring are key to optimizing operational costs.`
            : "No expense data available for the selected period. Financial analysis will be generated as fuel and maintenance records are added to the system.",
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
      toast({ title: "Success", description: "Financial report downloaded successfully!" });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <DollarSign className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel Cost</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {fuelData.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{fuelData.count} fuel entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Costs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {maintenanceData.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{maintenanceData.count} service records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Combined costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per Vehicle</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {costPerVehicle.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{vehicleCount} vehicles in fleet</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowFilterDialog(true)} disabled={generating} className="gap-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Cost breakdown and expense analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-primary" />
                  Fuel Costs
                </p>
                <p className="text-sm text-muted-foreground">{fuelPercentage}% of total expenses</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">KES {fuelData.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Maintenance
                </p>
                <p className="text-sm text-muted-foreground">{maintenancePercentage}% of total expenses</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">KES {maintenanceData.total.toLocaleString()}</p>
              </div>
            </div>
            {totalExpenses === 0 && (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">No Expenses Recorded</p>
                  <p className="text-sm text-muted-foreground">Add fuel logs and maintenance records to see financial data</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Budget Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {totalExpenses > 0 
                ? `Total expenditure is KES ${totalExpenses.toLocaleString()}. Fuel accounts for ${fuelPercentage}% and maintenance for ${maintenancePercentage}% of costs.`
                : "No expenses recorded yet. Financial data will appear as fuel and maintenance logs are added."}
            </p>
            {vehicleCount > 0 && totalExpenses > 0 && (
              <p className="text-sm text-muted-foreground">
                Average cost per vehicle: <strong>KES {costPerVehicle.toLocaleString()}</strong>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
