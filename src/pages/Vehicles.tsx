import { useNavigate } from "react-router-dom";
import { VehiclesManager } from "@/components/dashboard/VehiclesManager";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

const Vehicles = () => {
  const navigate = useNavigate();
  const { role, loading, hasAnyRole } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Drivers can view vehicles (their assigned vehicle), but with limited access
  // Finance can view but not edit
  if (!hasAnyRole(["fleet_manager", "operations", "driver", "finance"])) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldX className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>You don't have permission to view vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Vehicle management requires appropriate permissions.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Go to Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <VehiclesManager />;
};

export default Vehicles;
