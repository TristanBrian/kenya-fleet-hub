import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Users, Wrench, AlertTriangle, TrendingUp, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    totalDrivers: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch vehicle stats
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("status");

      const { data: drivers } = await supabase
        .from("drivers")
        .select("id");

      if (vehicles) {
        setStats({
          totalVehicles: vehicles.length,
          activeVehicles: vehicles.filter(v => v.status === 'active').length,
          maintenanceVehicles: vehicles.filter(v => v.status === 'maintenance').length,
          totalDrivers: drivers?.length || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Vehicles",
      value: stats.totalVehicles,
      icon: Truck,
      description: "Registered fleet",
      color: "text-primary",
    },
    {
      title: "Active on Road",
      value: stats.activeVehicles,
      icon: MapPin,
      description: "Currently operating",
      color: "text-success",
    },
    {
      title: "In Maintenance",
      value: stats.maintenanceVehicles,
      icon: Wrench,
      description: "Under service",
      color: "text-warning",
    },
    {
      title: "Active Drivers",
      value: stats.totalDrivers,
      icon: Users,
      description: "Licensed drivers",
      color: "text-info",
    },
  ];

  const alerts = [
    {
      title: "Mombasa Road Traffic",
      description: "Heavy traffic reported near Mlolongo. Expected 30min delay.",
      type: "warning",
      icon: AlertTriangle,
    },
    {
      title: "Checkpoint Alert",
      description: "Police checkpoint active at Salgaa. Drivers advised to slow down.",
      type: "info",
      icon: MapPin,
    },
  ];

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Habari {profile?.full_name || 'Manager'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's your fleet overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-l-4 border-l-primary/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Route Alerts & Updates
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'warning' ? 'default' : 'default'} className="border-l-4 border-l-warning">
              <alert.icon className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              onClick={() => navigate("/vehicles")}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Truck className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold">View Vehicles</h3>
              <p className="text-sm text-muted-foreground">Track fleet location</p>
            </button>
            <button
              onClick={() => navigate("/drivers")}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Users className="h-6 w-6 text-info mb-2" />
              <h3 className="font-semibold">Manage Drivers</h3>
              <p className="text-sm text-muted-foreground">Driver performance</p>
            </button>
            <button
              onClick={() => navigate("/maintenance")}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Wrench className="h-6 w-6 text-warning mb-2" />
              <h3 className="font-semibold">Maintenance</h3>
              <p className="text-sm text-muted-foreground">Service schedules</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
