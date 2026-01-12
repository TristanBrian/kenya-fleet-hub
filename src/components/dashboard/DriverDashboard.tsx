import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Truck, MapPin, TrendingUp, Fuel, Clock, 
  AlertTriangle, CheckCircle2, Star, Route,
  User, Phone, Mail, Shield, Calendar, Gauge,
  Award, Car, Settings, Save, Eye, EyeOff
} from "lucide-react";
import { format } from "date-fns";

interface DriverData {
  id: string;
  license_number: string;
  performance_score: number;
  total_trips: number;
  speeding_incidents: number;
  harsh_braking_events: number;
  idle_time_hours: number;
  vehicle?: {
    id: string;
    license_plate: string;
    vehicle_type: string;
    status: string;
    route_assigned: string | null;
    fuel_efficiency_kml: number;
    last_service_date: string | null;
    insurance_expiry: string | null;
    maintenance_status: string;
    current_latitude: number | null;
    current_longitude: number | null;
    last_location_update: string | null;
  } | null;
}

interface Trip {
  id: string;
  route: string;
  start_location: string;
  end_location: string;
  status: string;
  start_time: string;
  end_time: string | null;
  progress_percent: number;
  distance_km: number | null;
}

interface FuelLog {
  id: string;
  liters: number;
  total_cost_kes: number;
  route: string | null;
  created_at: string;
}

