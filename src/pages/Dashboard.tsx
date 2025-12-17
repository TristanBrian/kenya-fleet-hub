import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Truck } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DriverDashboard } from "@/components/dashboard/DriverDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    setProfile(profileData);

    // Fetch user role from user_roles table
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .maybeSingle();

    setUserRole(roleData?.role || null);
    setLoading(false);
  };

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

  // Check if user is a driver
  const isDriver = userRole === "driver";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">
          {isDriver ? `Welcome, ${profile?.full_name || "Driver"}` : "Fleet Manager Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          {isDriver 
            ? "Your trips, vehicle, and performance overview" 
            : "Complete overview of your fleet operations"}
        </p>
      </div>

      {isDriver ? <DriverDashboard profile={profile} /> : <DashboardOverview />}
    </div>
  );
};

export default Dashboard;
