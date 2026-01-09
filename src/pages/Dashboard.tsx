import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, AlertCircle, DollarSign, Wrench, BarChart3, Users, TrendingDown, TrendingUp, Fuel } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DriverDashboard } from "@/components/dashboard/DriverDashboard";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

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
  const [fuelData, setFuelData] = useState({ total: 0, count: 0 });
  const [maintenanceData, setMaintenanceData] = useState({ total: 0, count: 0 });
  const [vehicleCount, setVehicleCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      // Fetch fuel logs for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [fuelRes, maintenanceRes, vehiclesRes] = await Promise.all([
        supabase
          .from("fuel_logs")
          .select("total_cost_kes")
          .gte("created_at", startOfMonth.toISOString()),
        supabase
          .from("maintenance_logs")
          .select("cost_kes")
          .gte("date_performed", startOfMonth.toISOString()),
        supabase
          .from("vehicles")
          .select("id", { count: 'exact' })
      ]);

      const fuelTotal = fuelRes.data?.reduce((sum, log) => sum + (log.total_cost_kes || 0), 0) || 0;
      const maintenanceTotal = maintenanceRes.data?.reduce((sum, log) => sum + (log.cost_kes || 0), 0) || 0;

      setFuelData({ total: fuelTotal, count: fuelRes.data?.length || 0 });
      setMaintenanceData({ total: maintenanceTotal, count: maintenanceRes.data?.length || 0 });
      setVehicleCount(vehiclesRes.count || 0);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
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
            <CardTitle className="text-sm font-medium">Monthly Fuel Cost</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {fuelData.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{fuelData.count} fuel entries this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Costs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {maintenanceData.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{maintenanceData.count} services this month</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Monthly cost breakdown and trends</CardDescription>
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
                ? `This month's total expenditure is KES ${totalExpenses.toLocaleString()}. Fuel accounts for ${fuelPercentage}% and maintenance for ${maintenancePercentage}% of costs.`
                : "No expenses recorded this month yet. Financial data will appear as fuel and maintenance logs are added."}
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
