import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { VehiclesManager } from "@/components/dashboard/VehiclesManager";
import { DriversManager } from "@/components/dashboard/DriversManager";
import { TripsManager } from "@/components/dashboard/TripsManager";
import { MaintenanceManager } from "@/components/dashboard/MaintenanceManager";
import { AnalyticsView } from "@/components/dashboard/AnalyticsView";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    }
    setProfile(profileData);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">
          Fleet Manager Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {profile?.full_name}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <VehiclesManager />
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <DriversManager />
        </TabsContent>

        <TabsContent value="trips" className="space-y-4">
          <TripsManager />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
