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

    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    }
    setProfile(profileData);
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch vehicle stats
      const { data: vehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("status");

      if (vehiclesError) {
        console.error("Error fetching vehicles:", vehiclesError);
      }

      const { data: drivers, error: driversError } = await supabase
        .from("drivers")
        .select("id");

      if (driversError) {
        console.error("Error fetching drivers:", driversError);
      }

      if (vehicles) {
        setStats({
          totalVehicles: vehicles.length,
          activeVehicles: vehicles.filter(v => v.status === 'active').length,
          maintenanceVehicles: vehicles.filter(v => v.status === 'maintenance').length,
          totalDrivers: drivers?.length || 0,
        });
      }

      // Set up real-time subscription for dashboard updates
      const channel = supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'vehicles'
          },
          () => {
            fetchDashboardData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'drivers'
          },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
          Karibu, {profile?.full_name || 'Manager'}! 🇰🇪
        </h1>
        <p className="text-lg text-primary font-medium mb-1">
          Safiri Smart Fleet - Usafiri Bora, Maisha Bora
        </p>
        <p className="text-muted-foreground">
          Executive Dashboard - Your fleet overview for today
        </p>
      </div>

      {/* Key Metrics - Enhanced */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-l-4 border-l-primary hover:shadow-lg transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
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

      {/* Monthly Performance Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Monthly Fuel Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 2,450,000</div>
            <p className="text-sm text-success flex items-center gap-1 mt-1">
              <span>↓ KES 380,000 saved</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Driver Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78% Average</div>
            <p className="text-sm text-muted-foreground mt-1">
              Top: Sarah Wanjiku (94%)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Route Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82% On-time</div>
            <p className="text-sm text-muted-foreground mt-1">
              Mombasa Route: 85%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kenyan Route Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Kenyan Route Overview
          </CardTitle>
          <CardDescription>Current status across major routes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">Nairobi-Mombasa</h3>
                  <p className="text-sm text-muted-foreground">8 vehicles</p>
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning">2 delays</Badge>
              </div>
              <p className="text-xs text-muted-foreground">85% on-time performance</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">Thika Super Highway</h3>
                  <p className="text-sm text-muted-foreground">6 vehicles</p>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success">All on time</Badge>
              </div>
              <p className="text-xs text-muted-foreground">92% on-time performance</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">Western Circuit</h3>
                  <p className="text-sm text-muted-foreground">7 vehicles</p>
                </div>
                <Badge variant="outline" className="bg-destructive/10 text-destructive">1 breakdown</Badge>
              </div>
              <p className="text-xs text-muted-foreground">72% on-time performance</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">Northern Route</h3>
                  <p className="text-sm text-muted-foreground">3 vehicles</p>
                </div>
                <Badge variant="outline" className="bg-warning/10 text-warning">Maintenance due</Badge>
              </div>
              <p className="text-xs text-muted-foreground">68% on-time performance</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <Alert className="border-l-4 border-l-info">
            <MapPin className="h-4 w-4" />
            <AlertTitle>M-Pesa Integration Update</AlertTitle>
            <AlertDescription>92% of payments now digital. Excellent adoption rate across the fleet.</AlertDescription>
          </Alert>
          <Alert className="border-l-4 border-l-primary">
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Fuel Price Update</AlertTitle>
            <AlertDescription>Current diesel price: KES 185/L in Nairobi. Consider bulk purchasing opportunities.</AlertDescription>
          </Alert>
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
              onClick={() => navigate("/live-tracking")}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <MapPin className="h-6 w-6 text-success mb-2" />
              <h3 className="font-semibold">Live Tracking</h3>
              <p className="text-sm text-muted-foreground">Real-time GPS monitoring</p>
            </button>
            <button
              onClick={() => navigate("/maintenance")}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <Wrench className="h-6 w-6 text-warning mb-2" />
              <h3 className="font-semibold">Maintenance</h3>
              <p className="text-sm text-muted-foreground">Service schedules</p>
            </button>
            <button
              onClick={() => navigate("/analytics")}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <TrendingUp className="h-6 w-6 text-info mb-2" />
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-muted-foreground">Financial reports</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
