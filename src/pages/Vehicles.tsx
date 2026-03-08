import { useNavigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { VehiclesManager } from "@/components/dashboard/VehiclesManager";
import { InventoryCheck } from "@/components/dashboard/InventoryCheck";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

const Vehicles = () => {
  const navigate = useNavigate();
  const { role, loading, hasAnyRole, isFinance } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!hasAnyRole(["fleet_manager", "operations", "driver", "finance"])) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldX className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>You don't have permission to view this page</CardDescription>
          </CardHeader>
          <CardContent>
            <button onClick={() => navigate("/dashboard")} className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              Go to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Finance sees inventory check instead of vehicle management
  if (isFinance) {
    return <InventoryCheck />;
  }

  return <VehiclesManager />;
};

export default Vehicles;
