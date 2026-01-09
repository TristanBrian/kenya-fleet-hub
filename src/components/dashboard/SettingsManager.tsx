import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Settings, Link2, CheckCircle, XCircle, Map, Cloud, Database, ShieldAlert, Save, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/hooks/useRole";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const SettingsManager = () => {
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [newVehicleType, setNewVehicleType] = useState({ name: "", description: "" });
  const [newRoute, setNewRoute] = useState({ name: "", start_location: "", end_location: "", distance_km: "" });
  const { toast } = useToast();
  const { role, loading: roleLoading, isFleetManager } = useRole();

  // Mapbox token management
  const [mapboxToken, setMapboxToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [savingToken, setSavingToken] = useState(false);

  // Check if Mapbox is configured
  const isMapboxConfigured = () => {
    const envToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    const storedToken = localStorage.getItem('mapbox_token') || '';
    return (envToken.startsWith('pk.') || storedToken.startsWith('pk.'));
  };

  // API connection status
  const [apiStatus, setApiStatus] = useState({
    mapbox: { connected: false, name: "Mapbox", description: "Real-time GPS tracking and maps" },
    database: { connected: true, name: "Lovable Cloud", description: "Database and authentication" },
    weather: { connected: false, name: "Weather API", description: "Route weather conditions" },
    fuel: { connected: false, name: "Fuel Price API", description: "Live fuel prices in Kenya" },
  });

  useEffect(() => {
    fetchData();
    // Load existing Mapbox token for display
    const storedToken = localStorage.getItem('mapbox_token') || '';
    setMapboxToken(storedToken);
    
    // Update Mapbox status
    setApiStatus(prev => ({
      ...prev,
      mapbox: { ...prev.mapbox, connected: isMapboxConfigured() }
    }));
  }, []);

  const fetchData = async () => {
    const [typesRes, routesRes] = await Promise.all([
      supabase.from("vehicle_types").select("*").order("name"),
      supabase.from("routes_master").select("*").order("name"),
    ]);
    setVehicleTypes(typesRes.data || []);
    setRoutes(routesRes.data || []);
  };

  const handleSaveMapboxToken = () => {
    const token = mapboxToken.trim();
    if (!token) {
      toast({ 
        title: "Error", 
        description: "Please enter a token", 
        variant: "destructive" 
      });
      return;
    }
    
    if (!token.startsWith('pk.')) {
      toast({ 
        title: "Invalid Token", 
        description: "Mapbox public tokens must start with 'pk.' - secret tokens (sk.*) cannot be used in the browser.", 
        variant: "destructive" 
      });
      return;
    }

    setSavingToken(true);
    try {
      localStorage.setItem('mapbox_token', token);
      setApiStatus(prev => ({
        ...prev,
        mapbox: { ...prev.mapbox, connected: true }
      }));
      toast({ 
        title: "Mafanikio!", 
        description: "Mapbox token saved. Maps will now work across the application." 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save token", 
        variant: "destructive" 
      });
    } finally {
      setSavingToken(false);
    }
  };

  const handleRemoveMapboxToken = () => {
    localStorage.removeItem('mapbox_token');
    setMapboxToken('');
    setApiStatus(prev => ({
      ...prev,
      mapbox: { ...prev.mapbox, connected: false }
    }));
    toast({ 
      title: "Token Removed", 
      description: "Mapbox token has been removed." 
    });
  };

  const addVehicleType = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("vehicle_types").insert([newVehicleType]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mafanikio!", description: "Vehicle type added" });
      setNewVehicleType({ name: "", description: "" });
      fetchData();
    }
  };

  const deleteVehicleType = async (id: string) => {
    if (!confirm("Delete this vehicle type?")) return;
    const { error } = await supabase.from("vehicle_types").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mafanikio!", description: "Vehicle type deleted" });
      fetchData();
    }
  };

  const addRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...newRoute,
      distance_km: newRoute.distance_km ? parseFloat(newRoute.distance_km) : null,
    };
    const { error } = await supabase.from("routes_master").insert([payload]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mafanikio!", description: "Route added" });
      setNewRoute({ name: "", start_location: "", end_location: "", distance_km: "" });
      fetchData();
    }
  };

  const deleteRoute = async (id: string) => {
    if (!confirm("Delete this route?")) return;
    const { error } = await supabase.from("routes_master").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mafanikio!", description: "Route deleted" });
      fetchData();
    }
  };

  // Show loading state
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Block access for non-fleet managers
  if (!isFleetManager) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only Fleet Managers can access settings. Please contact your administrator if you need access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Fleet Settings</h2>
      </div>
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">
            <Link2 className="h-4 w-4 mr-2" />
            API Integrations
          </TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Types</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
        </TabsList>

        {/* API Integrations Tab */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* Mapbox Configuration Card */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  Mapbox Configuration
                </CardTitle>
                <CardDescription>
                  Configure Mapbox for real-time fleet tracking on maps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={apiStatus.mapbox.connected ? "default" : "secondary"}>
                    {apiStatus.mapbox.connected ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Not Configured</>
                    )}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mapbox-token">Mapbox Public Access Token</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Get your free public token from{" "}
                    <a 
                      href="https://account.mapbox.com/access-tokens/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Mapbox Dashboard
                    </a>
                    . Use a <strong>public token</strong> (starts with <code className="bg-muted px-1 rounded">pk.</code>)
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="mapbox-token"
                        type={showToken ? "text" : "password"}
                        placeholder="pk.eyJ1..."
                        value={mapboxToken}
                        onChange={(e) => setMapboxToken(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowToken(!showToken)}
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button onClick={handleSaveMapboxToken} disabled={savingToken}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {apiStatus.mapbox.connected && (
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm text-success font-medium">Maps are configured and ready</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveMapboxToken}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Other API Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Other Connected Services
                </CardTitle>
                <CardDescription>
                  Additional API connections for analytics and real-time data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(apiStatus)
                    .filter(([key]) => key !== 'mapbox')
                    .map(([key, api]) => (
                    <Card key={key} className={`border-l-4 ${api.connected ? "border-l-success" : "border-l-muted"}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {key === "database" && <Database className="h-4 w-4 text-primary" />}
                              {key === "weather" && <Cloud className="h-4 w-4 text-muted-foreground" />}
                              {key === "fuel" && <Settings className="h-4 w-4 text-muted-foreground" />}
                              <span className="font-semibold">{api.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{api.description}</p>
                          </div>
                          <Badge variant={api.connected ? "default" : "secondary"} className="flex items-center gap-1">
                            {api.connected ? (
                              <><CheckCircle className="h-3 w-3" /> Connected</>
                            ) : (
                              <><XCircle className="h-3 w-3" /> Not Connected</>
                            )}
                          </Badge>
                        </div>
                        {!api.connected && (
                          <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => toast({ title: "Coming Soon", description: "API integration will be available in future updates" })}>
                            Connect API
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Analytics Data Sources</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Analytics dashboards currently pull data from your connected Lovable Cloud database including:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Vehicles:</strong> Fleet status, locations, maintenance schedules</li>
                    <li>• <strong>Trips:</strong> Route performance, on-time delivery rates</li>
                    <li>• <strong>Fuel Logs:</strong> Consumption tracking, cost analysis</li>
                    <li>• <strong>Maintenance Logs:</strong> Service history, cost breakdowns</li>
                    <li>• <strong>Drivers:</strong> Performance scores, behavior metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vehicle Types Tab */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addVehicleType} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="vehicle-type-name">Type Name *</Label>
                  <Input
                    id="vehicle-type-name"
                    name="vehicle_type_name"
                    value={newVehicleType.name}
                    onChange={(e) => setNewVehicleType({ ...newVehicleType, name: e.target.value })}
                    placeholder="e.g., Truck - 15 Ton"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle-type-description">Description</Label>
                  <Input
                    id="vehicle-type-description"
                    name="vehicle_type_description"
                    value={newVehicleType.description}
                    onChange={(e) => setNewVehicleType({ ...newVehicleType, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Type
                  </Button>
                </div>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.description || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => deleteVehicleType(type.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Routes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={addRoute} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="route-name">Route Name *</Label>
                  <Input
                    id="route-name"
                    name="route_name"
                    value={newRoute.name}
                    onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                    placeholder="e.g., Nairobi-Mombasa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="route-start">Start Location *</Label>
                  <Input
                    id="route-start"
                    name="route_start_location"
                    value={newRoute.start_location}
                    onChange={(e) => setNewRoute({ ...newRoute, start_location: e.target.value })}
                    placeholder="e.g., Nairobi"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="route-end">End Location *</Label>
                  <Input
                    id="route-end"
                    name="route_end_location"
                    value={newRoute.end_location}
                    onChange={(e) => setNewRoute({ ...newRoute, end_location: e.target.value })}
                    placeholder="e.g., Mombasa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="route-distance">Distance (km)</Label>
                  <Input
                    id="route-distance"
                    name="route_distance"
                    type="number"
                    value={newRoute.distance_km}
                    onChange={(e) => setNewRoute({ ...newRoute, distance_km: e.target.value })}
                    placeholder="480"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Route
                  </Button>
                </div>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Name</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.name}</TableCell>
                      <TableCell>{route.start_location}</TableCell>
                      <TableCell>{route.end_location}</TableCell>
                      <TableCell>{route.distance_km ? `${route.distance_km} km` : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => deleteRoute(route.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