export const DriverDashboard = ({ profile }: { profile: any }) => {
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPassword, setShowPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDriverData();
  }, []);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.mobile_phone || "",
      });
    }
  }, [profile]);

  const fetchDriverData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch driver record with full vehicle info
    const { data: driver, error: driverError } = await supabase
      .from("drivers")
      .select(`
        *,
        vehicle:vehicles(
          id, license_plate, vehicle_type, status, route_assigned, 
          fuel_efficiency_kml, last_service_date, insurance_expiry,
          maintenance_status, current_latitude, current_longitude, last_location_update
        )
      `)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (driverError) {
      console.error("Error fetching driver:", driverError);
    }

    if (driver) {
      setDriverData(driver as any);

      // Fetch trips for this driver
      const { data: tripData } = await supabase
        .from("trips")
        .select("*")
        .eq("driver_id", driver.id)
        .order("start_time", { ascending: false })
        .limit(10);

      setTrips(tripData || []);

      // Fetch fuel logs for this driver
      const { data: fuelData } = await supabase
        .from("fuel_logs")
        .select("*")
        .eq("driver_id", driver.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setFuelLogs(fuelData || []);
    }

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          mobile_phone: profileForm.phone,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 95) return { label: "Bora Kabisa", variant: "default" as const, color: "bg-green-500" };
    if (score >= 85) return { label: "Mambo Poa", variant: "secondary" as const, color: "bg-blue-500" };
    if (score >= 70) return { label: "Sawa Sawa", variant: "outline" as const, color: "bg-yellow-500" };
    return { label: "Needs Improvement", variant: "destructive" as const, color: "bg-red-500" };
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      in_progress: "default",
      completed: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  const getMaintenanceStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      good: "default",
      needs_attention: "secondary",
      critical: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Truck className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!driverData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Driver Profile Not Found</h3>
          <p className="text-muted-foreground">
            Your driver profile has not been set up yet. Please contact your fleet manager.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeTrip = trips.find(t => t.status === "in_progress");
  const completedTripsCount = trips.filter(t => t.status === "completed").length;
  const scoreBadge = getScoreBadge(driverData.performance_score || 100);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="vehicle" className="gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">My Vehicle</span>
          </TabsTrigger>
          <TabsTrigger value="trips" className="gap-2">
            <Route className="h-4 w-4" />
            <span className="hidden sm:inline">Trips</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Performance Score with Badge */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Driver Rating
                  </CardTitle>
                  <CardDescription>Your overall performance score</CardDescription>
                </div>
                <Badge className={`${scoreBadge.color} text-white px-4 py-1 text-sm`}>
                  {scoreBadge.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className={`text-5xl font-bold ${getScoreColor(driverData.performance_score || 100)}`}>
                  {driverData.performance_score || 100}
                  <span className="text-2xl">%</span>
                </div>
                <div className="flex-1">
                  <Progress value={driverData.performance_score || 100} className="h-3" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Needs Improvement</span>
                    <span>Bora Kabisa</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                <Route className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{driverData.total_trips || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTripsCount} completed recently
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Speeding Incidents</CardTitle>
                <AlertTriangle className="h-5 w-5 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{driverData.speeding_incidents || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Keep it safe!</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Harsh Braking</CardTitle>
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{driverData.harsh_braking_events || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Smooth driving helps</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Idle Time</CardTitle>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{driverData.idle_time_hours || 0}h</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Trip */}
          {activeTrip && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary animate-pulse" />
                  Active Trip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{activeTrip.route}</p>
                      <p className="text-sm text-muted-foreground">
                        {activeTrip.start_location} → {activeTrip.end_location}
                      </p>
                    </div>
                    {getStatusBadge(activeTrip.status)}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{activeTrip.progress_percent}%</span>
                    </div>
                    <Progress value={activeTrip.progress_percent} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Started: {format(new Date(activeTrip.start_time), "PPp")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vehicle Tab */}
        <TabsContent value="vehicle" className="space-y-6 mt-6">
          {driverData.vehicle ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Assigned Vehicle Details
                  </CardTitle>
                  <CardDescription>Complete information about your assigned vehicle</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Car className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">License Plate</p>
                          <p className="font-semibold text-lg">{driverData.vehicle.license_plate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Truck className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Vehicle Type</p>
                          <p className="font-semibold">{driverData.vehicle.vehicle_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Route className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Assigned Route</p>
                          <p className="font-semibold">{driverData.vehicle.route_assigned || "No route assigned"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={driverData.vehicle.status === 'active' ? 'default' : 'secondary'}>
                            {driverData.vehicle.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Gauge className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Fuel Efficiency</p>
                          <p className="font-semibold">{driverData.vehicle.fuel_efficiency_kml} km/L</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Settings className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Maintenance Status</p>
                          {getMaintenanceStatusBadge(driverData.vehicle.maintenance_status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Service Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Last Service</span>
                      <span className="font-medium">
                        {driverData.vehicle.last_service_date 
                          ? format(new Date(driverData.vehicle.last_service_date), "PP")
                          : "Not recorded"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Insurance Expiry</span>
                      <span className="font-medium">
                        {driverData.vehicle.insurance_expiry 
                          ? format(new Date(driverData.vehicle.insurance_expiry), "PP")
                          : "Not recorded"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Current Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {driverData.vehicle.current_latitude && driverData.vehicle.current_longitude ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Coordinates</span>
                          <span className="font-mono text-sm">
                            {driverData.vehicle.current_latitude.toFixed(4)}, {driverData.vehicle.current_longitude.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Last Updated</span>
                          <span className="text-sm">
                            {driverData.vehicle.last_location_update 
                              ? format(new Date(driverData.vehicle.last_location_update), "Pp")
                              : "N/A"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Location data not available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Vehicle Assigned</h3>
                <p className="text-muted-foreground">
                  You currently don't have a vehicle assigned. Please contact your fleet manager.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trips Tab */}
        <TabsContent value="trips" className="space-y-6 mt-6">
          {/* Active Trip */}
          {activeTrip && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary animate-pulse" />
                  Active Trip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{activeTrip.route}</p>
                      <p className="text-sm text-muted-foreground">
                        {activeTrip.start_location} → {activeTrip.end_location}
                      </p>
                    </div>
                    {getStatusBadge(activeTrip.status)}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{activeTrip.progress_percent}%</span>
                    </div>
                    <Progress value={activeTrip.progress_percent} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Started: {format(new Date(activeTrip.start_time), "PPp")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Trips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Trips
              </CardTitle>
              <CardDescription>Your trip history</CardDescription>
            </CardHeader>
            <CardContent>
              {trips.length > 0 ? (
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{trip.route}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.start_location} → {trip.end_location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(trip.start_time), "PPp")}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(trip.status)}
                        {trip.distance_km && (
                          <p className="text-xs text-muted-foreground mt-1">{trip.distance_km} km</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Route className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No trips recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fuel Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5 text-primary" />
                Recent Fuel Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fuelLogs.length > 0 ? (
                <div className="space-y-3">
                  {fuelLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{log.liters} Liters</p>
                        <p className="text-sm text-muted-foreground">{log.route || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "PPp")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">KES {log.total_cost_kes?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Fuel className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No fuel logs recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Manage Account
              </CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="pl-10"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={profile?.email || ""}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="pl-10"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">Driver License</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="license"
                      value={driverData.license_number}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Contact fleet manager to update</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Driver Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your Stats
              </CardTitle>
              <CardDescription>Summary of your driving performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Star className={`h-8 w-8 mx-auto mb-2 ${getScoreColor(driverData.performance_score || 100)}`} />
                  <p className={`text-2xl font-bold ${getScoreColor(driverData.performance_score || 100)}`}>
                    {driverData.performance_score || 100}%
                  </p>
                  <p className="text-xs text-muted-foreground">Performance</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Route className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{driverData.total_trips || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Trips</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
                  <p className="text-2xl font-bold">{driverData.speeding_incidents || 0}</p>
                  <p className="text-xs text-muted-foreground">Incidents</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{driverData.idle_time_hours || 0}h</p>
                  <p className="text-xs text-muted-foreground">Idle Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Badge */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Your Driver Rating</h3>
                  <p className="text-muted-foreground text-sm">
                    Based on your performance score, trip completion, and driving behavior
                  </p>
                </div>
                <Badge className={`${scoreBadge.color} text-white px-6 py-2 text-lg`}>
                  {scoreBadge.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
