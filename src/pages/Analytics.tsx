import { useNavigate } from "react-router-dom";
import { AnalyticsView } from "@/components/dashboard/AnalyticsView";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

const Analytics = () => {
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

  if (!hasAnyRole(["fleet_manager", "finance"])) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldX className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>You don't have permission to view analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Analytics and reports are only available to Fleet Managers and Finance staff.
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

  return <AnalyticsView />;
};

export default Analytics;
