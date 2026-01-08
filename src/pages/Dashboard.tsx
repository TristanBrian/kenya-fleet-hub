import { useNavigate } from "react-router-dom";
import { Truck, AlertCircle } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DriverDashboard } from "@/components/dashboard/DriverDashboard";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, Users, Wrench } from "lucide-react";

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
          title: `Welcome, ${profile?.full_name || "Driver"}`,
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

// Finance-specific dashboard component
const FinanceDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Fuel Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 2,450,000</div>
            <p className="text-xs text-muted-foreground">-5.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Costs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 480,000</div>
            <p className="text-xs text-muted-foreground">-12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 380,000</div>
            <p className="text-xs text-muted-foreground">Through optimization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per Vehicle</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 136,111</div>
            <p className="text-xs text-muted-foreground">Average monthly</p>
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
                <p className="font-medium">Fuel Costs</p>
                <p className="text-sm text-muted-foreground">58% of total expenses</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">KES 2,450,000</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Maintenance</p>
                <p className="text-sm text-muted-foreground">20% of total expenses</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">KES 480,000</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-success/5">
              <div>
                <p className="font-medium">Total Savings</p>
                <p className="text-sm text-muted-foreground">Through route optimization</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success">KES 380,000</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Budget Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All expenses are within budget. Fuel costs are 5.2% below projected spending.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
