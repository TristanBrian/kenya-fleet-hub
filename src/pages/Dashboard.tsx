import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DriverDashboard } from "@/components/dashboard/DriverDashboard";
import { FinanceDashboard } from "@/components/dashboard/FinanceDashboard";
import { useRole } from "@/hooks/useRole";

const Dashboard = () => {
  const navigate = useNavigate();
  const { role, profile, loading, isDriver, isFinance } = useRole();

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

  const getDashboardInfo = () => {
    switch (role) {
      case "fleet_manager":
        return { title: "Fleet Manager Dashboard", description: "Complete overview of your fleet operations, performance, and analytics" };
      case "operations":
        return { title: "Operations Dashboard", description: "Monitor vehicles, drivers, and daily operations" };
      case "driver":
        return { title: `Karibu, ${profile?.full_name || "Driver"}!`, description: "Your trips, vehicle, and performance overview" };
      case "finance":
        return { title: "Finance Dashboard", description: "Financial management, cost analysis, and reporting" };
      default:
        return { title: "Dashboard", description: "Overview of your fleet" };
    }
  };

  const dashboardInfo = getDashboardInfo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">{dashboardInfo.title}</h1>
        <p className="text-muted-foreground">{dashboardInfo.description}</p>
      </div>

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

export default Dashboard;
